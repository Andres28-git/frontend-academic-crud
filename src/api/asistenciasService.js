import axiosInstance from './axiosInstance';

const BASE = '/api/asistencias';

export const getAsistencias = (params = {}) => axiosInstance.get(BASE, { params });
export const getAsistencia = (id) => axiosInstance.get(`${BASE}/${id}`);
export const createAsistencia = (data) => axiosInstance.post(BASE, data);
export const updateAsistencia = (id, data) => axiosInstance.put(`${BASE}/${id}`, data);
export const deleteAsistencia = (id) => axiosInstance.delete(`${BASE}/${id}`);
