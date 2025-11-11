// pages/ProjectsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectList from '../components/ui/ProjectList';
import ProjectForm from '../components/ProjectForm/ProjectForm';
import { useProject } from '../context/ProjectContext';

const ProjectsPage = () => {
	const navigate = useNavigate();
	const { projects, addProject } = useProject();
	const [showForm, setShowForm] = useState(false);

	const handleProjectSelect = (project) => {
		navigate(`/projects/${project.id}`);
	};

	const handleAddProject = (projectData) => {
		addProject(projectData);
		setShowForm(false);
	};

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
					style={{
						padding: '0.75rem 1.5rem',
						backgroundColor: '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						fontSize: '1rem'
					}}
				>
					+ Создать проект
				</button>
			</div>

			{showForm ? (
				<ProjectForm
					onSubmit={handleAddProject}
					onCancel={() => setShowForm(false)}
				/>
			) : (
				<ProjectList
					projects={projects}
					onProjectSelect={handleProjectSelect}
				/>
			)}
		</div>
	);
};

export default ProjectsPage;