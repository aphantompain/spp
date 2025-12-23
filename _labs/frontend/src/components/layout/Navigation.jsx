// components/layout/Navigation.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navigation = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout, isAuthenticated, hasRole } = useAuth();

	const getCurrentPage = () => {
		const path = location.pathname;
		if (path === '/') return 'home';
		if (path.startsWith('/projects')) return 'projects';
		if (path.startsWith('/admin')) return 'admin';
		return 'home';
	};

	const current = getCurrentPage();

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	if (!isAuthenticated()) {
		return (
			<nav style={{
				backgroundColor: '#343a40',
				padding: '1rem 2rem',
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
					<h1 style={{
						color: 'white',
						margin: 0,
						fontSize: '1.5rem',
						cursor: 'pointer'
					}} onClick={() => navigate('/')}>
						TaskManager
					</h1>
				</div>

				<div style={{ display: 'flex', gap: '1rem' }}>
					<button
						onClick={() => navigate('/login')}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor: current === 'login' ? '#007bff' : 'transparent',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Вход
					</button>
					<button
						onClick={() => navigate('/register')}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor: current === 'register' ? '#007bff' : 'transparent',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Регистрация
					</button>
				</div>
			</nav>
		);
	}

	return (
		<nav style={{
			backgroundColor: '#343a40',
			padding: '1rem 2rem',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center'
		}}>
			<div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
				<h1 style={{
					color: 'white',
					margin: 0,
					fontSize: '1.5rem',
					cursor: 'pointer'
				}} onClick={() => navigate('/projects')}>
					TaskManager
				</h1>

				<div style={{ display: 'flex', gap: '1rem' }}>
					<button
						onClick={() => navigate('/projects')}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor: current === 'projects' ? '#007bff' : 'transparent',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Проекты
					</button>

					{hasRole('admin') && (
						<button
							onClick={() => navigate('/admin/users')}
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: current === 'admin' ? '#007bff' : 'transparent',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer'
							}}
						>
							Админ панель
						</button>
					)}
				</div>
			</div>

			<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
				<span style={{ color: 'white' }}>
					{user?.firstName} {user?.lastName}
					<span style={{
						marginLeft: '0.5rem',
						padding: '0.2rem 0.5rem',
						backgroundColor: user?.role === 'admin' ? '#dc3545' :
							user?.role === 'moderator' ? '#ffc107' : '#6c757d',
						borderRadius: '12px',
						fontSize: '0.8rem'
					}}>
						{user?.role}
					</span>
				</span>
				<button
					onClick={handleLogout}
					style={{
						padding: '0.5rem 1rem',
						backgroundColor: '#dc3545',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer'
					}}
				>
					Выйти
				</button>
			</div>
		</nav>
	);
};

export default Navigation;