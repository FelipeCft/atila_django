import { api } from "./authService";

export const getRequisitos = () => api.get("/requisitos/");
export const createRequisito = (requisito) => api.post("/requisitos/", requisito);
export const deleteRequisito = (id) => api.delete(`/requisitos/${id}/`);
export const updateRequisito = (id, requisito) => api.put(`/requisitos/${id}/`, requisito);
export const toggleRequisitoActive = (id) => api.post(`/requisitos/${id}/toggle_active/`);
