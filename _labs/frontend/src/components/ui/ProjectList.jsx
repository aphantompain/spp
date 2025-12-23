// components/ui/ProjectList.jsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const ProjectList = ({ projects, onProjectSelect, loading = false }) => {
	if (loading && projects.length === 0) {
		return <LoadingSpinner />;
	}

	if (!projects || projects.length === 0) {
		return (
			<div style={{
				textAlign: 'center',
				padding: '3rem',
				backgroundColor: 'white',
				borderRadius: '8px',
				boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
			}}>
				<h3 style={{ color: '#666', marginBottom: '1rem' }}>Проектов пока нет</h3>
				<p style={{ color: '#999' }}>Создайте свой первый проект!</p>
			</div>
		);
	}

	// Функция для безопасного форматирования даты
	const formatDate = (dateString) => {
		try {
			if (!dateString) return 'Неизвестная дата';
			const date = new Date(dateString);
			return date.toLocaleDateString();
		} catch (error) {
			console.error('Error formatting date:', error);
			return 'Неизвестная дата';
		}
	};

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
			{projects.map(project => (
				<div
					key={project.id}
					onClick={() => {
						console.log('Project clicked:', project.id); // Для отладки
						onProjectSelect(project);
					}}
					style={{
						backgroundColor: 'white',
						padding: '1.5rem',
						borderRadius: '8px',
						boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
						cursor: 'pointer',
						transition: 'all 0.2s ease',
						border: '1px solid #e9ecef'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
						e.currentTarget.style.transform = 'translateY(-2px)';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
						e.currentTarget.style.transform = 'translateY(0)';
					}}
				>
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-start',
						marginBottom: '0.5rem'
					}}>
						<h3 style={{ margin: 0, color: '#333' }}>{project.title}</h3>
						<span style={{
							padding: '0.25rem 0.75rem',
							backgroundColor: project.status === 'active' ? '#28a745' :
								project.status === 'completed' ? '#6c757d' : '#ffc107',
							color: 'white',
							borderRadius: '12px',
							fontSize: '0.8rem',
							fontWeight: 'bold'
						}}>
							{project.status === 'active' ? 'Активный' :
								project.status === 'completed' ? 'Завершен' : 'В архиве'}
						</span>
					</div>

					{project.description && (
						<p style={{
							margin: '0.5rem 0',
							color: '#666',
							lineHeight: '1.4'
						}}>
							{project.description}
						</p>
					)}

					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginTop: '1rem',
						fontSize: '0.9rem',
						color: '#999'
					}}>
						<span>Задач: {project.tasks?.length || 0}</span>
						<span>Создан: {formatDate(project.createdAt)}</span>
					</div>
				</div>
			))}
		</div>
	);
};

export default ProjectList;