import axiosInstance from './axiosInstance';

const BASE = '/api/estudiantes';

export const getEstudiantes = () => axiosInstance.get(BASE);
export const getEstudiante = (id) => axiosInstance.get(`${BASE}/${id}`);
export const createEstudiante = (data) => axiosInstance.post(BASE, data);
export const updateEstudiante = (id, data) => axiosInstance.put(`${BASE}/${id}`, data);
export const deleteEstudiante = (id) => axiosInstance.delete(`${BASE}/${id}`);
export const regenerarQR = (id) => axiosInstance.patch(`${BASE}/${id}/regenerar-qr`);
