package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"podcast-backend/internal/repository"
	"podcast-backend/internal/models"
)

type PodcastHandler struct {
	repo *repository.PodcastRepository
}

func NewPodcastHandler(repo *repository.PodcastRepository) *PodcastHandler {
	return &PodcastHandler{repo: repo}
}

func (h *PodcastHandler) Register(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.GET("/health", h.health)
		api.GET("/podcasts", h.list)
		api.GET("/podcasts/search", h.search)
		api.GET("/podcasts/:id", h.get)
		api.GET("/podcasts/:id/episodes", h.episodes)
	}
}

func (h *PodcastHandler) health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *PodcastHandler) list(c *gin.Context) {
	ctx := c.Request.Context()
	podcasts, err := h.repo.List(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, podcasts)
}

func (h *PodcastHandler) search(c *gin.Context) {
	ctx := c.Request.Context()
	q := c.Query("q")
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "q is required"})
		return
	}
	podcasts, err := h.repo.Search(ctx, q)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, podcasts)
}

func (h *PodcastHandler) get(c *gin.Context) {
	ctx := c.Request.Context()
	id, err := parseID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	podcast, err := h.repo.Get(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if podcast == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, podcast)
}

func (h *PodcastHandler) Create(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.GetUint("userID")
	userEmail := c.GetString("userEmail")
	var req models.Podcast
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if req.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}
	req.AuthorID = userID
	req.AuthorEmail = userEmail
	if err := h.repo.Create(ctx, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, req)
}

func (h *PodcastHandler) Update(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.GetUint("userID")
	id, err := parseID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var req models.Podcast
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
}

func (h *PodcastHandler) Delete(c *gin.Context) {
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

func (h *PodcastHandler) episodes(c *gin.Context) {
	ctx := c.Request.Context()
	id, err := parseID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	episodes, err := h.repo.Episodes(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, episodes)
}

func (h *PodcastHandler) AddEpisode(c *gin.Context) {
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
	if req.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}
	created, err := h.repo.AddEpisode(ctx, id, &req, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		if err.Error() == "forbidden" {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, created)
}

func parseID(raw string) (uint, error) {
	val, err := strconv.Atoi(raw)
	if err != nil || val < 0 {
		return 0, err
	}
	return uint(val), nil
}

