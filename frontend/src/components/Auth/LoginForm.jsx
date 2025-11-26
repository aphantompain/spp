// components/Auth/LoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginForm = () => {
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		const result = await login(formData.email, formData.password);

		if (result.success) {
			navigate('/projects');
		} else {
			setError(result.error);
		}

		setLoading(false);
	};

	return (
		<div style={{
			maxWidth: '400px',
			margin: '2rem auto',
			padding: '2rem',
			backgroundColor: 'white',
			borderRadius: '8px',
			boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
		}}>
			<h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Вход в систему</h2>

			{error && (
				<div style={{
					backgroundColor: '#f8d7da',
					color: '#721c24',
					padding: '0.75rem',
					borderRadius: '4px',
					marginBottom: '1rem'
				}}>
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: '1rem' }}>
					<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
						Email
					</label>
					<input
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						required
						style={{
							width: '100%',
							padding: '0.75rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '1rem'
						}}
						placeholder="Введите ваш email"
					/>
				</div>

				<div style={{ marginBottom: '1.5rem' }}>
					<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
						Пароль
					</label>
					<input
						type="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						required
						style={{
							width: '100%',
							padding: '0.75rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '1rem'
						}}
						placeholder="Введите ваш пароль"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					style={{
						width: '100%',
						padding: '0.75rem',
						backgroundColor: '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						fontSize: '1rem',
						cursor: loading ? 'not-allowed' : 'pointer',
						opacity: loading ? 0.6 : 1
					}}
				>
					{loading ? 'Вход...' : 'Войти'}
				</button>
			</form>

			<div style={{ textAlign: 'center', marginTop: '1rem' }}>
				<span style={{ color: '#666' }}>Нет аккаунта? </span>
				<Link
					to="/register"
					style={{ color: '#007bff', textDecoration: 'none' }}
				>
					Зарегистрироваться
				</Link>
			</div>
		</div>
	);
};

export default LoginForm;