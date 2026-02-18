import axiosInstance from './axiosInstance';

const BASE = '/api/representantes';

export const getRepresentantes = () => axiosInstance.get(BASE);
export const getRepresentante = (id) => axiosInstance.get(`${BASE}/${id}`);
export const createRepresentante = (data) => axiosInstance.post(BASE, data);
export const updateRepresentante = (id, data) => axiosInstance.put(`${BASE}/${id}`, data);
export const deleteRepresentante = (id) => axiosInstance.delete(`${BASE}/${id}`);
