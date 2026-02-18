import axiosInstance from './axiosInstance';

const BASE = '/api/estudiante-representante';

export const getRelaciones = () => axiosInstance.get(BASE);
export const getRelacionesPorEstudiante = (estudianteId) =>
  axiosInstance.get(`${BASE}/por-estudiante/${estudianteId}`);
export const createRelacion = (data) => axiosInstance.post(BASE, data);
export const deleteRelacion = (id) => axiosInstance.delete(`${BASE}/${id}`);
