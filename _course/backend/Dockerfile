# syntax=docker/dockerfile:1

FROM golang:1.21-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod ./
RUN go mod download
COPY . .
RUN go build -o server ./main.go

FROM alpine:3.18
WORKDIR /app
RUN adduser -D appuser
COPY --from=builder /app/server /app/server
EXPOSE 8080
USER appuser
ENTRYPOINT ["/app/server"]

