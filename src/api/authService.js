import axiosInstance from './axiosInstance';

export const login = async (correo, password) => {
  const response = await axiosInstance.get('/api/usuarios');
  const usuarios = response.data;

  const user = usuarios.find(
    (u) => u.correo === correo && u.passwordHash === password && u.activo
  );

  if (!user) {
    throw { response: { data: { message: 'Credenciales incorrectas o usuario inactivo.' } } };
  }

  return { usuario: user, token: 'simulated-token' };
};
