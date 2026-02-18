import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { getHorario } from '../../api/horariosService';

const HorarioDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [horario, setHorario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchHorario();
  }, [id]);

  const fetchHorario = async () => {
    setLoading(true);
    try {
      const response = await getHorario(id);
      setHorario(response.data);
    } catch (error) {
      console.error('Error al cargar horario:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos del horario.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const formatHora = (horaString) => {
    if (!horaString) return '—';
    const parts = horaString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return horaString;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!horario) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No se encontró el horario solicitado.</Alert>
        <Button
          component={Link}
          to="/horarios"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Volver a Horarios
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/horarios"
          startIcon={<ArrowBackIcon />}
          color="inherit"
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          Detalle del Horario
        </Typography>
      </Box>

      <Card>
        <CardHeader
          title={`Horario - ${horario.diaSemana}`}
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/horarios/${horario.id}/editar`)}
            >
              Editar
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                ID
              </Typography>
              <Typography variant="body1">{horario.id}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Día de la Semana
              </Typography>
              <Typography variant="body1">{horario.diaSemana}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Hora de Entrada
              </Typography>
              <Typography variant="body1">{formatHora(horario.horaEntrada)}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Tolerancia
              </Typography>
              <Typography variant="body1">
                {horario.toleranciaMinutos != null ? `${horario.toleranciaMinutos} minutos` : '—'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Estado
              </Typography>
              <Chip
                label={horario.activo ? 'Activo' : 'Inactivo'}
                color={horario.activo ? 'success' : 'default'}
                size="small"
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

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

export default HorarioDetailPage;
