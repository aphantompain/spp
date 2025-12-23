package repository

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"podcast-backend/internal/models"
)

type EpisodeRepository struct {
	db *gorm.DB
}

func NewEpisodeRepository(db *gorm.DB) *EpisodeRepository {
	return &EpisodeRepository{db: db}
}

func (r *EpisodeRepository) Update(ctx context.Context, episodeID uint, data *models.Episode, userID uint) (*models.Episode, error) {
	var ep models.Episode
	if err := r.db.WithContext(ctx).First(&ep, episodeID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	var pod models.Podcast
	if err := r.db.WithContext(ctx).First(&pod, ep.PodcastID).Error; err != nil {
		return nil, err
	}
	if pod.AuthorID != userID {
		return nil, errors.New("forbidden")
	}

	ep.Title = data.Title
	ep.Description = data.Description
	ep.Date = data.Date
	ep.Duration = data.Duration
	ep.AudioURL = data.AudioURL

	if err := r.db.WithContext(ctx).Save(&ep).Error; err != nil {
		return nil, err
	}
	return &ep, nil
}

func (r *EpisodeRepository) Delete(ctx context.Context, episodeID uint, userID uint) error {
	var ep models.Episode
	if err := r.db.WithContext(ctx).First(&ep, episodeID).Error; err != nil {
		return err
	}
	var pod models.Podcast
	if err := r.db.WithContext(ctx).First(&pod, ep.PodcastID).Error; err != nil {
		return err
	}
	if pod.AuthorID != userID {
		return errors.New("forbidden")
	}
	return r.db.WithContext(ctx).Delete(&models.Episode{}, episodeID).Error
}

func (r *EpisodeRepository) ToggleLike(ctx context.Context, episodeID uint, userID uint) (int, bool, error) {
	var like models.EpisodeLike
	err := r.db.WithContext(ctx).Where("user_id = ? AND episode_id = ?", userID, episodeID).First(&like).Error
	added := false
	if err == nil {
		if err := r.db.WithContext(ctx).Delete(&like).Error; err != nil {
			return 0, false, err
		}
	} else {
		if err != gorm.ErrRecordNotFound {
			return 0, false, err
		}
		like = models.EpisodeLike{UserID: userID, EpisodeID: episodeID}
		if err := r.db.WithContext(ctx).Create(&like).Error; err != nil {
			return 0, false, err
		}
		added = true
	}

	// recalc likes
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.EpisodeLike{}).Where("episode_id = ?", episodeID).Count(&count).Error; err != nil {
		return 0, false, err
	}
	if err := r.db.WithContext(ctx).Model(&models.Episode{}).Where("id = ?", episodeID).Update("likes", count).Error; err != nil {
		return 0, false, err
	}
	return int(count), added, nil
}

func (r *EpisodeRepository) LikedEpisodeIDs(ctx context.Context, userID uint) ([]uint, error) {
	var ids []uint
	if err := r.db.WithContext(ctx).Model(&models.EpisodeLike{}).Where("user_id = ?", userID).Pluck("episode_id", &ids).Error; err != nil {
		return nil, err
	}
	return ids, nil
}

