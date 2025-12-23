package models

import "time"

type EpisodeLike struct {
	UserID    uint      `json:"userId" gorm:"primaryKey"`
	EpisodeID uint      `json:"episodeId" gorm:"primaryKey;index"`
	CreatedAt time.Time `json:"createdAt"`
}

