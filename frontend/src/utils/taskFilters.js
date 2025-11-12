/**
 * Фильтрует массив задач по статусу
 * @param {Array} tasks - Массив задач
 * @param {string} status - Статус для фильтрации (например, 'active', 'completed', 'pending')
 * @returns {Array} Отфильтрованный массив задач
 */
export const filterTasksByStatus = (tasks, status) => {
	if (!tasks || !Array.isArray(tasks)) return [];
	return tasks.filter(task => task.status === status);
};

// Можно создать несколько предустановленных фильтров для удобства
export const getActiveTasks = (tasks) => filterTasksByStatus(tasks, 'active');
export const getCompletedTasks = (tasks) => filterTasksByStatus(tasks, 'completed');