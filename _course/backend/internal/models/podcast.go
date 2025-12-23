package models

import "time"

type Podcast struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title"`
	Author      string    `json:"author"`      // отображаемое имя/ник
	AuthorID    uint      `json:"authorId" gorm:"index"`
	AuthorEmail string    `json:"authorEmail"` // технический email автора
	Description string    `json:"description"`
	Image       *string   `json:"image"`
	Category    *string   `json:"category"`
	Episodes    []Episode `json:"episodes" gorm:"constraint:OnDelete:CASCADE;"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

