export const ROLES = {
  ADMIN: 'ADMIN',
  DOCENTE: 'DOCENTE',
  REPRESENTANTE: 'REPRESENTANTE',
  ESTUDIANTE: 'ESTUDIANTE',
};

export const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'DOCENTE', label: 'Docente' },
  { value: 'REPRESENTANTE', label: 'Representante' },
  { value: 'ESTUDIANTE', label: 'Estudiante' },
];

export const DIAS_SEMANA = [
  { value: 'Lunes', label: 'Lunes' },
  { value: 'Martes', label: 'Martes' },
  { value: 'Miércoles', label: 'Miércoles' },
  { value: 'Jueves', label: 'Jueves' },
  { value: 'Viernes', label: 'Viernes' },
  { value: 'Sábado', label: 'Sábado' },
  { value: 'Domingo', label: 'Domingo' },
];

export const ESTADOS_ASISTENCIA = [
  { value: 'Presente', label: 'Presente' },
  { value: 'Ausente', label: 'Ausente' },
  { value: 'Tardanza', label: 'Tardanza' },
  { value: 'Justificado', label: 'Justificado' },
];

export const ESTADOS_ENVIO = [
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Enviado', label: 'Enviado' },
  { value: 'Fallido', label: 'Fallido' },
];

export const TIPOS_NOTIFICACION = [
  { value: 'Tardanza', label: 'Tardanza' },
  { value: 'Ausencia', label: 'Ausencia' },
  { value: 'General', label: 'General' },
];
