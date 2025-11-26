// cmd/server/main.go
package main

import (
	"log"
	"os"
	"taskmanager-backend/internal/handlers"
	"taskmanager-backend/internal/storage"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Получаем настройки из переменных окружения
	mongoURI := getEnv("MONGODB_URI", "mongodb://localhost:27017")
	dbName := getEnv("DB_NAME", "taskmanager")

	// Инициализация хранилища MongoDB с повторными попытками
	var storageInstance *storage.MongoDBStorage
	var err error

	for i := 0; i < 5; i++ {
		log.Printf("Attempting to connect to MongoDB (attempt %d)...", i+1)
		storageInstance, err = storage.NewMongoDBStorage(mongoURI, dbName)
		if err == nil {
			break
		}

		log.Printf("Failed to connect to MongoDB: %v", err)
		if i < 4 {
			log.Println("Retrying in 5 seconds...")
			time.Sleep(5 * time.Second)
		}
	}

	if err != nil {
		log.Fatal("Failed to connect to MongoDB after 5 attempts:", err)
	}
	defer storageInstance.Close()

	log.Println("Successfully connected to MongoDB!")

	// Инициализация обработчиков
	projectHandler := handlers.NewProjectHandler(storageInstance)
	taskHandler := handlers.NewTaskHandler(storageInstance)

	// Создание роутера
	router := gin.Default()

	// Настройка CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(config))

	// Группа API
	api := router.Group("/api/v1")

	// Маршруты для проектов
	projects := api.Group("/projects")
	{
		projects.GET("", projectHandler.GetProjects)
		projects.GET("/:id", projectHandler.GetProject)
		projects.POST("", projectHandler.CreateProject)
		projects.PUT("/:id", projectHandler.UpdateProject)
		projects.DELETE("/:id", projectHandler.DeleteProject)
	}

	// Маршруты для задач
	tasks := api.Group("/tasks")
	{
		tasks.GET("/project/:projectId", taskHandler.GetTasksByProject)
		tasks.GET("/:id", taskHandler.GetTask)
		tasks.POST("", taskHandler.CreateTask)
		tasks.PUT("/:id", taskHandler.UpdateTask)
		tasks.DELETE("/:id", taskHandler.DeleteTask)
	}

	// Health check с проверкой БД
	router.GET("/health", func(c *gin.Context) {
		// Проверяем подключение к БД
		_, err := storageInstance.GetAllProjects()
		if err != nil {
			c.JSON(500, gin.H{
				"status":   "error",
				"database": "disconnected",
				"error":    err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{
			"status":   "ok",
			"database": "connected",
		})
	})

	// Запуск сервера
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
