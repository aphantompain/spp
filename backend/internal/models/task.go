// internal/models/task.go
package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Task struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Content     string             `json:"content" bson:"content"`
	Description string             `json:"description" bson:"description"`
	Status      string             `json:"status" bson:"status"`
	Priority    string             `json:"priority" bson:"priority"`
	Assignee    string             `json:"assignee" bson:"assignee"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	DueDate     *time.Time         `json:"dueDate,omitempty" bson:"dueDate,omitempty"`
	ProjectID   primitive.ObjectID `json:"projectId" bson:"projectId"`
}

type CreateTaskRequest struct {
	Content     string `json:"content" binding:"required"`
	Description string `json:"description"`
	Status      string `json:"status"`
	Priority    string `json:"priority"`
	Assignee    string `json:"assignee"`
	DueDate     string `json:"dueDate,omitempty"`
	ProjectID   string `json:"projectId" binding:"required"`
}

type UpdateTaskRequest struct {
	Content     string `json:"content"`
	Description string `json:"description"`
	Status      string `json:"status"`
	Priority    string `json:"priority"`
	Assignee    string `json:"assignee"`
	DueDate     string `json:"dueDate,omitempty"`
}
