import { api } from "./authService";

export const getEspecialidades = () => api.get("/especialidades/");
export const createEspecialidad = (especialidad) => api.post("/especialidades/", especialidad);
export const deleteEspecialidad = (id) => api.delete(`/especialidades/${id}/`);
export const updateEspecialidad = (id, especialidad) => api.put(`/especialidades/${id}/`, especialidad);
export const toggleEspecialidadActive = (id) => api.post(`/especialidades/${id}/toggle_active/`);
