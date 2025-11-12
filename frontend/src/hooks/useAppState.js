import { useState } from 'react'
import { generateId } from '../utils/idGenerator'

export const useAppState = () => {
	const [currentPage, setCurrentPage] = useState('home')
	const [showTaskForm, setShowTaskForm] = useState(false)
	const [editingTask, setEditingTask] = useState(null)

	const [projects, setProjects] = useState([
		{
			id: '1',
			name: 'Разработка TaskManager',
			description: 'Разработка системы управления задачами с React интерфейсом',
			taskCount: 3,
			progress: 75,
			createdAt: '2024-01-15'
		},
		{
			id: '2',
			name: 'Маркетинговая кампания',
			description: 'Продвижение продукта на рынке, аналитика и отчетность',
			taskCount: 2,
			progress: 40,
			createdAt: '2024-02-01'
		}
	])

	const [tasks, setTasks] = useState([
		{
			id: 'TASK-1',
			title: 'Разработать главную страницу',
			description: 'Создать адаптивный дизайн главной страницы приложения',
			status: 'todo',
			priority: 'high',
			assignee: 'Иван Иванов',
			projectId: '1'
		},
		{
			id: 'TASK-2',
			title: 'Настроить маршрутизацию',
			description: 'Реализовать навигацию между страницами',
			status: 'in-progress',
			priority: 'medium',
			assignee: 'Петр Петров',
			projectId: '1'
		},
		{
			id: 'TASK-3',
			title: 'Протестировать функционал',
			description: 'Провести unit-тестирование компонентов',
			status: 'done',
			priority: 'low',
			assignee: 'Мария Сидорова',
			projectId: '1'
		}
	])

	// Действия для задач
	const createTask = (taskData) => {
		const newTask = {
			...taskData,
			id: `TASK-${Date.now()}`
		}
		setTasks(prev => [...prev, newTask])
		setShowTaskForm(false)

		// Обновляем счетчик задач в проекте
		setProjects(prev => prev.map(project =>
			project.id === taskData.projectId
				? { ...project, taskCount: project.taskCount + 1 }
				: project
		))
	}

	const updateTask = (taskData) => {
		setTasks(prev => prev.map(task =>
			task.id === taskData.id ? { ...task, ...taskData } : task
		))
		setEditingTask(null)
		setShowTaskForm(false)
	}

	const deleteTask = (taskId) => {
		const task = tasks.find(t => t.id === taskId)
		setTasks(prev => prev.filter(t => t.id !== taskId))

		// Обновляем счетчик задач в проекте
		if (task) {
			setProjects(prev => prev.map(project =>
				project.id === task.projectId
					? { ...project, taskCount: Math.max(0, project.taskCount - 1) }
					: project
			))
		}
	}

	// Действия для проектов
	const createProject = (projectData) => {
		const newProject = {
			...projectData,
			id: generateId(),
			taskCount: 0,
			progress: 0,
			createdAt: new Date().toISOString()
		}
		setProjects(prev => [...prev, newProject])
	}

	const deleteProject = (projectId) => {
		if (window.confirm('Вы уверены, что хотите удалить проект?')) {
			setProjects(prev => prev.filter(project => project.id !== projectId))
			// Также удаляем задачи этого проекта
			setTasks(prev => prev.filter(task => task.projectId !== projectId))
		}
	}

	// Действия для UI
	const openTaskForm = (task = null) => {
		setEditingTask(task)
		setShowTaskForm(true)
	}

	const closeTaskForm = () => {
		setShowTaskForm(false)
		setEditingTask(null)
	}

	const updateProject = (projectData) => {
		setProjects(prev => prev.map(project =>
			project.id === projectData.id ? { ...project, ...projectData } : project
		))
	}

	const getTasksByProject = (projectId) => {
		return tasks.filter(task => task.projectId === projectId)
	}

	const getTasksByStatus = (status) => {
		return tasks.filter(task => task.status === status)
	}

	// Затем return все функции:
	return {
		// State
		currentPage,
		showTaskForm,
		editingTask,
		projects,
		tasks,

		// Actions
		setCurrentPage,
		openTaskForm,
		closeTaskForm,
		createTask,
		updateTask,
		deleteTask,
		createProject,
		deleteProject,
		updateProject,
		getTasksByProject,
		getTasksByStatus
	}
}