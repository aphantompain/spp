package models

import "time"

type LibraryItem struct {
	UserID    uint      `json:"userId" gorm:"primaryKey"`
	PodcastID uint      `json:"podcastId" gorm:"primaryKey;index"`
	CreatedAt time.Time `json:"createdAt"`
}

