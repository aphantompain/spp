package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"podcast-backend/internal/repository"
)

type UserContentHandler struct {
	content *repository.UserContentRepository
}

func NewUserContentHandler(content *repository.UserContentRepository) *UserContentHandler {
	return &UserContentHandler{content: content}
}

func (h *UserContentHandler) Register(r gin.IRoutes) {
	r.GET("/api/me/favorites", h.favorites)
	r.POST("/api/podcasts/:id/favorite", h.toggleFavorite)

	r.GET("/api/me/library", h.library)
	r.POST("/api/podcasts/:id/library", h.toggleLibrary)
}

func (h *UserContentHandler) favorites(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.GetUint("userID")
	items, err := h.content.Favorites(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}

func (h *UserContentHandler) toggleFavorite(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.GetUint("userID")
	podcastID, err := parseID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	added, err := h.content.ToggleFavorite(ctx, userID, podcastID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"favorite": added})
}

func (h *UserContentHandler) library(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.GetUint("userID")
	items, err := h.content.Library(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}

func (h *UserContentHandler) toggleLibrary(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.GetUint("userID")
	podcastID, err := parseID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	added, err := h.content.ToggleLibrary(ctx, userID, podcastID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"inLibrary": added})
}

