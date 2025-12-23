// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/layout/Navigation';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectPage from './pages/ProjectPage';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import AdminUsersPage from './pages/AdminUsersPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { ProjectProvider } from './context/ProjectContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import './App.css';

function AppContent() {
	const { loading } = useAuth();

	if (loading) {
		return <LoadingSpinner />;
	}

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
						{/* Публичные маршруты */}
						<Route path="/login" element={<LoginForm />} />
						<Route path="/register" element={<RegisterForm />} />
						<Route path="/" element={<HomePage />} />

						{/* Защищенные маршруты */}
						<Route path="/projects" element={
							<ProtectedRoute>
								<ProjectProvider>
									<ProjectsPage />
								</ProjectProvider>
							</ProtectedRoute>
						} />
						<Route path="/projects/:projectId" element={
							<ProtectedRoute>
								<ProjectProvider>
									<ProjectPage />
								</ProjectProvider>
							</ProtectedRoute>
						} />

						{/* Админские маршруты */}
						<Route path="/admin/users" element={
							<ProtectedRoute requiredRole="admin">
								<AdminUsersPage />
							</ProtectedRoute>
						} />

						{/* Перенаправление */}
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</ErrorBoundary>
			</main>
		</div>
	);
}

function App() {
	return (
		<Router>
			<AuthProvider>
				<AppContent />
			</AuthProvider>
		</Router>
	);
}

export default App;