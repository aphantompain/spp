
export const projectStructure = {
	id: '',
	title: '',
	description: '',
	tasks: [], // массив задач проекта
	createdAt: new Date(),
	status: 'active' // active, completed, archived
};

export const mockProjects = [
	{
		id: '1',
		title: 'Веб-сайт компании',
		description: 'Разработка корпоративного сайта',
		tasks: [
			{ id: '1', title: 'Дизайн главной страницы', status: 'completed' },
			{ id: '2', title: 'Верстка каталога', status: 'active' },
			{ id: '3', title: 'Интеграция с API', status: 'pending' }
		],
		createdAt: new Date('2024-01-15'),
		status: 'active'
	},
	{
		id: '2',
		title: 'Мобильное приложение',
		description: 'Разработка iOS/Android приложения',
		tasks: [
			{ id: '4', title: 'Прототипирование', status: 'completed' },
			{ id: '5', title: 'UI/UX дизайн', status: 'active' }
		],
		createdAt: new Date('2024-02-01'),
		status: 'active'
	},
	{
		id: '3',
		title: 'Админ панель',
		description: 'Панель управления для администраторов',
		tasks: [
			{ id: '6', title: 'Авторизация', status: 'completed' },
			{ id: '7', title: 'Дашборд', status: 'completed' },
			{ id: '8', title: 'Управление пользователями', status: 'completed' }
		],
		createdAt: new Date('2024-01-10'),
		status: 'completed'
	}
];

// Вспомогательные функции для работы с проектами
export const getTaskCountByStatus = (project, status) => {
	return project.tasks.filter(task => task.status === status).length;
};

export const getTotalTasks = (project) => {
	return project.tasks.length;
};

export const getActiveTasksCount = (project) => {
	return getTaskCountByStatus(project, 'active');
};

export const getCompletedTasksCount = (project) => {
	return getTaskCountByStatus(project, 'completed');
};

export const getTasksByStatus = (project, status) => {
	return project.tasks ? project.tasks.filter(task => task.status === status) : [];
};

export const getTodoTasksCount = (project) => {
	return getTasksByStatus(project, 'todo').length;
};

export const getInProgressTasksCount = (project) => {
	return getTasksByStatus(project, 'inProgress').length;
};

export const getDoneTasksCount = (project) => {
	return getTasksByStatus(project, 'done').length;
};

export const getProjectProgress = (project) => {
	if (!project.tasks || project.tasks.length === 0) return 0;
	const doneTasks = getDoneTasksCount(project);
	return Math.round((doneTasks / project.tasks.length) * 100);
};