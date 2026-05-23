import { api } from './authService';

export const solicitudesService = {
    getAll: async () => {
        const response = await api.get('agenda/solicitudes-cita/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`agenda/solicitudes-cita/${id}/`);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`agenda/solicitudes-cita/${id}/`, {
            estado: status
        });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`agenda/solicitudes-cita/${id}/`);
        return response.data;
    }
};
