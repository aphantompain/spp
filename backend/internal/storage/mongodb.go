// internal/storage/mongodb.go
package storage

import (
	"context"
	"errors"
	"fmt"
	"log"
	"taskmanager-backend/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDBStorage struct {
	client   *mongo.Client
	database *mongo.Database
	projects *mongo.Collection
	tasks    *mongo.Collection
}

func NewMongoDBStorage(connectionString, dbName string) (*MongoDBStorage, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(connectionString))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	// Проверяем подключение
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %v", err)
	}

	database := client.Database(dbName)
	projects := database.Collection("projects")
	tasks := database.Collection("tasks")

	// Создаем индексы
	createIndexes(ctx, projects, tasks)

	storage := &MongoDBStorage{
		client:   client,
		database: database,
		projects: projects,
		tasks:    tasks,
	}

	// Добавляем тестовые данные
	storage.seedData(ctx)

	log.Println("Successfully connected to MongoDB")
	return storage, nil
}

func createIndexes(ctx context.Context, projects *mongo.Collection, tasks *mongo.Collection) {
	// Индекс для проектов
	projects.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "title", Value: 1}},
	})

	// Индекс для задач по projectId для быстрого поиска
	tasks.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "projectId", Value: 1}},
	})

	// Индекс для задач по статусу
	tasks.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "status", Value: 1}},
	})
}

func (s *MongoDBStorage) seedData(ctx context.Context) {
	// Проверяем, есть ли уже данные
	count, err := s.projects.CountDocuments(ctx, bson.M{})
	if err != nil || count > 0 {
		return
	}

	// Создаем тестовый проект
	project := models.Project{
		ID:          primitive.NewObjectID(),
		Title:       "Тестовый проект",
		Description: "Проект для тестирования MongoDB",
		Status:      "active",
		CreatedAt:   time.Now(),
	}

	// Создаем тестовые задачи
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

	// Сохраняем проект
	_, err = s.projects.InsertOne(ctx, project)
	if err != nil {
		log.Printf("Failed to seed project: %v", err)
		return
	}

	// Сохраняем задачи
	_, err = s.tasks.InsertMany(ctx, []interface{}{task1, task2})
	if err != nil {
		log.Printf("Failed to seed tasks: %v", err)
		return
	}

	log.Println("Test data seeded successfully")
}

func (s *MongoDBStorage) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.client.Disconnect(ctx)
}

// Project methods
func (s *MongoDBStorage) GetAllProjects() ([]models.Project, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := s.projects.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var projects []models.Project
	if err := cursor.All(ctx, &projects); err != nil {
		return nil, err
	}

	// Загружаем задачи для каждого проекта
	for i := range projects {
		tasks, err := s.GetTasksByProjectID(projects[i].ID.Hex())
		if err != nil {
			return nil, err
		}
		projects[i].Tasks = tasks
	}

	return projects, nil
}

func (s *MongoDBStorage) GetProjectByID(id string) (*models.Project, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid project ID")
	}

	var project models.Project
	err = s.projects.FindOne(ctx, bson.M{"_id": objectID}).Decode(&project)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	// Загружаем задачи проекта
	tasks, err := s.GetTasksByProjectID(id)
	if err != nil {
		return nil, err
	}
	project.Tasks = tasks

	return &project, nil
}

func (s *MongoDBStorage) CreateProject(project *models.Project) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	project.ID = primitive.NewObjectID()
	project.CreatedAt = time.Now()

	_, err := s.projects.InsertOne(ctx, project)
	return err
}

func (s *MongoDBStorage) UpdateProject(project *models.Project) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := s.projects.ReplaceOne(ctx, bson.M{"_id": project.ID}, project)
	return err
}

func (s *MongoDBStorage) DeleteProject(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid project ID")
	}

	// Удаляем проект
	_, err = s.projects.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		return err
	}

	// Удаляем все задачи проекта
	_, err = s.tasks.DeleteMany(ctx, bson.M{"projectId": objectID})
	return err
}

// Task methods
func (s *MongoDBStorage) GetTasksByProjectID(projectID string) ([]models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(projectID)
	if err != nil {
		return nil, errors.New("invalid project ID")
	}

	cursor, err := s.tasks.Find(ctx, bson.M{"projectId": objectID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var tasks []models.Task
	if err := cursor.All(ctx, &tasks); err != nil {
		return nil, err
	}

	return tasks, nil
}

func (s *MongoDBStorage) GetTaskByID(id string) (*models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid task ID")
	}

	var task models.Task
	err = s.tasks.FindOne(ctx, bson.M{"_id": objectID}).Decode(&task)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &task, nil
}

func (s *MongoDBStorage) CreateTask(task *models.Task) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	task.ID = primitive.NewObjectID()
	task.CreatedAt = time.Now()

	_, err := s.tasks.InsertOne(ctx, task)
	return err
}

func (s *MongoDBStorage) UpdateTask(task *models.Task) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := s.tasks.ReplaceOne(ctx, bson.M{"_id": task.ID}, task)
	return err
}

func (s *MongoDBStorage) DeleteTask(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid task ID")
	}

	_, err = s.tasks.DeleteOne(ctx, bson.M{"_id": objectID})
	return err
}
