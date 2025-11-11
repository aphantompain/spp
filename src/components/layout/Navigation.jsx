// components/layout/Navigation.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const getCurrentPage = () => {
		const path = location.pathname;
		if (path === '/') return 'home';
		if (path.startsWith('/projects')) return 'projects';
		if (path === '/profile') return 'profile';
		return 'home';
	};

	const current = getCurrentPage();

	return (
		<nav style={{
			backgroundColor: '#343a40',
			padding: '1rem 2rem',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center'
		}}>
			<div style={{
				display: 'flex',
				alignItems: 'center',
				gap: '2rem'
			}}>
				<h1 style={{
					color: 'white',
					margin: 0,
					fontSize: '1.5rem',
					cursor: 'pointer'
				}} onClick={() => navigate('/')}>
					TaskManager
				</h1>

				<div style={{ display: 'flex', gap: '1rem' }}>
					<button
						onClick={() => navigate('/')}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor: current === 'home' ? '#007bff' : 'transparent',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
							textDecoration: 'none'
						}}
					>
						Главная
					</button>
					<button
						onClick={() => navigate('/projects')}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor: current === 'projects' ? '#007bff' : 'transparent',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
							textDecoration: 'none'
						}}
					>
						Проекты
					</button>
				</div>
			</div>

			<button
				onClick={() => navigate('/profile')}
				style={{
					padding: '0.5rem 1rem',
					backgroundColor: current === 'profile' ? '#007bff' : 'transparent',
					color: 'white',
					border: 'none',
					borderRadius: '4px',
					cursor: 'pointer'
				}}
			>
				Профиль
			</button>
		</nav>
	);
};

export default Navigation;