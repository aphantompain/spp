package events

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"

	"podcast-backend/internal/auth"
)

// Event represents a generic SSE event payload.
type Event struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

type Hub struct {
	mu       sync.Mutex
	clients  map[chan []byte]struct{}
	jwt      *auth.JWTService
}

func NewHub(jwt *auth.JWTService) *Hub {
	return &Hub{
		clients: make(map[chan []byte]struct{}),
		jwt:     jwt,
	}
}

// Handler handles SSE connections on /api/events?token=JWT
func (h *Hub) Handler(c *gin.Context) {
	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.String(http.StatusInternalServerError, "Streaming unsupported")
		return
	}

	token := c.Query("token")
	if token == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
		return
	}
	if _, err := h.jwt.Parse(token); err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("X-Accel-Buffering", "no")

	// send initial comment to establish stream
	_, _ = c.Writer.Write([]byte(": connected\n\n"))
	flusher.Flush()

	ch := make(chan []byte, 8)

	h.mu.Lock()
	h.clients[ch] = struct{}{}
	h.mu.Unlock()

	defer func() {
		h.mu.Lock()
		delete(h.clients, ch)
		h.mu.Unlock()
		close(ch)
	}()

	ctx := c.Request.Context()
	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-ch:
			_, err := c.Writer.Write(append([]byte("data: "), append(msg, []byte("\n\n")...)...))
			if err != nil {
				return
			}
			flusher.Flush()
		}
	}
}

// Broadcast sends an event to all connected clients.
func (h *Hub) Broadcast(evtType string, data interface{}) {
	payload, err := json.Marshal(Event{Type: evtType, Data: data})
	if err != nil {
		log.Printf("events: marshal error: %v", err)
		return
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	for ch := range h.clients {
		select {
		case ch <- payload:
		default:
			// drop if client is slow
		}
	}
}


