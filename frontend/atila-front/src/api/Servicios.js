import { api } from "./authService";

export const getServicios = async (params) => {
    const response = await api.get("/servicios/", { params });
    return response.data;
};

export const createServicio = async (servicio) => {
    const response = await api.post("/servicios/", servicio);
    return response.data;
};

export const deleteServicio = async (id) => {
    const response = await api.delete(`/servicios/${id}/`);
    return response.data;
};

export const updateServicio = async (id, servicio) => {
    const response = await api.put(`/servicios/${id}/`, servicio);
    return response.data;
};

export const toggleServicioActive = async (id) => {
    const response = await api.post(`/servicios/${id}/toggle_active/`);
    return response.data;
};
