// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectPage from './pages/ProjectPage';
import ProfilePage from './pages/ProfilePage';
import { ProjectProvider } from './context/ProjectContext';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Компонент для обертки навигации и основного контента
function AppContent() {
	return (
		<div className="App">
			<Navigation />
			<main style={{
				padding: '2rem',
				minHeight: 'calc(100vh - 80px)',
				backgroundColor: '#f8f9fa'
			}}>
				<ErrorBoundary>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/projects" element={<ProjectsPage />} />
						<Route path="/projects/:projectId" element={<ProjectPage />} />
						<Route path="/profile" element={<ProfilePage />} />
					</Routes>
				</ErrorBoundary>
			</main>
		</div>
	);
}

function App() {
	return (
		<ProjectProvider>
			<Router>
				<AppContent />
			</Router>
		</ProjectProvider>
	);
}

export default App;