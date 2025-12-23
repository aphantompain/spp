// pages/AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const AdminUsersPage = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadUsers();
	}, []);

	const loadUsers = async () => {
		try {
			const usersData = await apiService.getAllUsers();
			setUsers(usersData);
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleRoleChange = async (userId, newRole) => {
		try {
			await apiService.updateUserRole(userId, newRole);
			// Обновляем локальное состояние
			setUsers(users.map(user =>
				user.id === userId ? { ...user, role: newRole } : user
			));
		} catch (error) {
			setError(error.message);
		}
	};

	const getRoleColor = (role) => {
		switch (role) {
			case 'admin': return '#dc3545';
			case 'moderator': return '#ffc107';
			default: return '#6c757d';
		}
	};

	if (loading) return <LoadingSpinner />;

	return (
		<div style={{ maxWidth: '800px', margin: '0 auto' }}>
			<h1 style={{ marginBottom: '2rem' }}>Управление пользователями</h1>

			<ErrorMessage error={error} onClose={() => setError(null)} />

			<div style={{
				backgroundColor: 'white',
				borderRadius: '8px',
				overflow: 'hidden',
				boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
			}}>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr style={{ backgroundColor: '#f8f9fa' }}>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Пользователь</th>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Email</th>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Роль</th>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Дата регистрации</th>
						</tr>
					</thead>
					<tbody>
						{users.map(user => (
							<tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
								<td style={{ padding: '1rem' }}>
									{user.firstName} {user.lastName}
								</td>
								<td style={{ padding: '1rem' }}>{user.email}</td>
								<td style={{ padding: '1rem' }}>
									<select
										value={user.role}
										onChange={(e) => handleRoleChange(user.id, e.target.value)}
										style={{
											padding: '0.5rem',
											border: '1px solid #ddd',
											borderRadius: '4px',
											backgroundColor: getRoleColor(user.role),
											color: 'white',
											fontWeight: 'bold'
										}}
									>
										<option value="user">Пользователь</option>
										<option value="moderator">Модератор</option>
										<option value="admin">Администратор</option>
									</select>
								</td>
								<td style={{ padding: '1rem' }}>
									{new Date(user.createdAt).toLocaleDateString()}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default AdminUsersPage;