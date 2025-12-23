// components/ui/ErrorMessage.jsx
import React from 'react';

const ErrorMessage = ({ error, onRetry, onClose }) => {
	if (!error) return null;

	return (
		<div style={{
			backgroundColor: '#f8d7da',
			color: '#721c24',
			padding: '1rem',
			borderRadius: '4px',
			marginBottom: '1rem',
			border: '1px solid #f5c6cb',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'flex-start'
		}}>
			<div style={{ flex: 1 }}>
				<strong>Ошибка:</strong> {error}
			</div>
			<div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
				{onRetry && (
					<button
						onClick={onRetry}
						style={{
							padding: '0.25rem 0.5rem',
							backgroundColor: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '3px',
							cursor: 'pointer',
							fontSize: '0.8rem'
						}}
					>
						Повторить
					</button>
				)}
				{onClose && (
					<button
						onClick={onClose}
						style={{
							padding: '0.25rem 0.5rem',
							backgroundColor: '#6c757d',
							color: 'white',
							border: 'none',
							borderRadius: '3px',
							cursor: 'pointer',
							fontSize: '0.8rem'
						}}
					>
						×
					</button>
				)}
			</div>
		</div>
	);
};

export default ErrorMessage;