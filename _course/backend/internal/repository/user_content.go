package repository

import (
	"context"

	"gorm.io/gorm"

	"podcast-backend/internal/models"
)

type UserContentRepository struct {
	db *gorm.DB
}

func NewUserContentRepository(db *gorm.DB) *UserContentRepository {
	return &UserContentRepository{db: db}
}

func (r *UserContentRepository) ToggleFavorite(ctx context.Context, userID, podcastID uint) (bool, error) {
	var fav models.Favorite
	err := r.db.WithContext(ctx).Where("user_id = ? AND podcast_id = ?", userID, podcastID).First(&fav).Error
	if err == nil {
		if err := r.db.WithContext(ctx).Delete(&fav).Error; err != nil {
			return false, err
		}
		return false, nil
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return false, err
	}

	fav = models.Favorite{UserID: userID, PodcastID: podcastID}
	if err := r.db.WithContext(ctx).Create(&fav).Error; err != nil {
		return false, err
	}
	return true, nil
}

func (r *UserContentRepository) Favorites(ctx context.Context, userID uint) ([]models.Podcast, error) {
	var podcasts []models.Podcast
	if err := r.db.WithContext(ctx).
		Joins("JOIN favorites ON favorites.podcast_id = podcasts.id").
		Where("favorites.user_id = ?", userID).
		Preload("Episodes").
		Find(&podcasts).Error; err != nil {
		return nil, err
	}
	return podcasts, nil
}

func (r *UserContentRepository) ToggleLibrary(ctx context.Context, userID, podcastID uint) (bool, error) {
	var item models.LibraryItem
	err := r.db.WithContext(ctx).Where("user_id = ? AND podcast_id = ?", userID, podcastID).First(&item).Error
	if err == nil {
		if err := r.db.WithContext(ctx).Delete(&item).Error; err != nil {
			return false, err
		}
		return false, nil
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return false, err
	}

	item = models.LibraryItem{UserID: userID, PodcastID: podcastID}
	if err := r.db.WithContext(ctx).Create(&item).Error; err != nil {
		return false, err
	}
	return true, nil
}

func (r *UserContentRepository) Library(ctx context.Context, userID uint) ([]models.Podcast, error) {
	var podcasts []models.Podcast
	if err := r.db.WithContext(ctx).
		Joins("JOIN library_items ON library_items.podcast_id = podcasts.id").
		Where("library_items.user_id = ?", userID).
		Preload("Episodes").
		Find(&podcasts).Error; err != nil {
		return nil, err
	}
	return podcasts, nil
}

