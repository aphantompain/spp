package storage

import (
	"context"
	"log"
	"taskmanager-backend/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDBStorage struct {
	client         *mongo.Client
	database       *mongo.Database
	projects       *mongo.Collection
	tasks          *mongo.Collection
	users          *mongo.Collection
	UserStorage    *UserStorage
	ProjectStorage *ProjectStorage
	TaskStorage    *TaskStorage
}

func NewMongoDBStorage(connectionString, dbName string) (*MongoDBStorage, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(connectionString)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, err
	}

	database := client.Database(dbName)

	storage := &MongoDBStorage{
		client:   client,
		database: database,
		projects: database.Collection("projects"),
		tasks:    database.Collection("tasks"),
		users:    database.Collection("users"),
	}

	storage.UserStorage = NewUserStorage(database)
	storage.ProjectStorage = NewProjectStorage(storage)
	storage.TaskStorage = NewTaskStorage(storage)

	createIndexes(ctx, storage.projects, storage.tasks, storage.users)
	storage.seedData(ctx)

	log.Println("Successfully connected to MongoDB")
	return storage, nil
}

func (s *MongoDBStorage) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.client.Disconnect(ctx)
}

func createIndexes(ctx context.Context, projects, tasks, users *mongo.Collection) {
	users.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})

	projects.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "title", Value: 1}},
	})

	tasks.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "projectId", Value: 1}},
	})
	tasks.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "status", Value: 1}},
	})
}

func (s *MongoDBStorage) seedData(ctx context.Context) {
	count, err := s.projects.CountDocuments(ctx, bson.M{})
	if err != nil || count > 0 {
		return
	}

	adminUser := models.User{
		ID:        primitive.NewObjectID(),
		Email:     "admin@example.com",
		Password:  "admin123",
		FirstName: "Admin",
		LastName:  "User",
		Role:      "admin",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	adminUser.HashPassword()

	project := models.Project{
		ID:          primitive.NewObjectID(),
		Title:       "Тестовый проект",
		Description: "Проект для тестирования MongoDB",
		Status:      "active",
		CreatedAt:   time.Now(),
	}

	dueDate1 := time.Now().AddDate(0, 0, 7)
	dueDate2 := time.Now().AddDate(0, 0, 3)

	task1 := models.Task{
		ID:          primitive.NewObjectID(),
		Content:     "Тестовая задача с описанием",
		Description: "Это тестовое описание для MongoDB",
		Status:      "todo",
		Priority:    "high",
		Assignee:    "Тестовый исполнитель",
		CreatedAt:   time.Now(),
		DueDate:     &dueDate1,
		ProjectID:   project.ID,
	}

	task2 := models.Task{
		ID:          primitive.NewObjectID(),
		Content:     "Вторая тестовая задача",
		Description: "Еще одно описание для проверки MongoDB",
		Status:      "inProgress",
		Priority:    "medium",
		Assignee:    "Другой исполнитель",
		CreatedAt:   time.Now(),
		DueDate:     &dueDate2,
		ProjectID:   project.ID,
	}

	_, err = s.users.InsertOne(ctx, adminUser)
	if err != nil {
		log.Printf("Failed to seed admin user: %v", err)
	}

	_, err = s.projects.InsertOne(ctx, project)
	if err != nil {
		log.Printf("Failed to seed project: %v", err)
		return
	}

	_, err = s.tasks.InsertMany(ctx, []interface{}{task1, task2})
	if err != nil {
		log.Printf("Failed to seed tasks: %v", err)
		return
	}

	log.Println("Test data seeded successfully")
	log.Println("Admin user: admin@example.com / admin123")
}
