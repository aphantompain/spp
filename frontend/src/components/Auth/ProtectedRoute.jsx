// components/Auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
	const { isAuthenticated, hasRole, loading } = useAuth();

	if (loading) {
		return <LoadingSpinner />;
	}

	if (!isAuthenticated()) {
		return <Navigate to="/login" replace />;
	}

	if (requiredRole && !hasRole(requiredRole)) {
		return (
			<div style={{
				textAlign: 'center',
				padding: '2rem',
				color: '#721c24',
				backgroundColor: '#f8d7da',
				margin: '2rem',
				borderRadius: '4px'
			}}>
				<h2>Доступ запрещен</h2>
				<p>У вас недостаточно прав для просмотра этой страницы.</p>
			</div>
		);
	}

	return children;
};

export default ProtectedRoute;