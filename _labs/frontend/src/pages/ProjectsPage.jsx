// pages/ProjectsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectList from '../components/ui/ProjectList';
import ProjectForm from '../components/ProjectForm/ProjectForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useProject } from '../context/ProjectContext';

const ProjectsPage = () => {
	const navigate = useNavigate();
	const { projects, loading, error, addProject, refreshProjects, clearError } = useProject();
	const [showForm, setShowForm] = useState(false);

	const handleProjectSelect = (project) => {
		console.log('Project selected for navigation:', project.id, project.title);
		navigate(`/projects/${project.id}`);
	};

	const handleAddProject = async (projectData) => {
		try {
			await addProject(projectData);
			setShowForm(false);
		} catch (error) {
			// Ошибка уже обработана в контексте
		}
	};

	const handleRetry = () => {
		clearError();
		refreshProjects();
	};

	if (loading && projects.length === 0) {
		return (
			<div style={{ maxWidth: '800px', margin: '0 auto' }}>
				<LoadingSpinner size="large" />
			</div>
		);
	}

	return (
		<div style={{ maxWidth: '800px', margin: '0 auto' }}>
			<div style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				marginBottom: '2rem'
			}}>
				<h1 style={{ margin: 0 }}>Мои проекты</h1>
				<button
					onClick={() => setShowForm(true)}
					disabled={loading}
					style={{
						padding: '0.75rem 1.5rem',
						backgroundColor: '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: loading ? 'not-allowed' : 'pointer',
						fontSize: '1rem',
						opacity: loading ? 0.6 : 1
					}}
				>
					{loading ? 'Загрузка...' : '+ Создать проект'}
				</button>
			</div>

			<ErrorMessage
				error={error}
				onRetry={handleRetry}
				onClose={clearError}
			/>

			{showForm ? (
				<ProjectForm
					onSubmit={handleAddProject}
					onCancel={() => setShowForm(false)}
					loading={loading}
				/>
			) : (
				<>
					{loading && <LoadingSpinner />}
					<ProjectList
						projects={projects}
						onProjectSelect={handleProjectSelect}
						loading={loading}
					/>
				</>
			)}
		</div>
	);
};

export default ProjectsPage;