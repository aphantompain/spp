// components/KanbanBoard/KanbanColumn.jsx
import React, { useState } from 'react';
import TaskCard from '../TaskCard/TaskCard'; // Импортируем TaskCard вместо KanbanTask
import TaskForm from '../TaskForm/TaskForm';

const KanbanColumn = ({ column, tasks, onTaskMove, onAddTask, onDeleteTask, onEditTask }) => {
	const [isAdding, setIsAdding] = useState(false);

	const handleAddSubmit = (task) => {
		onAddTask(column.id, task);
		setIsAdding(false);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
	};

	const handleDrop = (e) => {
		e.preventDefault();
		const taskId = e.dataTransfer.getData('taskId');
		if (taskId) {
			onTaskMove(taskId, column.id);
		}
	};

	return (
		<div
			className="kanban-column"
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			style={{
				backgroundColor: '#f8f9fa',
				borderRadius: '8px',
				padding: '1rem',
				minHeight: '500px',
				border: `2px dashed ${column.color}33`
			}}
		>
			{/* Заголовок колонки */}
			<div style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				marginBottom: '1rem',
				paddingBottom: '0.5rem',
				borderBottom: `2px solid ${column.color}`
			}}>
				<h3 style={{
					margin: 0,
					color: column.color,
					display: 'flex',
					alignItems: 'center',
					gap: '0.5rem'
				}}>
					<span style={{
						width: '12px',
						height: '12px',
						borderRadius: '50%',
						backgroundColor: column.color
					}}></span>
					{column.title}
				</h3>
				<span style={{
					backgroundColor: column.color,
					color: 'white',
					borderRadius: '12px',
					padding: '0.25rem 0.5rem',
					fontSize: '0.8rem',
					fontWeight: 'bold'
				}}>
					{tasks.length}
				</span>
			</div>

			{/* Список задач - используем TaskCard вместо KanbanTask */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
				{tasks.map(task => (
					<TaskCard
						key={task.id}
						task={task}
						onDelete={onDeleteTask}
						onEdit={onEditTask}
					/>
				))}
			</div>

			{/* Форма создания задачи или кнопка */}
			{isAdding ? (
				<div style={{ marginTop: '1rem' }}>
					<TaskForm
						onSubmit={handleAddSubmit}
						onCancel={() => setIsAdding(false)}
						initialStatus={column.id}
					/>
				</div>
			) : (
				<button
					onClick={() => setIsAdding(true)}
					style={{
						width: '100%',
						marginTop: '1rem',
						padding: '0.75rem',
						border: `2px dashed ${column.color}`,
						backgroundColor: 'transparent',
						color: column.color,
						borderRadius: '4px',
						cursor: 'pointer',
						fontSize: '0.9rem',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '0.5rem'
					}}
				>
					<span style={{ fontSize: '1.2rem' }}>+</span>
					Добавить задачу
				</button>
			)}
		</div>
	);
};

export default KanbanColumn;