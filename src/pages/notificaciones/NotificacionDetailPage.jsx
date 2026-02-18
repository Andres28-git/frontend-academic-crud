import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getNotificacion, updateEstadoEnvio } from '../../api/notificacionesService';
import { ESTADOS_ENVIO } from '../../utils/roleHelpers';

const estadoEnvioColor = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return 'warning';
    case 'Enviado':
      return 'success';
    case 'Fallido':
      return 'error';
    default:
      return 'default';
  }
};

const NotificacionDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [notificacion, setNotificacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingEstado, setUpdatingEstado] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchNotificacion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNotificacion(id);
      setNotificacion(response.data);
    } catch (err) {
      setError('Error al cargar los datos de la notificacion.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificacion();
  }, [id]);

  const handleUpdateEstado = async (nuevoEstado) => {
    setUpdatingEstado(true);
    try {
      await updateEstadoEnvio(id, nuevoEstado);
      setSnackbar({
        open: true,
        message: `Estado de envio actualizado a "${nuevoEstado}".`,
        severity: 'success',
      });
      // Refrescar datos
      const response = await getNotificacion(id);
      setNotificacion(response.data);
    } catch (err) {
      console.error('Error al actualizar estado de envio:', err);
      setSnackbar({
        open: true,
        message: 'Error al actualizar el estado de envio.',
        severity: 'error',
      });
    } finally {
      setUpdatingEstado(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '\u2014';
    return new Date(dateStr).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/notificaciones')}
        >
          Volver
        </Button>
      </Box>
    );
  }

  if (!notificacion) {
    return null;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Detalle de la Notificacion
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                ID
              </Typography>
              <Typography variant="body1">{notificacion.id}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Estudiante ID
              </Typography>
              <Typography variant="body1">{notificacion.estudianteId}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Representante ID
              </Typography>
              <Typography variant="body1">{notificacion.representanteId}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Tipo
              </Typography>
              <Chip label={notificacion.tipo} size="small" variant="outlined" />
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Canal
              </Typography>
              <Typography variant="body1">{notificacion.canal || '\u2014'}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Estado de Envio
              </Typography>
              <Chip
                label={notificacion.estadoEnvio}
                color={estadoEnvioColor(notificacion.estadoEnvio)}
                size="small"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Fecha del Evento
              </Typography>
              <Typography variant="body1">{formatDate(notificacion.fechaEvento)}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Detalle
              </Typography>
              <Typography variant="body1">{notificacion.detalle || '\u2014'}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Fecha de Creacion
              </Typography>
              <Typography variant="body1">{formatDate(notificacion.createdAt)}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Seccion para actualizar estado de envio */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Actualizar Estado de Envio
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Estado actual:{' '}
            <Chip
              label={notificacion.estadoEnvio}
              color={estadoEnvioColor(notificacion.estadoEnvio)}
              size="small"
            />
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {ESTADOS_ENVIO.map((estado) => (
              <Button
                key={estado.value}
                variant={notificacion.estadoEnvio === estado.value ? 'contained' : 'outlined'}
                color={
                  estado.value === 'Pendiente'
                    ? 'warning'
                    : estado.value === 'Enviado'
                    ? 'success'
                    : 'error'
                }
                onClick={() => handleUpdateEstado(estado.value)}
                disabled={updatingEstado || notificacion.estadoEnvio === estado.value}
              >
                {estado.label}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box display="flex" gap={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/notificaciones')}
        >
          Volver
        </Button>
      </Box>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificacionDetailPage;
