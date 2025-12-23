package graphql

import (
	"taskmanager-backend/internal/models"
	"time"

	"github.com/graphql-go/graphql"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (r *GraphQLResolver) GetProject(p graphql.ResolveParams) (interface{}, error) {
	id, ok := p.Args["id"].(string)
	if !ok {
		return nil, nil
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	project, err := r.Storage.ProjectStorage.GetProjectByID(objectID.Hex())
	if err != nil {
		return nil, err
	}

	return *project, nil
}

func (r *GraphQLResolver) GetProjects(p graphql.ResolveParams) (interface{}, error) {
	userID, ok := p.Context.Value("userID").(primitive.ObjectID)
	if !ok {
		projects, err := r.Storage.ProjectStorage.GetAllProjects()
		if err != nil {
			return nil, err
		}
		result := make([]models.Project, len(projects))
		for i, p := range projects {
			result[i] = p
		}
		return result, nil
	}

	projects, err := r.Storage.ProjectStorage.GetProjectsByUser(userID)
	if err != nil {
		return nil, err
	}

	result := make([]models.Project, len(projects))
	for i, p := range projects {
		result[i] = p
	}

	return result, nil
}

func (r *GraphQLResolver) GetTasksByProject(p graphql.ResolveParams) (interface{}, error) {
	projectID, ok := p.Args["projectId"].(string)
	if !ok {
		return nil, nil
	}

	tasks, err := r.Storage.TaskStorage.GetTasksByProjectID(projectID)
	if err != nil {
		return nil, err
	}

	result := make([]models.Task, len(tasks))
	for i, t := range tasks {
		result[i] = t
	}

	return result, nil
}

func (r *GraphQLResolver) CreateProject(p graphql.ResolveParams) (interface{}, error) {
	title, _ := p.Args["title"].(string)
	description, _ := p.Args["description"].(string)
	status, _ := p.Args["status"].(string)

	if status == "" {
		status = "active"
	}

	userID, ok := p.Context.Value("userID").(primitive.ObjectID)
	if !ok {
		userID = primitive.NilObjectID
	}

	project := &models.Project{
		Title:       title,
		Description: description,
		Status:      status,
		OwnerID:     userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		Tasks:       []models.Task{},
	}

	err := r.Storage.ProjectStorage.CreateProject(project)
	if err != nil {
		return nil, err
	}

	return *project, nil
}

func (r *GraphQLResolver) UpdateProject(p graphql.ResolveParams) (interface{}, error) {
	id, ok := p.Args["id"].(string)
	if !ok {
		return nil, nil
	}

	project, err := r.Storage.ProjectStorage.GetProjectByID(id)
	if err != nil {
		return nil, err
	}

	if project == nil {
		return nil, nil
	}

	if title, ok := p.Args["title"].(string); ok && title != "" {
		project.Title = title
	}
	if description, ok := p.Args["description"].(string); ok {
		project.Description = description
	}
	if status, ok := p.Args["status"].(string); ok && status != "" {
		project.Status = status
	}

	project.UpdatedAt = time.Now()

	err = r.Storage.ProjectStorage.UpdateProject(project)
	if err != nil {
		return nil, err
	}

	return *project, nil
}

func (r *GraphQLResolver) DeleteProject(p graphql.ResolveParams) (interface{}, error) {
	id, ok := p.Args["id"].(string)
	if !ok {
		return false, nil
	}

	err := r.Storage.ProjectStorage.DeleteProject(id)
	if err != nil {
		return false, err
	}

	return true, nil
}

func (r *GraphQLResolver) CreateTask(p graphql.ResolveParams) (interface{}, error) {
	projectID, ok := p.Args["projectId"].(string)
	if !ok {
		return nil, nil
	}

	objectID, err := primitive.ObjectIDFromHex(projectID)
	if err != nil {
		return nil, err
	}

	content, _ := p.Args["content"].(string)
	description, _ := p.Args["description"].(string)
	status, _ := p.Args["status"].(string)
	priority, _ := p.Args["priority"].(string)
	assignee, _ := p.Args["assignee"].(string)

	if status == "" {
		status = "todo"
	}

	userID, ok := p.Context.Value("userID").(primitive.ObjectID)
	if !ok {
		userID = primitive.NilObjectID
	}

	task := &models.Task{
		Content:     content,
		Description: description,
		Status:      status,
		Priority:    priority,
		Assignee:    assignee,
		ProjectID:   objectID,
		CreatedBy:   userID,
		CreatedAt:   time.Now(),
	}

	err = r.Storage.TaskStorage.CreateTask(task)
	if err != nil {
		return nil, err
	}

	return *task, nil
}
