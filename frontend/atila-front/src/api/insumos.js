import { api } from './authService';


// Auth headers are automatically added by the api instance interceptor

export const getAllInsumos = async () => {
    try {
        const response = await api.get('insumos/');
        return response.data;
    } catch (error) {
        console.error("Error fetching insumos:", error);
        throw error;
    }
};

export const createInsumo = async (insumoData) => {
    try {
        const response = await api.post('insumos/', insumoData);
        return response.data;
    } catch (error) {
        console.error("Error creating insumo:", error);
        throw error;
    }
};

export const updateInsumo = async (id, insumoData) => {
    try {
        const response = await api.patch(`insumos/${id}/`, insumoData);
        return response.data;
    } catch (error) {
        console.error("Error updating insumo:", error);
        throw error;
    }
};

export const deleteInsumo = async (id) => {
    try {
        await api.delete(`insumos/${id}/`);
        return true;
    } catch (error) {
        console.error("Error deleting insumo:", error);
        throw error;
    }
};

export const toggleInsumoActive = async (id) => {
    try {
        const response = await api.post(`insumos/${id}/toggle_active/`);
        return response.data;
    } catch (error) {
        console.error("Error toggling insumo:", error);
        throw error;
    }
};


// MOVIMIENTOS API (unifica consumos y reposiciones)
export const getMovimientos = async () => {
    try {
        const response = await api.get('insumos/movimientos/');
        return response.data;
    } catch (error) {
        console.error("Error fetching movimientos:", error);
        throw error;
    }
};

export const createMovimiento = async (movimientoData) => {
    try {
        const response = await api.post('insumos/movimientos/', movimientoData);
        return response.data;
    } catch (error) {
        console.error("Error creating movimiento:", error);
        throw error;
    }
};
