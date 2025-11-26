// components/Auth/RegisterForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm = () => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		firstName: '',
		lastName: ''
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const { register } = useAuth();
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

		const result = await register(formData);

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
			<h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Регистрация</h2>

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
						Имя
					</label>
					<input
						type="text"
						name="firstName"
						value={formData.firstName}
						onChange={handleChange}
						required
						style={{
							width: '100%',
							padding: '0.75rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '1rem'
						}}
						placeholder="Введите ваше имя"
					/>
				</div>

				<div style={{ marginBottom: '1rem' }}>
					<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
						Фамилия
					</label>
					<input
						type="text"
						name="lastName"
						value={formData.lastName}
						onChange={handleChange}
						required
						style={{
							width: '100%',
							padding: '0.75rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '1rem'
						}}
						placeholder="Введите вашу фамилию"
					/>
				</div>

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
						minLength="6"
						style={{
							width: '100%',
							padding: '0.75rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '1rem'
						}}
						placeholder="Введите пароль (минимум 6 символов)"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					style={{
						width: '100%',
						padding: '0.75rem',
						backgroundColor: '#28a745',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						fontSize: '1rem',
						cursor: loading ? 'not-allowed' : 'pointer',
						opacity: loading ? 0.6 : 1
					}}
				>
					{loading ? 'Регистрация...' : 'Зарегистрироваться'}
				</button>
			</form>

			<div style={{ textAlign: 'center', marginTop: '1rem' }}>
				<span style={{ color: '#666' }}>Уже есть аккаунт? </span>
				<Link
					to="/login"
					style={{ color: '#007bff', textDecoration: 'none' }}
				>
					Войти
				</Link>
			</div>
		</div>
	);
};

export default RegisterForm;