FROM golang:1.21-alpine

WORKDIR /app

# Копируем файлы модулей
COPY go.mod go.sum ./
RUN go mod download

# Копируем исходный код
COPY . .

# Собираем приложение
RUN go build -o main ./cmd/server

# Экспортируем порт
EXPOSE 8080

# Запускаем приложение
CMD ["./main"]