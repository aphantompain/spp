// components/KanbanBoard/KanbanBoard.jsx
import React, { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import TaskForm from '../TaskForm/TaskForm';

const KanbanBoard = ({ project, onTaskUpdate, onTaskDelete, onTaskMove, onTaskAdd }) => {
	const [editingTask, setEditingTask] = useState(null);

	const columns = [
		{ id: 'todo', title: 'To Do', color: '#6c757d' },
		{ id: 'inProgress', title: 'In Progress', color: '#007bff' },
		{ id: 'done', title: 'Done', color: '#28a745' }
	];

	// Функция для безопасного форматирования даты
	const formatDate = (dateString) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString();
		} catch (error) {
			console.error('Error formatting date:', error);
			return 'Неизвестная дата';
		}
	};

	const handleTaskMove = (taskId, newStatus) => {
		onTaskMove(project.id, taskId, newStatus);
	};

	const handleAddTask = (columnId, task) => {
		onTaskAdd(project.id, { ...task, status: columnId });
	};

	const handleDeleteTask = (taskId) => {
		onTaskDelete(project.id, taskId);
	};

	const handleEditTask = (task) => {
		setEditingTask(task);
	};

	const handleUpdateTask = (updatedTask) => {
		onTaskUpdate(project.id, updatedTask.id, updatedTask);
		setEditingTask(null);
	};

	return (
		<div className="kanban-board">
			{/* Заголовок проекта */}
			<div style={{
				marginBottom: '2rem',
				padding: '1.5rem',
				backgroundColor: '#f8f9fa',
				borderRadius: '8px'
			}}>
				<h1 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
					{project.title}
				</h1>
				<p style={{ margin: '0 0 1rem 0', color: '#666' }}>
					{project.description}
				</p>
				<div style={{
					display: 'flex',
					gap: '1rem',
					fontSize: '0.9rem',
					color: '#666'
				}}>
					<span>Задач: {project.tasks?.length || 0}</span>
					<span>Создан: {formatDate(project.createdAt)}</span>
				</div>
			</div>

			{/* Kanban доска */}
			<div style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
				gap: '1.5rem'
			}}>
				{columns.map(column => (
					<KanbanColumn
						key={column.id}
						column={column}
						tasks={project.tasks?.filter(task => task.status === column.id) || []}
						onTaskMove={handleTaskMove}
						onAddTask={handleAddTask}
						onDeleteTask={handleDeleteTask}
						onEditTask={handleEditTask}
					/>
				))}
			</div>

			{/* Модальное окно редактирования */}
			{editingTask && (
				<EditTaskModal
					task={editingTask}
					onSave={handleUpdateTask}
					onCancel={() => setEditingTask(null)}
				/>
			)}
		</div>
	);
};

// Компонент модального окна редактирования (обновленный)
const EditTaskModal = ({ task, onSave, onCancel }) => {
	const [formData, setFormData] = useState({
		...task,
		// Преобразуем строку даты обратно в формат для input type="date"
		dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
	});

	const handleSubmit = (e) => {
		e.preventDefault();

		// Преобразуем дату обратно в ISO строку для сохранения
		const taskToSave = {
			...formData,
			dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
		};

		onSave(taskToSave);
	};

	const handleChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	return (
		<div style={{
			position: 'fixed',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: 'rgba(0,0,0,0.5)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			zIndex: 1000
		}}>
			<div style={{
				backgroundColor: 'white',
				padding: '2rem',
				borderRadius: '8px',
				width: '90%',
				maxWidth: '500px',
				maxHeight: '90vh',
				overflow: 'auto'
			}}>
				<h3 style={{ margin: '0 0 1.5rem 0' }}>Редактировать задачу</h3>

				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: '1rem' }}>
						<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
							Название *
						</label>
						<input
							type="text"
							value={formData.content}
							onChange={(e) => handleChange('content', e.target.value)}
							style={{
								width: '100%',
								padding: '0.5rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '1rem'
							}}
							required
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
								padding: '0.5rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '1rem',
								minHeight: '100px',
								resize: 'vertical'
							}}
						/>
					</div>

					<div style={{ marginBottom: '1rem' }}>
						<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
							Исполнитель
						</label>
						<input
							type="text"
							value={formData.assignee}
							onChange={(e) => handleChange('assignee', e.target.value)}
							style={{
								width: '100%',
								padding: '0.5rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '1rem'
							}}
							placeholder="Введите имя исполнителя"
						/>
					</div>

					<div style={{ marginBottom: '1rem' }}>
						<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
							Приоритет
						</label>
						<select
							value={formData.priority}
							onChange={(e) => handleChange('priority', e.target.value)}
							style={{
								width: '100%',
								padding: '0.5rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '1rem'
							}}
						>
							<option value="low">Низкий</option>
							<option value="medium">Средний</option>
							<option value="high">Высокий</option>
						</select>
					</div>

					<div style={{ marginBottom: '1.5rem' }}>
						<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
							Срок выполнения
						</label>
						<input
							type="date"
							value={formData.dueDate}
							onChange={(e) => handleChange('dueDate', e.target.value)}
							style={{
								width: '100%',
								padding: '0.5rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '1rem'
							}}
						/>
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
							Сохранить
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default KanbanBoard;