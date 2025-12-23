// pages/HomePage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
	const { isAuthenticated, user } = useAuth();
	const navigate = useNavigate();

	if (isAuthenticated()) {
		return (
			<div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
				<h1>Добро пожаловать, {user?.firstName}!</h1>
				<p>Вы вошли в систему как <strong>{user?.role}</strong>.</p>
				<button
					onClick={() => navigate('/projects')}
					style={{
						padding: '0.75rem 1.5rem',
						backgroundColor: '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						fontSize: '1rem',
						marginTop: '1rem'
					}}
				>
					Перейти к проектам
				</button>
			</div>
		);
	}

	return (
		<div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
			<h1>Добро пожаловать в TaskManager!</h1>
			<p>Система управления проектами и задачами с ролевой моделью доступа.</p>
			<div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
				<button
					onClick={() => navigate('/login')}
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
					Войти
				</button>
				<button
					onClick={() => navigate('/register')}
					style={{
						padding: '0.75rem 1.5rem',
						backgroundColor: '#28a745',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						fontSize: '1rem'
					}}
				>
					Зарегистрироваться
				</button>
			</div>
		</div>
	);
};

export default HomePage;