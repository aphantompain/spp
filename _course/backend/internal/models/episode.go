package models

import "time"

type Episode struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	PodcastID   uint      `json:"podcastId" gorm:"index"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Date        string    `json:"date"`
	Duration    int       `json:"duration"` // seconds
	AudioURL    string    `json:"audioUrl"`
	Likes       int       `json:"likes" gorm:"default:0"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

