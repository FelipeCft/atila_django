import { api } from './authService';

/**
 * Obtener la lista de todos los usuarios (Solo Admin)
 * @returns {Promise} Lista de usuarios
 */
export const getAllUsers = async () => {
    try {
        const response = await api.get('users/');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al obtener usuarios" };
    }
};

/**
 * Eliminar un usuario por ID
 * @param {number} userId - ID del usuario a eliminar
 * @returns {Promise}
 */
export const deleteUser = async (userId) => {
    // Nota: Aún no hemos implementado este endpoint en el backend,
    // pero lo dejo preparado para el futuro.
    // throw new Error("Función no implementada en backend aún");
    try {
        const response = await api.delete(`users/${userId}/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al eliminar usuario" };
    }
};

/**
 * Actualizar un usuario parcial o totalmente
 * @param {number} userId - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise}
 */
export const updateUser = async (userId, userData) => {
    try {
        const response = await api.patch(`users/${userId}/`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al actualizar usuario" };
    }
};

/**
 * Activar/Desactivar un usuario (Solo Admin)
 * @param {number} userId - ID del usuario
 * @returns {Promise} Nuevo estado del usuario
 */
export const toggleUserActive = async (userId) => {
    try {
        const response = await api.post(`users/${userId}/toggle-active/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Error al cambiar estado del usuario" };
    }
};
