package main

import (
	"log"
	"os"
	"time"

	"taskmanager-backend/internal/handlers"
	"taskmanager-backend/internal/middleware"
	"taskmanager-backend/internal/storage"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	mongoURI := getEnv("MONGODB_URI", "mongodb://mongodb:27017")
	dbName := getEnv("DB_NAME", "taskmanager")
	jwtSecret := getEnv("JWT_SECRET", "your-secret-key-change-in-production")

	os.Setenv("JWT_SECRET", jwtSecret)

	var storageInstance *storage.MongoDBStorage
	maxRetries := 10
	retryDelay := 3 * time.Second

	for i := 0; i < maxRetries; i++ {
		var err error
		storageInstance, err = storage.NewMongoDBStorage(mongoURI, dbName)
		if err == nil {
			break
		}

		log.Printf("Failed to connect to MongoDB (attempt %d/%d): %v", i+1, maxRetries, err)
		if i < maxRetries-1 {
			log.Printf("Retrying in %v...", retryDelay)
			time.Sleep(retryDelay)
		} else {
			log.Fatal("Failed to connect to MongoDB after multiple attempts")
		}
	}

	defer storageInstance.Close()

	projectHandler := handlers.NewProjectHandler(storageInstance)
	taskHandler := handlers.NewTaskHandler(storageInstance)
	authHandler := handlers.NewAuthHandler(storageInstance.UserStorage)
	userHandler := handlers.NewUserHandler(storageInstance.UserStorage)

	graphqlHandler, err := handlers.NewGraphQLHandler(storageInstance)
	if err != nil {
		log.Printf("Warning: Failed to initialize GraphQL: %v", err)
	}

	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "X-Requested-With"}
	router.Use(cors.New(config))

	api := router.Group("/api/v1")

	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/profile", authHandler.GetProfile)

		projects := protected.Group("/projects")
		{
			projects.GET("", projectHandler.GetProjects)
			projects.GET("/:id", projectHandler.GetProject)
			projects.GET("/:id/export", projectHandler.ExportProject)
			projects.POST("", projectHandler.CreateProject)
			projects.PUT("/:id", projectHandler.UpdateProject)
			projects.DELETE("/:id", projectHandler.DeleteProject)
		}

		tasks := protected.Group("/tasks")
		{
			tasks.GET("/project/:projectId", taskHandler.GetTasksByProject)
			tasks.GET("/:id", taskHandler.GetTask)
			tasks.POST("", taskHandler.CreateTask)
			tasks.PUT("/:id", taskHandler.UpdateTask)
			tasks.DELETE("/:id", taskHandler.DeleteTask)
		}

		admin := protected.Group("/admin")
		admin.Use(middleware.RoleMiddleware("admin"))
		{
			admin.GET("/users", userHandler.GetAllUsers)
			admin.PUT("/users/:id/role", userHandler.UpdateUserRole)
		}

		moderator := protected.Group("/moderator")
		moderator.Use(middleware.RoleMiddleware("moderator", "admin"))
		{

		}

		if graphqlHandler != nil {
			protected.POST("/graphql", graphqlHandler.GraphQL)
		}
	}

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "database": "mongodb"})
	})

	log.Println("Server starting on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
