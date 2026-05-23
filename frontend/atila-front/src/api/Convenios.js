import { api } from "./authService";

export const getConvenios = () => api.get("/convenios/");
export const createConvenio = (convenio) => api.post("/convenios/", convenio);
export const deleteConvenio = (id) => api.delete(`/convenios/${id}/`);
export const updateConvenio = (id, convenio) => api.put(`/convenios/${id}/`, convenio);
export const toggleConvenioActive = (id) => api.post(`/convenios/${id}/toggle_active/`);
