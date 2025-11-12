import React from 'react';
import { getTotalTasks, getActiveTasksCount, getCompletedTasksCount } from '../../utils/projectData';

const ProjectCard = ({ project, onProjectClick }) => {
	const totalTasks = getTotalTasks(project);
	const activeTasks = getActiveTasksCount(project);
	const completedTasks = getCompletedTasksCount(project);

	const handleClick = () => {
		if (onProjectClick) {
			onProjectClick(project);
		}
	};

	return (
		<div
			className="project-card"
			onClick={handleClick}
			style={{
				border: '1px solid #ddd',
				borderRadius: '8px',
				padding: '1rem',
				margin: '0.5rem 0',
				cursor: onProjectClick ? 'pointer' : 'default',
				backgroundColor: '#fff',
				boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
				transition: 'all 0.2s ease'
			}}
			onMouseEnter={(e) => {
				if (onProjectClick) {
					e.currentTarget.style.transform = 'translateY(-2px)';
					e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
				}
			}}
			onMouseLeave={(e) => {
				if (onProjectClick) {
					e.currentTarget.style.transform = 'translateY(0)';
					e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
				}
			}}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
				<h3 style={{
					margin: 0,
					color: '#333',
					fontSize: '1.2rem'
				}}>
					{project.title}
				</h3>
				<span
					style={{
						padding: '0.25rem 0.5rem',
						borderRadius: '12px',
						fontSize: '0.8rem',
						fontWeight: 'bold',
						backgroundColor: project.status === 'completed' ? '#28a745' : '#007bff',
						color: 'white'
					}}
				>
					{project.status === 'completed' ? 'Завершен' : 'Активный'}
				</span>
			</div>

			<p style={{
				margin: '0.5rem 0',
				color: '#666',
				fontSize: '0.9rem'
			}}>
				{project.description}
			</p>

			<div style={{
				display: 'flex',
				gap: '1rem',
				marginTop: '1rem',
				paddingTop: '0.5rem',
				borderTop: '1px solid #eee'
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
					<span style={{ fontWeight: 'bold' }}>Всего:</span>
					<span style={{
						backgroundColor: '#f8f9fa',
						padding: '0.2rem 0.5rem',
						borderRadius: '4px',
						fontSize: '0.8rem'
					}}>
						{totalTasks}
					</span>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
					<span style={{ fontWeight: 'bold', color: '#007bff' }}>Активные:</span>
					<span style={{
						backgroundColor: '#e7f3ff',
						padding: '0.2rem 0.5rem',
						borderRadius: '4px',
						fontSize: '0.8rem',
						color: '#007bff'
					}}>
						{activeTasks}
					</span>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
					<span style={{ fontWeight: 'bold', color: '#28a745' }}>Завершены:</span>
					<span style={{
						backgroundColor: '#e8f5e8',
						padding: '0.2rem 0.5rem',
						borderRadius: '4px',
						fontSize: '0.8rem',
						color: '#28a745'
					}}>
						{completedTasks}
					</span>
				</div>
			</div>

			<div style={{
				marginTop: '0.5rem',
				fontSize: '0.8rem',
				color: '#999'
			}}>
				Создан: {project.createdAt.toLocaleDateString('ru-RU')}
			</div>
		</div>
	);
};

export default ProjectCard;