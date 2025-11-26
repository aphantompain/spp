// pages/ProjectPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard/KanbanBoard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useProject } from '../context/ProjectContext';
import { apiService } from '../services/api';

const ProjectPage = () => {
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { getProjectById, updateTask, deleteTask, moveTask, addTask } = useProject();

	const [project, setProject] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [exporting, setExporting] = useState(false);

	// Загружаем проект при монтировании или изменении projectId
	useEffect(() => {
		loadProject();
	}, [projectId]);

	const loadProject = async () => {
		setLoading(true);
		setError(null);
		try {
			// Сначала пробуем получить проект из контекста
			let projectData = getProjectById(projectId);

			// Если проекта нет в контексте, загружаем с API
			if (!projectData) {
				console.log('Project not found in context, loading from API...');
				projectData = await apiService.getProject(projectId);
			}

			if (!projectData) {
				setError('Проект не найден');
				return;
			}

			setProject(projectData);
		} catch (error) {
			console.error('Error loading project:', error);
			setError(error.message || 'Ошибка при загрузке проекта');
		} finally {
			setLoading(false);
		}
	};

	const handleTaskUpdate = async (projectId, taskId, updates) => {
		try {
			await updateTask(projectId, taskId, updates);
			// Обновляем локальное состояние
			setProject(prev => ({
				...prev,
				tasks: prev.tasks.map(task =>
					task.id === taskId ? { ...task, ...updates } : task
				)
			}));
		} catch (error) {
			console.error('Error updating task:', error);
			throw error;
		}
	};

	const handleTaskDelete = async (projectId, taskId) => {
		try {
			await deleteTask(projectId, taskId);
			// Обновляем локальное состояние
			setProject(prev => ({
				...prev,
				tasks: prev.tasks.filter(task => task.id !== taskId)
			}));
		} catch (error) {
			console.error('Error deleting task:', error);
			throw error;
		}
	};

	const handleTaskMove = async (projectId, taskId, newStatus) => {
		try {
			await moveTask(projectId, taskId, newStatus);
			// Обновляем локальное состояние
			setProject(prev => ({
				...prev,
				tasks: prev.tasks.map(task =>
					task.id === taskId ? { ...task, status: newStatus } : task
				)
			}));
		} catch (error) {
			console.error('Error moving task:', error);
			throw error;
		}
	};

	const handleTaskAdd = async (projectId, task) => {
		try {
			const newTask = await addTask(projectId, task);
			// Обновляем локальное состояние
			setProject(prev => ({
				...prev,
				tasks: [...prev.tasks, newTask]
			}));
			return newTask;
		} catch (error) {
			console.error('Error adding task:', error);
			throw error;
		}
	};

	const handleExport = async (format) => {
		if (!project || !project.id) return;

		setExporting(true);
		try {
			await apiService.exportProject(project.id, format);
		} catch (error) {
			console.error('Error exporting project:', error);
			alert('Ошибка при экспорте проекта: ' + error.message);
		} finally {
			setExporting(false);
		}
	};

	if (loading) {
		return (
			<div style={{ maxWidth: '1200px', margin: '0 auto' }}>
				<LoadingSpinner size="large" />
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ maxWidth: '1200px', margin: '0 auto' }}>
				<ErrorMessage
					error={error}
					onRetry={loadProject}
				/>
				<button
					onClick={() => navigate('/projects')}
					style={{
						marginTop: '1rem',
						padding: '0.5rem 1rem',
						backgroundColor: '#6c757d',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer'
					}}
				>
					← Назад к проектам
				</button>
			</div>
		);
	}

	if (!project) {
		return (
			<div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
				<h2>Проект не найден</h2>
				<button
					onClick={() => navigate('/projects')}
					style={{
						marginTop: '1rem',
						padding: '0.75rem 1.5rem',
						backgroundColor: '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer'
					}}
				>
					Вернуться к проектам
				</button>
			</div>
		);
	}

	return (
		<div style={{ maxWidth: '1200px', margin: '0 auto' }}>
			{/* Панель управления */}
			<div style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				marginBottom: '1.5rem',
				gap: '1rem',
				flexWrap: 'wrap'
			}}>
				<button
					onClick={() => navigate('/projects')}
					style={{
						padding: '0.5rem 1rem',
						backgroundColor: '#6c757d',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						fontSize: '0.9rem',
						display: 'flex',
						alignItems: 'center',
						gap: '0.5rem',
						transition: 'all 0.2s ease'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = '#5a6268';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = '#6c757d';
					}}
				>
					← Назад к проектам
				</button>

				{/* Кнопки экспорта */}
				<div style={{ display: 'flex', gap: '0.5rem' }}>
					<button
						onClick={() => handleExport('excel')}
						disabled={exporting}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor: exporting ? '#ccc' : '#28a745',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: exporting ? 'not-allowed' : 'pointer',
							fontSize: '0.9rem',
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
							transition: 'all 0.2s ease'
						}}
						onMouseEnter={(e) => {
							if (!exporting) {
								e.currentTarget.style.backgroundColor = '#218838';
							}
						}}
						onMouseLeave={(e) => {
							if (!exporting) {
								e.currentTarget.style.backgroundColor = '#28a745';
							}
						}}
					>
						📊 {exporting ? 'Экспорт...' : 'Экспорт в Excel'}
					</button>
					<button
						onClick={() => handleExport('word')}
						disabled={exporting}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor: exporting ? '#ccc' : '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: exporting ? 'not-allowed' : 'pointer',
							fontSize: '0.9rem',
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
							transition: 'all 0.2s ease'
						}}
						onMouseEnter={(e) => {
							if (!exporting) {
								e.currentTarget.style.backgroundColor = '#0056b3';
							}
						}}
						onMouseLeave={(e) => {
							if (!exporting) {
								e.currentTarget.style.backgroundColor = '#007bff';
							}
						}}
					>
						📄 {exporting ? 'Экспорт...' : 'Экспорт в Word'}
					</button>
				</div>
			</div>

			{/* Kanban доска */}
			<KanbanBoard
				project={project}
				onTaskUpdate={handleTaskUpdate}
				onTaskDelete={handleTaskDelete}
				onTaskMove={handleTaskMove}
				onTaskAdd={handleTaskAdd}
			/>
		</div>
	);
};

export default ProjectPage;