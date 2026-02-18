import axiosInstance from './axiosInstance';

const BASE = '/api/usuarios';

export const getUsuarios = () => axiosInstance.get(BASE);
export const getUsuario = (id) => axiosInstance.get(`${BASE}/${id}`);
export const createUsuario = (data) => axiosInstance.post(BASE, data);
export const updateUsuario = (id, data) => axiosInstance.put(`${BASE}/${id}`, data);
export const deleteUsuario = (id) => axiosInstance.delete(`${BASE}/${id}`);
