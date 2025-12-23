// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		console.error('Error caught by boundary:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{
					padding: '2rem',
					textAlign: 'center',
					backgroundColor: '#f8d7da',
					color: '#721c24',
					borderRadius: '8px',
					margin: '1rem'
				}}>
					<h2>Что-то пошло не так</h2>
					<p>Произошла ошибка при отображении этого компонента.</p>
					<button
						onClick={() => this.setState({ hasError: false, error: null })}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Попробовать снова
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;