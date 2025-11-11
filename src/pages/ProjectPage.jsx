// pages/ProjectPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard/KanbanBoard';
import { useProject } from '../context/ProjectContext';

const ProjectPage = () => {
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { getProjectById, updateTask, deleteTask, moveTask, addTask } = useProject();

	const project = getProjectById(projectId);

	if (!project) {
		return (
			<div style={{
				textAlign: 'center',
				padding: '2rem',
				maxWidth: '1200px',
				margin: '0 auto'
			}}>
				<h2>Проект не найден</h2>
				<button onClick={() => navigate('/projects')}>
					Вернуться к проектам
				</button>
			</div>
		);
	}

	const handleTaskUpdate = (projectId, taskId, updates) => {
		updateTask(projectId, taskId, updates);
	};

	const handleTaskDelete = (projectId, taskId) => {
		deleteTask(projectId, taskId);
	};

	const handleTaskMove = (projectId, taskId, newStatus) => {
		moveTask(projectId, taskId, newStatus);
	};

	const handleTaskAdd = (projectId, task) => {
		addTask(projectId, task);
	};

	return (
		<div style={{ maxWidth: '1200px', margin: '0 auto' }}>
			{/* Кнопка назад */}
			<button
				onClick={() => navigate('/projects')}
				style={{
					marginBottom: '1.5rem',
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