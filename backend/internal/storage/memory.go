package storage

import (
	"sync"
	"taskmanager-backend/internal/models"
	"time"

	"github.com/google/uuid"
)

type Storage struct {
	projects map[string]*models.Project
	tasks    map[string]*models.Task
	mutex    sync.RWMutex
}

func NewStorage() *Storage {
	storage := &Storage{
		projects: make(map[string]*models.Project),
		tasks:    make(map[string]*models.Task),
	}

	storage.seedData()
	return storage
}

func (s *Storage) seedData() {
	projectID := uuid.New().String()
	task1ID := uuid.New().String()
	task2ID := uuid.New().String()

	project := &models.Project{
		ID:          projectID,
		Title:       "Тестовый проект",
		Description: "Проект для тестирования API",
		Status:      "active",
		CreatedAt:   time.Now(),
	}

	dueDate1 := time.Now().AddDate(0, 0, 7)
	dueDate2 := time.Now().AddDate(0, 0, 3)

	task1 := &models.Task{
		ID:          task1ID,
		Content:     "Тестовая задача с описанием",
		Description: "Это тестовое описание",
		Status:      "todo",
		Priority:    "high",
		Assignee:    "Тестовый исполнитель",
		CreatedAt:   time.Now(),
		DueDate:     &dueDate1,
		ProjectID:   projectID,
	}

	task2 := &models.Task{
		ID:          task2ID,
		Content:     "Вторая тестовая задача",
		Description: "Еще одно описание для проверки",
		Status:      "inProgress",
		Priority:    "medium",
		Assignee:    "Другой исполнитель",
		CreatedAt:   time.Now(),
		DueDate:     &dueDate2,
		ProjectID:   projectID,
	}

	s.projects[projectID] = project
	s.tasks[task1ID] = task1
	s.tasks[task2ID] = task2
}

func (s *Storage) GetAllProjects() ([]models.Project, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	projects := make([]models.Project, 0, len(s.projects))
	for _, project := range s.projects {
		projectWithTasks := *project
		projectWithTasks.Tasks = s.getTasksByProjectID(project.ID)
		projects = append(projects, projectWithTasks)
	}

	return projects, nil
}

func (s *Storage) GetProjectByID(id string) (*models.Project, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	project, exists := s.projects[id]
	if !exists {
		return nil, nil
	}

	projectWithTasks := *project
	projectWithTasks.Tasks = s.getTasksByProjectID(id)
	return &projectWithTasks, nil
}

func (s *Storage) CreateProject(project *models.Project) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	s.projects[project.ID] = project
	return nil
}

func (s *Storage) UpdateProject(project *models.Project) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if _, exists := s.projects[project.ID]; !exists {
		return nil
	}

	s.projects[project.ID] = project
	return nil
}

func (s *Storage) DeleteProject(id string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	for taskID, task := range s.tasks {
		if task.ProjectID == id {
			delete(s.tasks, taskID)
		}
	}

	delete(s.projects, id)
	return nil
}

func (s *Storage) GetTasksByProjectID(projectID string) ([]models.Task, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	return s.getTasksByProjectID(projectID), nil
}

func (s *Storage) getTasksByProjectID(projectID string) []models.Task {
	tasks := make([]models.Task, 0)
	for _, task := range s.tasks {
		if task.ProjectID == projectID {
			tasks = append(tasks, *task)
		}
	}
	return tasks
}

func (s *Storage) GetTaskByID(id string) (*models.Task, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	task, exists := s.tasks[id]
	if !exists {
		return nil, nil
	}

	return task, nil
}

func (s *Storage) CreateTask(task *models.Task) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	s.tasks[task.ID] = task
	return nil
}

func (s *Storage) UpdateTask(task *models.Task) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if _, exists := s.tasks[task.ID]; !exists {
		return nil
	}

	s.tasks[task.ID] = task
	return nil
}

func (s *Storage) DeleteTask(id string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	delete(s.tasks, id)
	return nil
}
