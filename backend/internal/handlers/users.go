package handlers

import (
	"net/http"
	"taskmanager-backend/internal/models"
	"taskmanager-backend/internal/storage"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserHandler struct {
	userStorage *storage.UserStorage
}

func NewUserHandler(userStorage *storage.UserStorage) *UserHandler {
	return &UserHandler{userStorage: userStorage}
}

func (h *UserHandler) GetAllUsers(c *gin.Context) {
	users, err := h.userStorage.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var userResponses []*models.UserResponse
	for _, user := range users {
		userResponses = append(userResponses, user.ToResponse())
	}

	c.JSON(http.StatusOK, userResponses)
}

func (h *UserHandler) UpdateUserRole(c *gin.Context) {
	userID := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		Role string `json:"role" binding:"required,oneof=user moderator admin"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userStorage.GetUserByID(objectID)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.Role = req.Role
	if err := h.userStorage.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User role updated successfully",
		"user":    user.ToResponse(),
	})
}
