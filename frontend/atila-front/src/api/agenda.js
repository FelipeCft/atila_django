import { api } from './authService';
import axios from 'axios';

const BASE_URL = 'agenda/';

// --- función helper para llamadas sin autenticación ---
const publicApi = axios.create({
    baseURL: api.defaults.baseURL,
});


// Citas
export const getCitas = async () => {
    try {
        const response = await api.get(`${BASE_URL}citas/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createCita = async (citaData) => {
    try {
        const response = await api.post(`${BASE_URL}citas/`, citaData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateCita = async (id, citaData) => {
    try {
        const response = await api.patch(`${BASE_URL}citas/${id}/`, citaData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteCita = async (id) => {
    try {
        await api.delete(`${BASE_URL}citas/${id}/`);
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Horarios Disponibles
export const getHorarios = async () => {
    try {
        const response = await api.get(`${BASE_URL}horarios/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createHorario = async (horarioData) => {
    try {
        const response = await api.post(`${BASE_URL}horarios/`, horarioData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteHorario = async (id) => {
    try {
        await api.delete(`${BASE_URL}horarios/${id}/`);
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateHorario = async (id, horarioData) => {
    try {
        const response = await api.patch(`${BASE_URL}horarios/${id}/`, horarioData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};




// Horario General
export const getHorarioGeneral = async () => {
    try {
        const response = await api.get(`${BASE_URL}horarios-general/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createHorarioGeneral = async (data) => {
    try {
        const response = await api.post(`${BASE_URL}horarios-general/`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateHorarioGeneral = async (id, data) => {
    try {
        const response = await api.patch(`${BASE_URL}horarios-general/${id}/`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteHorarioGeneral = async (id) => {
    try {
        await api.delete(`${BASE_URL}horarios-general/${id}/`);
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const toggleHorarioGeneralActive = async (id) => {
    try {
        const response = await api.post(`${BASE_URL}horarios-general/${id}/toggle_active/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// ─── Disponibilidad Pública (sin autenticación) ───────────────────────────

/**
 * Obtiene la disponibilidad semanal de los doctores sin datos de pacientes.
 * @param {Object} params - { profesional_id?, servicio_id? }
 */
export const getDisponibilidadPublica = async (params = {}) => {
    try {
        const response = await publicApi.get(`${BASE_URL}disponibilidad-publica/`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

