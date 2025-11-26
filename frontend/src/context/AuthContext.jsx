// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(localStorage.getItem('token'));
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (token) {
			// Проверяем валидность токена при загрузке
			checkAuth();
		} else {
			setLoading(false);
		}
	}, []);

	const checkAuth = async () => {
		try {
			const userData = await apiService.getProfile();
			setUser(userData);
		} catch (error) {
			console.error('Auth check failed:', error);
			logout();
		} finally {
			setLoading(false);
		}
	};

	const login = async (email, password) => {
		try {
			const response = await apiService.login({ email, password });
			const { token: newToken, user: userData } = response;

			localStorage.setItem('token', newToken);
			setToken(newToken);
			setUser(userData);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error.message || 'Login failed'
			};
		}
	};

	const register = async (userData) => {
		try {
			const response = await apiService.register(userData);
			const { token: newToken, user: registeredUser } = response;

			localStorage.setItem('token', newToken);
			setToken(newToken);
			setUser(registeredUser);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error.message || 'Registration failed'
			};
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		setToken(null);
		setUser(null);
	};

	const isAuthenticated = () => {
		return !!token && !!user;
	};

	const hasRole = (role) => {
		return user?.role === role || user?.role === 'admin';
	};

	const value = {
		user,
		token,
		login,
		register,
		logout,
		isAuthenticated,
		hasRole,
		loading
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};