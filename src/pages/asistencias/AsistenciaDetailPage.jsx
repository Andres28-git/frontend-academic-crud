import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAsistencia } from '../../api/asistenciasService';

const estadoColorMap = {
  Presente: 'success',
  Ausente: 'error',
  Tardanza: 'warning',
  Justificado: 'info',
};

const AsistenciaDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [asistencia, setAsistencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAsistencia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAsistencia = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAsistencia(id);
      setAsistencia(response.data);
    } catch (err) {
      console.error('Error al cargar la asistencia:', err);
      setError('No se pudo cargar la informacion de la asistencia.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '\u2014';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '\u2014';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHora = (horaString) => {
    if (!horaString) return '\u2014';
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/asistencias')}
        >
          Volver a Asistencias
        </Button>
      </Box>
    );
  }

  if (!asistencia) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/asistencias')}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          Detalle de Asistencia
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                ID
              </Typography>
              <Typography variant="body1">{asistencia.id}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Estudiante ID
              </Typography>
              <Typography variant="body1">{asistencia.estudianteId}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Fecha
              </Typography>
              <Typography variant="body1">{formatDate(asistencia.fecha)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Hora
              </Typography>
              <Typography variant="body1">{formatHora(asistencia.hora)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Estado
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={asistencia.estado}
                  color={estadoColorMap[asistencia.estado] || 'default'}
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Origen
              </Typography>
              <Typography variant="body1">{asistencia.origen || '\u2014'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Observacion
              </Typography>
              <Typography variant="body1">{asistencia.observacion || '\u2014'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Fecha de Creacion
              </Typography>
              <Typography variant="body1">{formatDateTime(asistencia.createdAt)}</Typography>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/asistencias/${asistencia.id}/editar`)}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/asistencias')}
            >
              Volver
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AsistenciaDetailPage;
