package handlers

import (
	"net/http"
	"taskmanager-backend/internal/export"
	"taskmanager-backend/internal/middleware"
	"taskmanager-backend/internal/models"
	"taskmanager-backend/internal/storage"
	"time"

	"github.com/gin-gonic/gin"
)

type ProjectHandler struct {
	projectStorage *storage.ProjectStorage
}

func NewProjectHandler(storage *storage.MongoDBStorage) *ProjectHandler {
	return &ProjectHandler{projectStorage: storage.ProjectStorage}
}

func (h *ProjectHandler) GetProjects(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	projects, err := h.projectStorage.GetProjectsByUser(userID) // Используем правильный метод
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, projects)
}

func (h *ProjectHandler) GetProject(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
		return
	}

	project, err := h.projectStorage.GetProjectByID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID: " + err.Error()})
		return
	}

	if project == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	if project.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, project)
}

func (h *ProjectHandler) CreateProject(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var req models.CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project := &models.Project{
		Title:       req.Title,
		Description: req.Description,
		Status:      req.Status,
		OwnerID:     userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		Tasks:       []models.Task{},
	}

	if project.Status == "" {
		project.Status = "active"
	}

	if err := h.projectStorage.CreateProject(project); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, project)
}

func (h *ProjectHandler) UpdateProject(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	id := c.Param("id")

	var req models.UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	existingProject, err := h.projectStorage.GetProjectByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if existingProject == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	if existingProject.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if req.Title != "" {
		existingProject.Title = req.Title
	}
	if req.Description != "" {
		existingProject.Description = req.Description
	}
	if req.Status != "" {
		existingProject.Status = req.Status
	}

	existingProject.UpdatedAt = time.Now()

	if err := h.projectStorage.UpdateProject(existingProject); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, existingProject)
}

func (h *ProjectHandler) DeleteProject(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	id := c.Param("id")

	existingProject, err := h.projectStorage.GetProjectByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if existingProject == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	if existingProject.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err := h.projectStorage.DeleteProject(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}

func (h *ProjectHandler) ExportProject(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
		return
	}

	format := c.Query("format")
	if format == "" {
		format = "excel"
	}

	project, err := h.projectStorage.GetProjectByID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID: " + err.Error()})
		return
	}

	if project == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	if project.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var fileData []byte
	var contentType string
	var filename string

	switch format {
	case "word", "docx":
		buf, err := export.ExportProjectToWord(project)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to export project: " + err.Error()})
			return
		}
		fileData = buf.Bytes()
		contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
		filename = project.Title + ".doc"
	case "excel", "xlsx":
		fallthrough
	default:
		buf, err := export.ExportProjectToExcel(project)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to export project: " + err.Error()})
			return
		}
		fileData = buf.Bytes()
		contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		filename = project.Title + ".xlsx"
	}

	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(http.StatusOK, contentType, fileData)
}
