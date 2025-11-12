package models

import (
	"time"
)

type Task struct {
	ID          string     `json:"id"`
	Content     string     `json:"content"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	Assignee    string     `json:"assignee"`
	CreatedAt   time.Time  `json:"createdAt"`
	DueDate     *time.Time `json:"dueDate,omitempty"`
	ProjectID   string     `json:"projectId"`
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
