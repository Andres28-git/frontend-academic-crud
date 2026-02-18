import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAsistencia, createAsistencia, updateAsistencia } from '../../api/asistenciasService';
import { getEstudiantes } from '../../api/estudiantesService';
import { getUsuarios } from '../../api/usuariosService';
import { ESTADOS_ASISTENCIA } from '../../utils/roleHelpers';

const AsistenciaFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    estudianteId: '',
    fecha: '',
    hora: '',
    estado: '',
    origen: '',
    observacion: '',
  });

  const [estudiantes, setEstudiantes] = useState([]);
  const [estudiantesMap, setEstudiantesMap] = useState({});
  const [errors, setErrors] = useState({});

  // Convierte "HH:mm:ss" -> "HH:mm" para el input type="time"
  const horaToInput = (horaString) => {
    if (!horaString) return '';
    const parts = horaString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return horaString;
  };

  // Convierte "HH:mm" -> "HH:mm:ss" para enviar al API
  const horaToApi = (horaInput) => {
    if (!horaInput) return '';
    const parts = horaInput.split(':');
    if (parts.length === 2) {
      return `${parts[0]}:${parts[1]}:00`;
    }
    return horaInput;
  };

  // Extrae solo la fecha (YYYY-MM-DD) de un datetime string
  const fechaToInput = (fechaString) => {
    if (!fechaString) return '';
    return fechaString.substring(0, 10);
  };

  const fetchEstudiantes = async () => {
    try {
      const [estRes, usersRes] = await Promise.all([
        getEstudiantes(),
        getUsuarios(),
      ]);
      const usersMap = {};
      (usersRes.data || []).forEach((u) => {
        usersMap[u.id] = u.nombre || u.correo || `Usuario ${u.id}`;
      });
      const estMap = {};
      (estRes.data || []).forEach((e) => {
        estMap[e.id] = usersMap[e.usuarioId] || `Estudiante ${e.id}`;
      });
      setEstudiantes(estRes.data || []);
      setEstudiantesMap(estMap);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
    if (isEditing) {
      fetchAsistencia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAsistencia = async () => {
    setLoading(true);
    try {
      const response = await getAsistencia(id);
      const data = response.data;
      setFormData({
        estudianteId: data.estudianteId || '',
        fecha: fechaToInput(data.fecha),
        hora: horaToInput(data.hora),
        estado: data.estado || '',
        origen: data.origen || '',
        observacion: data.observacion || '',
      });
    } catch (error) {
      console.error('Error al cargar la asistencia:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos de la asistencia.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Limpiar error del campo al modificarlo
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.estudianteId) newErrors.estudianteId = 'El ID del estudiante es requerido.';
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida.';
    if (!formData.hora) newErrors.hora = 'La hora es requerida.';
    if (!formData.estado) newErrors.estado = 'El estado es requerido.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        estudianteId: Number(formData.estudianteId),
        fecha: formData.fecha,
        hora: horaToApi(formData.hora),
        estado: formData.estado,
        origen: formData.origen,
        observacion: formData.observacion,
      };

      if (isEditing) {
        await updateAsistencia(id, payload);
        setSnackbar({
          open: true,
          message: 'Asistencia actualizada correctamente.',
          severity: 'success',
        });
      } else {
        await createAsistencia(payload);
        setSnackbar({
          open: true,
          message: 'Asistencia registrada correctamente.',
          severity: 'success',
        });
      }

      // Redirigir despues de un breve momento para que el usuario vea el mensaje
      setTimeout(() => {
        navigate('/asistencias');
      }, 1000);
    } catch (error) {
      console.error('Error al guardar la asistencia:', error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Error al guardar la asistencia.';
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

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
          {isEditing ? 'Editar Asistencia' : 'Registrar Asistencia'}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Estudiante"
                  select
                  value={formData.estudianteId}
                  onChange={handleChange('estudianteId')}
                  fullWidth
                  required
                  error={Boolean(errors.estudianteId)}
                  helperText={errors.estudianteId}
                >
                  {estudiantes.map((est) => (
                    <MenuItem key={est.id} value={est.id}>
                      {estudiantesMap[est.id] || `Estudiante ${est.id}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange('fecha')}
                  fullWidth
                  required
                  error={Boolean(errors.fecha)}
                  helperText={errors.fecha}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Hora"
                  type="time"
                  value={formData.hora}
                  onChange={handleChange('hora')}
                  fullWidth
                  required
                  error={Boolean(errors.hora)}
                  helperText={errors.hora}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Estado"
                  select
                  value={formData.estado}
                  onChange={handleChange('estado')}
                  fullWidth
                  required
                  error={Boolean(errors.estado)}
                  helperText={errors.estado}
                >
                  {ESTADOS_ASISTENCIA.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Origen"
                  value={formData.origen}
                  onChange={handleChange('origen')}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Observacion"
                  value={formData.observacion}
                  onChange={handleChange('observacion')}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/asistencias')}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={saving}
                  >
                    {saving
                      ? 'Guardando...'
                      : isEditing
                      ? 'Actualizar'
                      : 'Registrar'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
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

export default AsistenciaFormPage;
