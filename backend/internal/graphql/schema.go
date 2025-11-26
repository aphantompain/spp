// internal/graphql/schema.go
package graphql

import (
	"taskmanager-backend/internal/models"
	"taskmanager-backend/internal/storage"

	"github.com/graphql-go/graphql"
)

type GraphQLResolver struct {
	Storage *storage.MongoDBStorage
}

func NewGraphQLSchema(storage *storage.MongoDBStorage) (graphql.Schema, error) {
	resolver := &GraphQLResolver{Storage: storage}

	// Типы для GraphQL
	taskType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Task",
		Fields: graphql.Fields{
			"id": &graphql.Field{
				Type: graphql.String,
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					if task, ok := p.Source.(models.Task); ok {
						return task.ID.Hex(), nil
					}
					return nil, nil
				},
			},
			"content": &graphql.Field{
				Type: graphql.String,
			},
			"description": &graphql.Field{
				Type: graphql.String,
			},
			"status": &graphql.Field{
				Type: graphql.String,
			},
			"priority": &graphql.Field{
				Type: graphql.String,
			},
			"assignee": &graphql.Field{
				Type: graphql.String,
			},
			"createdAt": &graphql.Field{
				Type: graphql.DateTime,
			},
			"dueDate": &graphql.Field{
				Type: graphql.DateTime,
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					if task, ok := p.Source.(models.Task); ok {
						if task.DueDate != nil {
							return *task.DueDate, nil
						}
					}
					return nil, nil
				},
			},
			"projectId": &graphql.Field{
				Type: graphql.String,
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					if task, ok := p.Source.(models.Task); ok {
						return task.ProjectID.Hex(), nil
					}
					return nil, nil
				},
			},
		},
	})

	projectType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Project",
		Fields: graphql.Fields{
			"id": &graphql.Field{
				Type: graphql.String,
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					if project, ok := p.Source.(models.Project); ok {
						return project.ID.Hex(), nil
					}
					return nil, nil
				},
			},
			"title": &graphql.Field{
				Type: graphql.String,
			},
			"description": &graphql.Field{
				Type: graphql.String,
			},
			"status": &graphql.Field{
				Type: graphql.String,
			},
			"createdAt": &graphql.Field{
				Type: graphql.DateTime,
			},
			"updatedAt": &graphql.Field{
				Type: graphql.DateTime,
			},
			"ownerId": &graphql.Field{
				Type: graphql.String,
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					if project, ok := p.Source.(models.Project); ok {
						return project.OwnerID.Hex(), nil
					}
					return nil, nil
				},
			},
			"tasks": &graphql.Field{
				Type: graphql.NewList(taskType),
			},
		},
	})

	// Query тип
	rootQuery := graphql.NewObject(graphql.ObjectConfig{
		Name: "Query",
		Fields: graphql.Fields{
			"project": &graphql.Field{
				Type: projectType,
				Args: graphql.FieldConfigArgument{
					"id": &graphql.ArgumentConfig{
						Type: graphql.NewNonNull(graphql.String),
					},
				},
				Resolve: resolver.GetProject,
			},
			"projects": &graphql.Field{
				Type:    graphql.NewList(projectType),
				Resolve: resolver.GetProjects,
			},
			"tasks": &graphql.Field{
				Type: graphql.NewList(taskType),
				Args: graphql.FieldConfigArgument{
					"projectId": &graphql.ArgumentConfig{
						Type: graphql.NewNonNull(graphql.String),
					},
				},
				Resolve: resolver.GetTasksByProject,
			},
		},
	})

	// Mutation тип
	rootMutation := graphql.NewObject(graphql.ObjectConfig{
		Name: "Mutation",
		Fields: graphql.Fields{
			"createProject": &graphql.Field{
				Type: projectType,
				Args: graphql.FieldConfigArgument{
					"title": &graphql.ArgumentConfig{
						Type: graphql.NewNonNull(graphql.String),
					},
					"description": &graphql.ArgumentConfig{
						Type: graphql.String,
					},
					"status": &graphql.ArgumentConfig{
						Type: graphql.String,
					},
				},
				Resolve: resolver.CreateProject,
			},
			"updateProject": &graphql.Field{
				Type: projectType,
				Args: graphql.FieldConfigArgument{
					"id": &graphql.ArgumentConfig{
						Type: graphql.NewNonNull(graphql.String),
					},
					"title": &graphql.ArgumentConfig{
						Type: graphql.String,
					},
					"description": &graphql.ArgumentConfig{
						Type: graphql.String,
					},
					"status": &graphql.ArgumentConfig{
						Type: graphql.String,
					},
				},
				Resolve: resolver.UpdateProject,
			},
			"deleteProject": &graphql.Field{
				Type: graphql.Boolean,
				Args: graphql.FieldConfigArgument{
					"id": &graphql.ArgumentConfig{
						Type: graphql.NewNonNull(graphql.String),
					},
				},
				Resolve: resolver.DeleteProject,
			},
			"createTask": &graphql.Field{
				Type: taskType,
				Args: graphql.FieldConfigArgument{
					"projectId": &graphql.ArgumentConfig{
						Type: graphql.NewNonNull(graphql.String),
					},
					"content": &graphql.ArgumentConfig{
						Type: graphql.NewNonNull(graphql.String),
					},
					"description": &graphql.ArgumentConfig{
						Type: graphql.String,
					},
					"status": &graphql.ArgumentConfig{
						Type: graphql.String,
					},
					"priority": &graphql.ArgumentConfig{
						Type: graphql.String,
					},
					"assignee": &graphql.ArgumentConfig{
						Type: graphql.String,
					},
				},
				Resolve: resolver.CreateTask,
			},
		},
	})

	schemaConfig := graphql.SchemaConfig{
		Query:    rootQuery,
		Mutation: rootMutation,
	}

	return graphql.NewSchema(schemaConfig)
}
