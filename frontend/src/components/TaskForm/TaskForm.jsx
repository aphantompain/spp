// components/TaskForm/TaskForm.jsx
import React, { useState } from 'react';

const TaskForm = ({ onSubmit, onCancel, initialStatus }) => {
	const [formData, setFormData] = useState({
		content: '',
		description: '',
		assignee: '',
		priority: 'medium',
		dueDate: '',
		status: initialStatus || 'todo'
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (formData.content.trim()) {
			// Форматируем дату для API
			const submitData = {
				...formData,
				dueDate: formData.dueDate || null
			};
			onSubmit(submitData);
			setFormData({
				content: '',
				description: '',
				assignee: '',
				priority: 'medium',
				dueDate: '',
				status: initialStatus || 'todo'
			});
		}
	};

	const handleChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	return (
		<div style={{
			backgroundColor: 'white',
			padding: '1rem',
			borderRadius: '6px',
			border: '1px solid #ddd'
		}}>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: '0.75rem' }}>
					<input
						type="text"
						value={formData.content}
						onChange={(e) => handleChange('content', e.target.value)}
						placeholder="Название задачи *"
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '0.9rem'
						}}
						required
					/>
				</div>

				<div style={{ marginBottom: '0.75rem' }}>
					<textarea
						value={formData.description}
						onChange={(e) => handleChange('description', e.target.value)}
						placeholder="Описание"
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '0.9rem',
							minHeight: '60px',
							resize: 'vertical'
						}}
					/>
				</div>

				<div style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: '0.5rem',
					marginBottom: '0.75rem'
				}}>
					<input
						type="text"
						value={formData.assignee}
						onChange={(e) => handleChange('assignee', e.target.value)}
						placeholder="Исполнитель"
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '0.9rem'
						}}
					/>

					<select
						value={formData.priority}
						onChange={(e) => handleChange('priority', e.target.value)}
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '0.9rem'
						}}
					>
						<option value="low">Низкий</option>
						<option value="medium">Средний</option>
						<option value="high">Высокий</option>
					</select>
				</div>

				<div style={{ marginBottom: '0.75rem' }}>
					<input
						type="date"
						value={formData.dueDate}
						onChange={(e) => handleChange('dueDate', e.target.value)}
						style={{
							width: '100%',
							padding: '0.5rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '0.9rem'
						}}
					/>
				</div>

				<div style={{ display: 'flex', gap: '0.5rem' }}>
					<button
						type="submit"
						style={{
							flex: 1,
							padding: '0.5rem',
							backgroundColor: '#28a745',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
							fontSize: '0.9rem'
						}}
					>
						Добавить
					</button>
					<button
						type="button"
						onClick={onCancel}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor: '#6c757d',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
							fontSize: '0.9rem'
						}}
					>
						Отмена
					</button>
				</div>
			</form>
		</div>
	);
};

export default TaskForm;