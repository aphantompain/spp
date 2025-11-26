package handlers

import (
	"context"
	"net/http"
	graphqlpkg "taskmanager-backend/internal/graphql"
	"taskmanager-backend/internal/middleware"
	"taskmanager-backend/internal/storage"

	"github.com/gin-gonic/gin"
	"github.com/graphql-go/graphql"
)

type GraphQLHandler struct {
	schema graphql.Schema
}

func NewGraphQLHandler(storage *storage.MongoDBStorage) (*GraphQLHandler, error) {
	schema, err := graphqlpkg.NewGraphQLSchema(storage)
	if err != nil {
		return nil, err
	}

	return &GraphQLHandler{schema: schema}, nil
}

func (h *GraphQLHandler) GraphQL(c *gin.Context) {
	var req struct {
		Query         string                 `json:"query"`
		Variables     map[string]interface{} `json:"variables"`
		OperationName string                 `json:"operationName"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Получаем userID из контекста для использования в резолверах
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Создаем контекст для GraphQL с userID
	ctx := c.Request.Context()
	ctx = context.WithValue(ctx, "userID", userID)

	result := graphql.Do(graphql.Params{
		Schema:         h.schema,
		RequestString:  req.Query,
		VariableValues: req.Variables,
		OperationName:  req.OperationName,
		Context:        ctx,
	})

	if len(result.Errors) > 0 {
		c.JSON(http.StatusOK, result) // GraphQL всегда возвращает 200, даже при ошибках
		return
	}

	c.JSON(http.StatusOK, result)
}
