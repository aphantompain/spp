// context/ProjectContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '../services/api';

const ProjectContext = createContext();

// Начальное состояние
const initialState = {
	projects: [],
	loading: false,
	error: null
};

// Типы действий
const actionTypes = {
	SET_LOADING: 'SET_LOADING',
	SET_ERROR: 'SET_ERROR',
	SET_PROJECTS: 'SET_PROJECTS',
	ADD_PROJECT: 'ADD_PROJECT',
	UPDATE_PROJECT: 'UPDATE_PROJECT',
	DELETE_PROJECT: 'DELETE_PROJECT',
	ADD_TASK: 'ADD_TASK',
	UPDATE_TASK: 'UPDATE_TASK',
	DELETE_TASK: 'DELETE_TASK'
};

// Редюсер
const projectReducer = (state, action) => {
	switch (action.type) {
		case actionTypes.SET_LOADING:
			return { ...state, loading: action.payload, error: action.payload ? state.error : null };

		case actionTypes.SET_ERROR:
			return { ...state, error: action.payload, loading: false };

		case actionTypes.SET_PROJECTS:
			return { ...state, projects: action.payload, loading: false, error: null };

		case actionTypes.ADD_PROJECT:
			return {
				...state,
				projects: [...state.projects, action.payload],
				error: null
			};

		case actionTypes.UPDATE_PROJECT:
			return {
				...state,
				projects: state.projects.map(project =>
					project.id === action.payload.id ? action.payload : project
				),
				error: null
			};

		case actionTypes.DELETE_PROJECT:
			return {
				...state,
				projects: state.projects.filter(project => project.id !== action.payload),
				error: null
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
				),
				error: null
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
				),
				error: null
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
				),
				error: null
			};

		default:
			return state;
	}
};

// Провайдер
export const ProjectProvider = ({ children }) => {
	const [state, dispatch] = useReducer(projectReducer, initialState);

	// Загрузка проектов при монтировании
	useEffect(() => {
		loadProjects();
	}, []);

	const setLoading = (loading) => {
		dispatch({ type: actionTypes.SET_LOADING, payload: loading });
	};

	const setError = (error) => {
		console.error('Project Context Error:', error);
		dispatch({ type: actionTypes.SET_ERROR, payload: error.message || 'An error occurred' });
	};

	const loadProjects = async () => {
		setLoading(true);
		try {
			const projects = await apiService.getProjects();
			dispatch({ type: actionTypes.SET_PROJECTS, payload: projects });
		} catch (error) {
			setError(error);
		}
	};

	// Действия
	const addProject = async (projectData) => {
		setLoading(true);
		try {
			const newProject = await apiService.createProject(projectData);
			dispatch({ type: actionTypes.ADD_PROJECT, payload: newProject });
			return newProject;
		} catch (error) {
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const updateProject = async (projectId, updates) => {
		setLoading(true);
		try {
			const updatedProject = await apiService.updateProject(projectId, updates);
			dispatch({ type: actionTypes.UPDATE_PROJECT, payload: updatedProject });
			return updatedProject;
		} catch (error) {
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const deleteProject = async (projectId) => {
		setLoading(true);
		try {
			await apiService.deleteProject(projectId);
			dispatch({ type: actionTypes.DELETE_PROJECT, payload: projectId });
		} catch (error) {
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const addTask = async (projectId, taskData) => {
		setLoading(true);
		try {
			const newTask = await apiService.createTask({ ...taskData, projectId });
			dispatch({ type: actionTypes.ADD_TASK, payload: { projectId, task: newTask } });
			return newTask;
		} catch (error) {
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const updateTask = async (projectId, taskId, updates) => {
		setLoading(true);
		try {
			const updatedTask = await apiService.updateTask(taskId, updates);
			dispatch({
				type: actionTypes.UPDATE_TASK,
				payload: { projectId, taskId, updates: updatedTask }
			});
			return updatedTask;
		} catch (error) {
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const deleteTask = async (projectId, taskId) => {
		setLoading(true);
		try {
			await apiService.deleteTask(taskId);
			dispatch({ type: actionTypes.DELETE_TASK, payload: { projectId, taskId } });
		} catch (error) {
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const moveTask = async (projectId, taskId, newStatus) => {
		return updateTask(projectId, taskId, { status: newStatus });
	};

	const getProjectById = (projectId) => {
		return state.projects.find(project => project.id === projectId);
	};

	const clearError = () => {
		dispatch({ type: actionTypes.SET_ERROR, payload: null });
	};

	const value = {
		projects: state.projects,
		loading: state.loading,
		error: state.error,
		addProject,
		updateProject,
		deleteProject,
		addTask,
		updateTask,
		deleteTask,
		moveTask,
		getProjectById,
		refreshProjects: loadProjects,
		clearError
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