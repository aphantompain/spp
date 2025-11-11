// components/ProjectForm/ProjectForm.jsx
import React, { useState } from 'react';

const ProjectForm = ({ onSubmit, onCancel, initialData }) => {
	const [formData, setFormData] = useState(initialData || {
		title: '',
		description: '',
		status: 'active'
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (formData.title.trim()) {
			onSubmit(formData);
			setFormData({ title: '', description: '', status: 'active' });
		}
	};

	const handleChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	return (
		<div style={{
			backgroundColor: 'white',
			padding: '2rem',
			borderRadius: '8px',
			boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
			marginBottom: '2rem'
		}}>
			<h3 style={{ margin: '0 0 1.5rem 0' }}>
				{initialData ? 'Редактировать проект' : 'Создать новый проект'}
			</h3>

			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: '1rem' }}>
					<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
						Название проекта *
					</label>
					<input
						type="text"
						value={formData.title}
						onChange={(e) => handleChange('title', e.target.value)}
						style={{
							width: '100%',
							padding: '0.75rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '1rem'
						}}
						required
						placeholder="Введите название проекта"
					/>
				</div>

				<div style={{ marginBottom: '1rem' }}>
					<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
						Описание
					</label>
					<textarea
						value={formData.description}
						onChange={(e) => handleChange('description', e.target.value)}
						style={{
							width: '100%',
							padding: '0.75rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '1rem',
							minHeight: '100px',
							resize: 'vertical'
						}}
						placeholder="Опишите ваш проект"
					/>
				</div>

				<div style={{ marginBottom: '1.5rem' }}>
					<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
						Статус
					</label>
					<select
						value={formData.status}
						onChange={(e) => handleChange('status', e.target.value)}
						style={{
							width: '100%',
							padding: '0.75rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '1rem'
						}}
					>
						<option value="active">Активный</option>
						<option value="completed">Завершенный</option>
						<option value="archived">В архиве</option>
					</select>
				</div>

				<div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
					<button
						type="button"
						onClick={onCancel}
						style={{
							padding: '0.75rem 1.5rem',
							backgroundColor: '#6c757d',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Отмена
					</button>
					<button
						type="submit"
						style={{
							padding: '0.75rem 1.5rem',
							backgroundColor: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						{initialData ? 'Сохранить' : 'Создать проект'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default ProjectForm;