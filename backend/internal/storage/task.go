package storage

import (
	"context"
	"taskmanager-backend/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type TaskStorage struct {
	storage *MongoDBStorage
}

func NewTaskStorage(storage *MongoDBStorage) *TaskStorage {
	return &TaskStorage{storage: storage}
}

func (s *TaskStorage) GetTasksByProjectID(projectID string) ([]models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(projectID)
	if err != nil {
		return nil, err
	}

	cursor, err := s.storage.tasks.Find(ctx, bson.M{"projectId": objectID})
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

func (s *TaskStorage) GetTaskByID(id string) (*models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var task models.Task
	err = s.storage.tasks.FindOne(ctx, bson.M{"_id": objectID}).Decode(&task)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &task, nil
}

func (s *TaskStorage) CreateTask(task *models.Task) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	task.ID = primitive.NewObjectID()
	task.CreatedAt = time.Now()
	_, err := s.storage.tasks.InsertOne(ctx, task)
	return err
}

func (s *TaskStorage) UpdateTask(task *models.Task) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := s.storage.tasks.ReplaceOne(ctx, bson.M{"_id": task.ID}, task)
	return err
}

func (s *TaskStorage) DeleteTask(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = s.storage.tasks.DeleteOne(ctx, bson.M{"_id": objectID})
	return err
}
