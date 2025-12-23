package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"podcast-backend/internal/auth"
	"podcast-backend/internal/repository"
)

type AuthHandler struct {
	users      *repository.UserRepository
	jwtService *auth.JWTService
}

func NewAuthHandler(users *repository.UserRepository, jwt *auth.JWTService) *AuthHandler {
	return &AuthHandler{users: users, jwtService: jwt}
}

func (h *AuthHandler) Register(r *gin.Engine) {
	api := r.Group("/api/auth")
	{
		api.POST("/register", h.register)
		api.POST("/login", h.login)
	}
}

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) register(c *gin.Context) {
	ctx := c.Request.Context()
	var req registerRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if req.Name == "" || req.Email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name, email, password required"})
		return
	}
	user, err := h.users.Create(ctx, req.Name, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}
	token, err := h.jwtService.Generate(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token error"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"token": token, "user": user})
}

func (h *AuthHandler) login(c *gin.Context) {
	ctx := c.Request.Context()
	var req loginRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if req.Email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password required"})
		return
	}
	user, err := h.users.FindByEmail(ctx, req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if user == nil || !h.users.CheckPassword(user, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	token, err := h.jwtService.Generate(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

