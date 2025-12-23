package seed

import (
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"podcast-backend/internal/models"
)

func Run(db *gorm.DB) {
	var count int64
	if err := db.Model(&models.Podcast{}).Count(&count).Error; err != nil {
		log.Printf("seed count error: %v", err)
		return
	}
	if count > 0 {
		return
	}

	// Create demo user
	hash, _ := bcrypt.GenerateFromPassword([]byte("test123"), bcrypt.DefaultCost)
	user := models.User{
		Name:         "Demo Author",
		Email:        "demo@demo.com",
		PasswordHash: string(hash),
	}
	if err := db.Create(&user).Error; err != nil {
		log.Printf("seed user error: %v", err)
		return
	}

	sample := []models.Podcast{
		{
			Title:       "Технологии будущего",
			Author:      "Иван Петров",
			AuthorID:    user.ID,
			AuthorEmail: user.Email,
			Description: "О технологиях, инновациях и их влиянии на нашу жизнь.",
			Category:  strPtr("Технологии"),
			Episodes: []models.Episode{
				{Title: "ИИ в 2024", Description: "Последние достижения ИИ", Date: "2024-01-15", Duration: 3240},
				{Title: "Квантовые компьютеры", Description: "Реальность или фантастика?", Date: "2024-01-08", Duration: 2880},
			},
		},
		{
			Title:       "Истории успеха",
			Author:      "Мария Сидорова",
			AuthorID:    user.ID,
			AuthorEmail: user.Email,
			Description: "Истории предпринимателей и советы.",
			Category:  strPtr("Бизнес"),
			Episodes: []models.Episode{
				{Title: "Бизнес с нуля", Description: "Как выстроить стартап", Date: "2024-01-14", Duration: 2700},
			},
		},
	}

	if err := db.Create(&sample).Error; err != nil {
		log.Printf("seed create error: %v", err)
	}
}

func strPtr(s string) *string { return &s }

