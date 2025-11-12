package handlers

import (
	"net/http"
	"taskmanager-backend/internal/models"
	"taskmanager-backend/internal/storage"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TaskHandler struct {
	storage *storage.Storage
}

func NewTaskHandler(storage *storage.Storage) *TaskHandler {
	return &TaskHandler{storage: storage}
}

func parseDate(dateStr string) (*time.Time, error) {
	if dateStr == "" {
		return nil, nil
	}

	formats := []string{
		"2006-01-02",
		"2006-01-02T15:04:05Z",
		time.RFC3339,
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return &t, nil
		}
	}

	return nil, nil
}

func (h *TaskHandler) GetTasksByProject(c *gin.Context) {
	projectID := c.Param("projectId")

	tasks, err := h.storage.GetTasksByProjectID(projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

func (h *TaskHandler) GetTask(c *gin.Context) {
	id := c.Param("id")

	task, err := h.storage.GetTaskByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if task == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	c.JSON(http.StatusOK, task)
}

func (h *TaskHandler) CreateTask(c *gin.Context) {
	var req models.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project, err := h.storage.GetProjectByID(req.ProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if project == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project not found"})
		return
	}

	var dueDate *time.Time
	if req.DueDate != "" {
		parsedDate, err := parseDate(req.DueDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		dueDate = parsedDate
	}

	task := &models.Task{
		ID:          uuid.New().String(),
		Content:     req.Content,
		Description: req.Description,
		Status:      req.Status,
		Priority:    req.Priority,
		Assignee:    req.Assignee,
		CreatedAt:   time.Now(),
		DueDate:     dueDate,
		ProjectID:   req.ProjectID,
	}

	if task.Status == "" {
		task.Status = "todo"
	}
	if task.Priority == "" {
		task.Priority = "medium"
	}

	if err := h.storage.CreateTask(task); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, task)
}

func (h *TaskHandler) UpdateTask(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	existingTask, err := h.storage.GetTaskByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if existingTask == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	if req.Content != "" {
		existingTask.Content = req.Content
	}
	if req.Description != "" {
		existingTask.Description = req.Description
	}
	if req.Status != "" {
		existingTask.Status = req.Status
	}
	if req.Priority != "" {
		existingTask.Priority = req.Priority
	}
	if req.Assignee != "" {
		existingTask.Assignee = req.Assignee
	}

	if req.DueDate != "" {
		parsedDate, err := parseDate(req.DueDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		existingTask.DueDate = parsedDate
	} else if req.DueDate == "" {
		existingTask.DueDate = nil
	}

	if err := h.storage.UpdateTask(existingTask); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, existingTask)
}

func (h *TaskHandler) DeleteTask(c *gin.Context) {
	id := c.Param("id")

	existingTask, err := h.storage.GetTaskByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if existingTask == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	if err := h.storage.DeleteTask(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}
