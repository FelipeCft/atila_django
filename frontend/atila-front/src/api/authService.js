import axios from "axios";

// Use environment variable with fallback for development
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";


// ... (helpers)

// Crear instancia de axios configurada
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para agregar Token de autenticación
api.interceptors.request.use(config => {
    const token = localStorage.getItem('atila_token');
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
});

/**
 * Servicio de autenticación para comunicarse con el backend
 */

/**
 * Registro público de usuarios (solo crea usuarios con rol CLIENT)
 * @param {Object} userData - Datos del usuario {username, email, password, first_name, last_name, position}
 * @returns {Promise} Respuesta del servidor
 */
export const publicRegister = async (userData) => {
    try {
        const response = await api.post(`auth/register/`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al registrar usuario" };
    }
};

/**
 * Registro de usuarios por administradores (puede crear cualquier rol)
 * @param {Object} userData - Datos del usuario {username, email, password, first_name, last_name, position, role}
 * @returns {Promise} Respuesta del servidor
 */
export const adminRegister = async (userData) => {
    try {
        const response = await api.post(`auth/admin/register/`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al crear usuario" };
    }
};

/**
 * Login de usuarios (acepta username o email)
 * @param {Object} credentials - Credenciales {identifier, password}
 * @returns {Promise} Respuesta del servidor con datos del usuario
 */
export const login = async (credentials) => {
    try {
        const response = await api.post(`auth/login/`, credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al iniciar sesión" };
    }
};
