import { api } from './authService';

const BASE_URL = 'agenda/dashboard/';

export const getDashboardStats = async () => {
    try {
        const response = await api.get(`${BASE_URL}stats/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getDashboardAlerts = async () => {
    try {
        const response = await api.get(`${BASE_URL}alerts/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getDashboardTrends = async (days = 7) => {
    try {
        const response = await api.get(`${BASE_URL}trends/`, {
            params: { days }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getDashboardActivity = async (limit = 10) => {
    try {
        const response = await api.get(`${BASE_URL}activity/`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getDashboardTopServices = async (limit = 5, days = 30) => {
    try {
        const response = await api.get(`${BASE_URL}top-services/`, {
            params: { limit, days }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
