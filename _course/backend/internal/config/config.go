package config

import (
	"log"
	"os"
)

type Config struct {
	Port         string
	PostgresURL  string
	RedisAddr    string
	RedisPass    string
	RedisEnabled bool
}

func Load() Config {
	cfg := Config{
		Port:        getEnv("PORT", "8080"),
		PostgresURL: getEnv("POSTGRES_DSN", "postgres://postgres:postgres@postgres:5432/podcasts?sslmode=disable"),
		RedisAddr:   getEnv("REDIS_ADDR", "redis:6379"),
		RedisPass:   os.Getenv("REDIS_PASSWORD"),
	}

	if cfg.RedisAddr != "" {
		cfg.RedisEnabled = true
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func MustGetEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("environment variable %s is required", key)
	}
	return v
}

