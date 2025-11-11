// components/TaskCard/TaskCard.jsx
import React from 'react';

const TaskCard = ({ task, onDelete, onEdit }) => {
	const handleDragStart = (e) => {
		e.dataTransfer.setData('taskId', task.id);
	};

	// Функция для безопасного форматирования даты
	const formatDate = (dateString) => {
		try {
			if (!dateString) return '';
			const date = new Date(dateString);
			return date.toLocaleDateString();
		} catch (error) {
			console.error('Error formatting date:', error);
			return '';
		}
	};

	const priorityColors = {
		high: '#dc3545',
		medium: '#ffc107',
		low: '#28a745'
	};

	const handleDeleteClick = (e) => {
		e.stopPropagation();
		if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
			onDelete(task.id);
		}
	};

	const handleEditClick = (e) => {
		e.stopPropagation();
		onEdit(task);
	};

	return (
		<div
			draggable
			onDragStart={handleDragStart}
			onClick={handleEditClick}
			style={{
				backgroundColor: 'white',
				border: `1px solid ${priorityColors[task.priority] || '#ddd'}`,
				borderRadius: '6px',
				padding: '0.75rem',
				cursor: 'grab',
				boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
				transition: 'all 0.2s ease',
				position: 'relative'
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
				e.currentTarget.style.transform = 'translateY(-1px)';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
				e.currentTarget.style.transform = 'translateY(0)';
			}}
		>
			{/* Заголовок и приоритет */}
			<div style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'flex-start',
				marginBottom: '0.5rem'
			}}>
				<h4 style={{
					margin: 0,
					fontSize: '0.9rem',
					flex: 1
				}}>
					{task.content}
				</h4>
				<span
					style={{
						backgroundColor: priorityColors[task.priority] || '#6c757d',
						color: 'white',
						padding: '0.2rem 0.5rem',
						borderRadius: '12px',
						fontSize: '0.7rem',
						fontWeight: 'bold',
						marginLeft: '0.5rem'
					}}
				>
					{task.priority === 'high' ? 'ВЫС' : task.priority === 'medium' ? 'СР' : 'НИЗ'}
				</span>
			</div>

			{/* Описание */}
			{task.description && (
				<p style={{
					margin: '0.5rem 0',
					fontSize: '0.8rem',
					color: '#666',
					lineHeight: '1.3'
				}}>
					{task.description}
				</p>
			)}

			{/* Исполнитель и даты */}
			<div style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				marginTop: '0.75rem'
			}}>
				<div style={{ fontSize: '0.75rem', color: '#666' }}>
					{task.assignee && (
						<div>👤 {task.assignee}</div>
					)}
					{task.dueDate && (
						<div>📅 {formatDate(task.dueDate)}</div>
					)}
				</div>

				{/* Кнопки действий */}
				<div style={{ display: 'flex', gap: '0.25rem' }}>
					<button
						onClick={handleEditClick}
						style={{
							padding: '0.25rem 0.5rem',
							backgroundColor: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '3px',
							cursor: 'pointer',
							fontSize: '0.7rem'
						}}
					>
						✏️
					</button>
					<button
						onClick={handleDeleteClick}
						style={{
							padding: '0.25rem 0.5rem',
							backgroundColor: '#dc3545',
							color: 'white',
							border: 'none',
							borderRadius: '3px',
							cursor: 'pointer',
							fontSize: '0.7rem'
						}}
					>
						🗑️
					</button>
				</div>
			</div>
		</div>
	);
};

export default TaskCard;