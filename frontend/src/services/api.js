// services/api.js
class ApiService {
	constructor() {
		this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
	}

	getAuthHeaders() {
		const token = localStorage.getItem('token');
		return token ? { 'Authorization': `Bearer ${token}` } : {};
	}

	async request(endpoint, options = {}) {
		const url = `${this.baseURL}${endpoint}`;

		const config = {
			headers: {
				'Content-Type': 'application/json',
				...this.getAuthHeaders(),
				...options.headers,
			},
			...options,
		};

		try {
			const response = await fetch(url, config);

			// Если 401 Unauthorized, очищаем токен
			if (response.status === 401) {
				localStorage.removeItem('token');
				window.location.href = '/login';
			}

			if (!response.ok) {
				let errorMessage = `HTTP error! status: ${response.status}`;
				try {
					// Пытаемся прочитать как JSON
					const errorData = await response.json();
					errorMessage = errorData.error || errorData.message || errorMessage;
				} catch (e) {
					// Если не JSON, используем дефолтное сообщение
					// Тело ответа уже прочитано, поэтому просто используем статус
				}
				throw new Error(errorMessage);
			}

			if (response.status === 204 || options.method === 'DELETE') {
				return null;
			}

			return response.json();
		} catch (error) {
			console.error('API request failed:', error);
			throw error;
		}
	}

	// Auth API
	async login(credentials) {
		return this.request('/auth/login', {
			method: 'POST',
			body: JSON.stringify(credentials),
		});
	}

	async register(userData) {
		return this.request('/auth/register', {
			method: 'POST',
			body: JSON.stringify(userData),
		});
	}

	async getProfile() {
		return this.request('/profile');
	}

	// Users API (admin only)
	async getAllUsers() {
		return this.request('/admin/users');
	}

	async updateUserRole(userId, role) {
		return this.request(`/admin/users/${userId}/role`, {
			method: 'PUT',
			body: JSON.stringify({ role }),
		});
	}

	// Projects API (остаются без изменений)
	async getProjects() {
		return this.request('/projects');
	}

	async getProject(id) {
		return this.request(`/projects/${id}`);
	}

	async createProject(projectData) {
		return this.request('/projects', {
			method: 'POST',
			body: JSON.stringify(projectData),
		});
	}

	async updateProject(id, projectData) {
		return this.request(`/projects/${id}`, {
			method: 'PUT',
			body: JSON.stringify(projectData),
		});
	}

	async deleteProject(id) {
		return this.request(`/projects/${id}`, {
			method: 'DELETE',
		});
	}

	async exportProject(id, format = 'excel') {
		const url = `${this.baseURL}/projects/${id}/export?format=${format}`;
		const token = localStorage.getItem('token');

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
		}

		const blob = await response.blob();
		const downloadUrl = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = downloadUrl;

		const contentDisposition = response.headers.get('Content-Disposition');
		let filename = `project_${id}.${format === 'word' ? 'doc' : 'xlsx'}`;
		if (contentDisposition) {
			const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
			if (filenameMatch) {
				filename = filenameMatch[1];
			}
		}

		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(downloadUrl);
	}

	// Tasks API (остаются без изменений)
	async getTasksByProject(projectId) {
		return this.request(`/tasks/project/${projectId}`);
	}

	async getTask(id) {
		return this.request(`/tasks/${id}`);
	}

	async createTask(taskData) {
		return this.request('/tasks', {
			method: 'POST',
			body: JSON.stringify(taskData),
		});
	}

	async updateTask(id, taskData) {
		return this.request(`/tasks/${id}`, {
			method: 'PUT',
			body: JSON.stringify(taskData),
		});
	}

	async deleteTask(id) {
		return this.request(`/tasks/${id}`, {
			method: 'DELETE',
		});
	}
}

export const apiService = new ApiService();