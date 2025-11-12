/**
 * Форматирует объект Date в удобочитаемую строку (например, "15.10.2023, 12:30")
 * @param {Date} date - Объект даты
 * @returns {string} Отформатированная строка с датой и временем
 */
export const formatDate = (date) => {
	return date.toLocaleString('ru-RU'); // 'ru-RU' для русского формата дат
};

/**
 * Создает строку даты в формате YYYY-MM-DD (для атрибута value в input[type="date"])
 * @param {Date} date - Объект даты
 * @returns {string} Строка в формате YYYY-MM-DD
 */
export const getDateInputValue = (date) => {
	return date.toISOString().split('T')[0];
};