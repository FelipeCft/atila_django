import { api } from './authService';

// Obtener la configuración del sitio (público)
export const getConfiguracion = async () => {
    try {
        const response = await api.get('/configuracion/get_config/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        throw error;
    }
};

// Actualizar la configuración (admin)
export const updateConfiguracion = async (data) => {
    try {
        const response = await api.put('/configuracion/1/', data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar configuración:', error);
        throw error;
    }
};

// Actualizar parcialmente la configuración (admin)
export const patchConfiguracion = async (data) => {
    try {
        const response = await api.patch('/configuracion/1/', data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar configuración:', error);
        throw error;
    }
};
