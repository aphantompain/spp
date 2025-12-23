package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"podcast-backend/internal/events"
	"podcast-backend/internal/models"
	"podcast-backend/internal/repository"
)

type EpisodeHandler struct {
	repo *repository.EpisodeRepository
	events *events.Hub
}

func NewEpisodeHandler(repo *repository.EpisodeRepository, hub *events.Hub) *EpisodeHandler {
	return &EpisodeHandler{repo: repo, events: hub}
}

// Register expects a router group already mounted at "/api"
func (h *EpisodeHandler) Register(r *gin.RouterGroup) {
	r.PUT("/episodes/:id", h.update)
	r.DELETE("/episodes/:id", h.delete)
	r.POST("/episodes/:id/like", h.toggleLike)
	r.GET("/me/episode-likes", h.myLikes)
}

func (h *EpisodeHandler) update(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.GetUint("userID")
	id, err := parseID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var req models.Episode
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	updated, err := h.repo.Update(ctx, id, &req, userID)
	if err != nil {
		if err.Error() == "forbidden" {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if updated == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, updated)
	// notify clients that episode metadata changed
	if h.events != nil {
		h.events.Broadcast("episode_updated", updated)
	}
}

func (h *EpisodeHandler) delete(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.GetUint("userID")
	id, err := parseID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.repo.Delete(ctx, id, userID); err != nil {
		if err.Error() == "forbidden" {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
	if h.events != nil {
		h.events.Broadcast("episode_deleted", gin.H{"episodeId": id})
	}
}

func (h *EpisodeHandler) toggleLike(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.GetUint("userID")
	id, err := parseID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	count, _, err := h.repo.ToggleLike(ctx, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"likes": count})
	if h.events != nil {
		h.events.Broadcast("episode_likes", gin.H{"episodeId": id, "likes": count})
	}
}

func (h *EpisodeHandler) myLikes(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.GetUint("userID")
	ids, err := h.repo.LikedEpisodeIDs(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, ids)
}

