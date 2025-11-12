// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

class ApiService {
	constructor() {
		this.baseURL = API_BASE_URL;
	}

	async request(endpoint, options = {}) {
		const url = `${this.baseURL}${endpoint}`;

		try {
			const response = await fetch(url, {
				headers: {
					'Content-Type': 'application/json',
					...options.headers,
				},
				...options,
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
			}

			// Для DELETE запросов может не быть тела
			if (response.status === 204 || options.method === 'DELETE') {
				return null;
			}

			return response.json();
		} catch (error) {
			console.error('API request failed:', error);
			throw error;
		}
	}

	// Projects API
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

	// Tasks API
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