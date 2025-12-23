package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"

	"podcast-backend/internal/auth"
	"podcast-backend/internal/config"
	"podcast-backend/internal/db"
	"podcast-backend/internal/events"
	"podcast-backend/internal/handlers"
	"podcast-backend/internal/middleware"
	"podcast-backend/internal/models"
	"podcast-backend/internal/repository"
	"podcast-backend/internal/seed"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()

	// DB
	pg := db.Connect(cfg.PostgresURL)
	if err := pg.AutoMigrate(&models.User{}, &models.Podcast{}, &models.Episode{}, &models.EpisodeLike{}, &models.Favorite{}, &models.LibraryItem{}); err != nil {
		log.Fatalf("failed to migrate: %v", err)
	}
	seed.Run(pg)

	// Redis (optional)
	var redisClient *redis.Client
	if cfg.RedisEnabled {
		redisClient = redis.NewClient(&redis.Options{
			Addr:     cfg.RedisAddr,
			Password: cfg.RedisPass,
		})
		if err := pingRedis(redisClient); err != nil {
			log.Printf("redis unavailable, continue without cache: %v", err)
			redisClient = nil
		}
	}

	podcastRepo := repository.NewPodcastRepository(pg, redisClient)
	userRepo := repository.NewUserRepository(pg)
	contentRepo := repository.NewUserContentRepository(pg)
	episodeRepo := repository.NewEpisodeRepository(pg)
	jwtService := auth.NewJWTService(getJWTSecret(), 72*time.Hour)
	eventsHub := events.NewHub(jwtService)

	router := setupRouter(podcastRepo, userRepo, contentRepo, episodeRepo, jwtService, eventsHub)

	addr := ":" + cfg.Port
	log.Printf("starting server on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}

func setupRouter(podcastRepo *repository.PodcastRepository, userRepo *repository.UserRepository, contentRepo *repository.UserContentRepository, episodeRepo *repository.EpisodeRepository, jwtService *auth.JWTService, eventsHub *events.Hub) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
	}))

	// Health root
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// SSE events (authenticated by token in query string)
	r.GET("/api/events", eventsHub.Handler)

	authHandler := handlers.NewAuthHandler(userRepo, jwtService)
	authHandler.Register(r)

	podcastHandler := handlers.NewPodcastHandler(podcastRepo)
	contentHandler := handlers.NewUserContentHandler(contentRepo)
	episodeHandler := handlers.NewEpisodeHandler(episodeRepo, eventsHub)

	// Protected routes
	protected := r.Group("/")
	protected.Use(middleware.AuthRequired(jwtService))
	{
		api := protected.Group("/api")
		{
			api.POST("/podcasts", podcastHandler.Create)
			api.PUT("/podcasts/:id", podcastHandler.Update)
			api.DELETE("/podcasts/:id", podcastHandler.Delete)
			api.POST("/podcasts/:id/episodes", podcastHandler.AddEpisode)

			// routes under /api/episodes..., /api/me/episode-likes
			episodeHandler.Register(api)

			// user-specific content routes under /api/...
			contentHandler.Register(protected)
		}
	}

	// Public routes
	podcastHandler.Register(r)

	return r
}

func pingRedis(client *redis.Client) error {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	return client.Ping(ctx).Err()
}

func getJWTSecret() string {
	secret := config.MustGetEnv("JWT_SECRET")
	return secret
}

