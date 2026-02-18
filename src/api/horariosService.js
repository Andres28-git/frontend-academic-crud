import axiosInstance from './axiosInstance';

const BASE = '/api/horarios';

export const getHorarios = () => axiosInstance.get(BASE);
export const getHorario = (id) => axiosInstance.get(`${BASE}/${id}`);
export const createHorario = (data) => axiosInstance.post(BASE, data);
export const updateHorario = (id, data) => axiosInstance.put(`${BASE}/${id}`, data);
export const deleteHorario = (id) => axiosInstance.delete(`${BASE}/${id}`);
