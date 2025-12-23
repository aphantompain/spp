package repository

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"podcast-backend/internal/models"
)

type PodcastRepository struct {
	db          *gorm.DB
	redis       *redis.Client
	cacheTTL    time.Duration
	cacheEnable bool
}

func NewPodcastRepository(db *gorm.DB, redisClient *redis.Client) *PodcastRepository {
	return &PodcastRepository{
		db:          db,
		redis:       redisClient,
		cacheTTL:    30 * time.Second,
		cacheEnable: redisClient != nil,
	}
}

func (r *PodcastRepository) List(ctx context.Context) ([]models.Podcast, error) {
	const cacheKey = "podcasts:all"

	if r.cacheEnable {
		if data, err := r.redis.Get(ctx, cacheKey).Result(); err == nil {
			var cached []models.Podcast
			if json.Unmarshal([]byte(data), &cached) == nil {
				return cached, nil
			}
		}
	}

	var podcasts []models.Podcast
	if err := r.db.Preload("Episodes").Order("id desc").Find(&podcasts).Error; err != nil {
		return nil, err
	}

	if r.cacheEnable {
		if b, err := json.Marshal(podcasts); err == nil {
			_ = r.redis.Set(ctx, cacheKey, b, r.cacheTTL).Err()
		}
	}

	return podcasts, nil
}

func (r *PodcastRepository) Get(ctx context.Context, id uint) (*models.Podcast, error) {
	var podcast models.Podcast
	if err := r.db.Preload("Episodes").First(&podcast, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &podcast, nil
}

func (r *PodcastRepository) Search(ctx context.Context, query string) ([]models.Podcast, error) {
	q := "%" + query + "%"
	var podcasts []models.Podcast
	if err := r.db.Preload("Episodes").
		Where("title ILIKE ? OR author ILIKE ? OR description ILIKE ?", q, q, q).
		Find(&podcasts).Error; err != nil {
		return nil, err
	}
	return podcasts, nil
}

func (r *PodcastRepository) Create(ctx context.Context, p *models.Podcast) error {
	if err := r.db.WithContext(ctx).Create(p).Error; err != nil {
		return err
	}
	r.invalidateCache(ctx)
	return nil
}

func (r *PodcastRepository) Update(ctx context.Context, id uint, data *models.Podcast, userID uint) (*models.Podcast, error) {
	var existing models.Podcast
	if err := r.db.First(&existing, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	if existing.AuthorID != userID {
		return nil, errors.New("forbidden")
	}

	existing.Title = data.Title
	existing.Author = data.Author
	existing.Description = data.Description
	existing.Image = data.Image
	existing.Category = data.Category

	if err := r.db.WithContext(ctx).Save(&existing).Error; err != nil {
		return nil, err
	}

	if data.Episodes != nil && len(data.Episodes) > 0 {
		for _, ep := range data.Episodes {
			ep.PodcastID = existing.ID
			r.db.WithContext(ctx).Create(&ep)
		}
	}

	r.invalidateCache(ctx)

	return &existing, nil
}

func (r *PodcastRepository) Delete(ctx context.Context, id uint, userID uint) error {
	var podcast models.Podcast
	if err := r.db.WithContext(ctx).First(&podcast, id).Error; err != nil {
		return err
	}
	if podcast.AuthorID != userID {
		return errors.New("forbidden")
	}
	if err := r.db.WithContext(ctx).Delete(&models.Podcast{}, id).Error; err != nil {
		return err
	}
	r.invalidateCache(ctx)
	return nil
}

func (r *PodcastRepository) AddEpisode(ctx context.Context, podcastID uint, ep *models.Episode, userID uint) (*models.Episode, error) {
	var podcast models.Podcast
	if err := r.db.WithContext(ctx).First(&podcast, podcastID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	if podcast.AuthorID != userID {
		return nil, errors.New("forbidden")
	}

	ep.PodcastID = podcastID
	if err := r.db.WithContext(ctx).Create(ep).Error; err != nil {
		return nil, err
	}
	r.invalidateCache(ctx)
	return ep, nil
}

func (r *PodcastRepository) Episodes(ctx context.Context, podcastID uint) ([]models.Episode, error) {
	var episodes []models.Episode
	if err := r.db.WithContext(ctx).
		Where("podcast_id = ?", podcastID).
		Order("id desc").
		Find(&episodes).Error; err != nil {
		return nil, err
	}
	return episodes, nil
}

func (r *PodcastRepository) invalidateCache(ctx context.Context) {
	if !r.cacheEnable {
		return
	}
	_ = r.redis.Del(ctx, "podcasts:all").Err()
}

