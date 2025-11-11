// context/ProjectContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const ProjectContext = createContext();

// Начальное состояние
const initialState = {
	projects: JSON.parse(localStorage.getItem('projects')) || [
		{
			id: '1',
			title: 'Тестовый проект',
			description: 'Проект для тестирования отображения описания',
			status: 'active',
			createdAt: new Date('2024-01-15').toISOString(),
			tasks: [
				{
					id: 'test-1',
					content: 'Тестовая задача с описанием',
					description: 'Это тестовое описание',
					status: 'todo',
					priority: 'high',
					assignee: 'Тестовый исполнитель',
					createdAt: new Date('2024-01-16').toISOString(),
					dueDate: new Date('2024-02-01').toISOString()
				},
				{
					id: 'test-2',
					content: 'Вторая тестовая задача',
					description: 'Еще одно описание для проверки отображения',
					status: 'inProgress',
					priority: 'medium',
					assignee: 'Другой исполнитель',
					createdAt: new Date('2024-01-17').toISOString(),
					dueDate: new Date('2024-01-25').toISOString()
				}
			]
		}
	]
};

// Типы действий
const actionTypes = {
	ADD_PROJECT: 'ADD_PROJECT',
	UPDATE_PROJECT: 'UPDATE_PROJECT',
	DELETE_PROJECT: 'DELETE_PROJECT',
	ADD_TASK: 'ADD_TASK',
	UPDATE_TASK: 'UPDATE_TASK',
	DELETE_TASK: 'DELETE_TASK',
	MOVE_TASK: 'MOVE_TASK'
};

// Редюсер
const projectReducer = (state, action) => {
	switch (action.type) {
		case actionTypes.ADD_PROJECT:
			return {
				...state,
				projects: [...state.projects, action.payload]
			};

		case actionTypes.UPDATE_PROJECT:
			return {
				...state,
				projects: state.projects.map(project =>
					project.id === action.payload.id ? action.payload : project
				)
			};

		case actionTypes.DELETE_PROJECT:
			return {
				...state,
				projects: state.projects.filter(project => project.id !== action.payload)
			};

		case actionTypes.ADD_TASK:
			return {
				...state,
				projects: state.projects.map(project =>
					project.id === action.payload.projectId
						? {
							...project,
							tasks: [...(project.tasks || []), action.payload.task]
						}
						: project
				)
			};

		case actionTypes.UPDATE_TASK:
			return {
				...state,
				projects: state.projects.map(project =>
					project.id === action.payload.projectId
						? {
							...project,
							tasks: (project.tasks || []).map(task =>
								task.id === action.payload.taskId
									? { ...task, ...action.payload.updates }
									: task
							)
						}
						: project
				)
			};

		case actionTypes.DELETE_TASK:
			return {
				...state,
				projects: state.projects.map(project =>
					project.id === action.payload.projectId
						? {
							...project,
							tasks: (project.tasks || []).filter(task => task.id !== action.payload.taskId)
						}
						: project
				)
			};

		case actionTypes.MOVE_TASK:
			return {
				...state,
				projects: state.projects.map(project =>
					project.id === action.payload.projectId
						? {
							...project,
							tasks: (project.tasks || []).map(task =>
								task.id === action.payload.taskId
									? { ...task, status: action.payload.newStatus }
									: task
							)
						}
						: project
				)
			};

		default:
			return state;
	}
};

// Провайдер
export const ProjectProvider = ({ children }) => {
	const [state, dispatch] = useReducer(projectReducer, initialState);

	// Сохранение в localStorage при изменении состояния
	useEffect(() => {
		localStorage.setItem('projects', JSON.stringify(state.projects));
	}, [state.projects]);

	// Действия
	const addProject = (project) => {
		const newProject = {
			...project,
			id: Date.now().toString(),
			createdAt: new Date().toISOString(),
			tasks: []
		};
		dispatch({ type: actionTypes.ADD_PROJECT, payload: newProject });
	};

	const updateProject = (project) => {
		dispatch({ type: actionTypes.UPDATE_PROJECT, payload: project });
	};

	const deleteProject = (projectId) => {
		dispatch({ type: actionTypes.DELETE_PROJECT, payload: projectId });
	};

	const addTask = (projectId, task) => {
		const newTask = {
			...task,
			id: Date.now().toString(),
			createdAt: new Date().toISOString()
		};
		dispatch({
			type: actionTypes.ADD_TASK,
			payload: { projectId, task: newTask }
		});
	};

	const updateTask = (projectId, taskId, updates) => {
		dispatch({
			type: actionTypes.UPDATE_TASK,
			payload: { projectId, taskId, updates }
		});
	};

	const deleteTask = (projectId, taskId) => {
		dispatch({
			type: actionTypes.DELETE_TASK,
			payload: { projectId, taskId }
		});
	};

	const moveTask = (projectId, taskId, newStatus) => {
		dispatch({
			type: actionTypes.MOVE_TASK,
			payload: { projectId, taskId, newStatus }
		});
	};

	const getProjectById = (projectId) => {
		return state.projects.find(project => project.id === projectId);
	};

	const value = {
		projects: state.projects,
		addProject,
		updateProject,
		deleteProject,
		addTask,
		updateTask,
		deleteTask,
		moveTask,
		getProjectById
	};

	return (
		<ProjectContext.Provider value={value}>
			{children}
		</ProjectContext.Provider>
	);
};

// Хук для использования контекста
export const useProject = () => {
	const context = useContext(ProjectContext);
	if (!context) {
		throw new Error('useProject must be used within a ProjectProvider');
	}
	return context;
};