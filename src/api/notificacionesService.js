import axiosInstance from './axiosInstance';

const BASE = '/api/notificaciones';

export const getNotificaciones = (params = {}) => axiosInstance.get(BASE, { params });
export const getNotificacion = (id) => axiosInstance.get(`${BASE}/${id}`);
export const createNotificacion = (data) => axiosInstance.post(BASE, data);
export const deleteNotificacion = (id) => axiosInstance.delete(`${BASE}/${id}`);
export const updateEstadoEnvio = (id, nuevoEstado) =>
  axiosInstance.patch(`${BASE}/${id}/estado-envio/${nuevoEstado}`);
