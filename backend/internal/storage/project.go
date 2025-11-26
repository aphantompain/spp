package storage

import (
	"context"
	"log"
	"taskmanager-backend/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ProjectStorage struct {
	storage *MongoDBStorage
}

func NewProjectStorage(storage *MongoDBStorage) *ProjectStorage {
	return &ProjectStorage{storage: storage}
}

func (s *ProjectStorage) GetAllProjects() ([]models.Project, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := s.storage.projects.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var projects []models.Project
	if err := cursor.All(ctx, &projects); err != nil {
		return nil, err
	}

	for i := range projects {
		tasks, err := s.storage.TaskStorage.GetTasksByProjectID(projects[i].ID.Hex())
		if err != nil {
			return nil, err
		}
		projects[i].Tasks = tasks
	}

	return projects, nil
}

func (s *ProjectStorage) GetProjectByID(id string) (*models.Project, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if id == "" {
		return nil, mongo.ErrNoDocuments
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var project models.Project
	err = s.storage.projects.FindOne(ctx, bson.M{"_id": objectID}).Decode(&project)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	tasks, err := s.storage.TaskStorage.GetTasksByProjectID(id)
	if err != nil {
		return nil, err
	}
	project.Tasks = tasks

	return &project, nil
}

func (s *ProjectStorage) CreateProject(project *models.Project) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	project.ID = primitive.NewObjectID()
	project.CreatedAt = time.Now()
	_, err := s.storage.projects.InsertOne(ctx, project)
	return err
}

func (s *ProjectStorage) UpdateProject(project *models.Project) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := s.storage.projects.ReplaceOne(ctx, bson.M{"_id": project.ID}, project)
	return err
}

func (s *ProjectStorage) DeleteProject(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = s.storage.projects.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		return err
	}

	_, err = s.storage.tasks.DeleteMany(ctx, bson.M{"projectId": objectID})
	return err
}

func (s *ProjectStorage) GetProjectsByUser(userID primitive.ObjectID) ([]models.Project, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := s.storage.projects.Find(ctx, bson.M{"ownerId": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var projects []models.Project
	if err := cursor.All(ctx, &projects); err != nil {
		return nil, err
	}

	for i := range projects {
		tasks, err := s.storage.TaskStorage.GetTasksByProjectID(projects[i].ID.Hex())
		if err != nil {
			log.Printf("Error loading tasks for project %s: %v", projects[i].ID.Hex(), err)
			continue
		}
		projects[i].Tasks = tasks
	}

	return projects, nil
}
