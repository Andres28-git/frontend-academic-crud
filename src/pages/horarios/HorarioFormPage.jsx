import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getHorario, createHorario, updateHorario } from '../../api/horariosService';
import { DIAS_SEMANA } from '../../utils/roleHelpers';

const HorarioFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    diaSemana: '',
    horaEntrada: '',
    toleranciaMinutos: '',
    activo: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (isEditMode) {
      fetchHorario();
    }
  }, [id]);

  const fetchHorario = async () => {
    setFetching(true);
    try {
      const response = await getHorario(id);
      const data = response.data;
      // Convert horaEntrada from "HH:mm:ss" to "HH:mm" for the time input
      let horaEntradaFormatted = data.horaEntrada || '';
      if (horaEntradaFormatted && horaEntradaFormatted.split(':').length === 3) {
        const parts = horaEntradaFormatted.split(':');
        horaEntradaFormatted = `${parts[0]}:${parts[1]}`;
      }
      setFormData({
        diaSemana: data.diaSemana || '',
        horaEntrada: horaEntradaFormatted,
        toleranciaMinutos: data.toleranciaMinutos ?? '',
        activo: data.activo ?? true,
      });
    } catch (error) {
      console.error('Error al cargar horario:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos del horario.',
        severity: 'error',
      });
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.diaSemana) {
      newErrors.diaSemana = 'El día de la semana es obligatorio.';
    }

    if (!formData.horaEntrada) {
      newErrors.horaEntrada = 'La hora de entrada es obligatoria.';
    }

    if (formData.toleranciaMinutos === '' || formData.toleranciaMinutos === null) {
      newErrors.toleranciaMinutos = 'La tolerancia en minutos es obligatoria.';
    } else if (isNaN(formData.toleranciaMinutos) || Number(formData.toleranciaMinutos) < 0) {
      newErrors.toleranciaMinutos = 'Ingrese un valor numérico válido (mayor o igual a 0).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSwitchChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      activo: e.target.checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      // Convert horaEntrada from "HH:mm" back to "HH:mm:ss" for the API
      const horaEntradaForApi = formData.horaEntrada.includes(':')
        ? (formData.horaEntrada.split(':').length === 2
          ? `${formData.horaEntrada}:00`
          : formData.horaEntrada)
        : formData.horaEntrada;

      const payload = {
        diaSemana: formData.diaSemana,
        horaEntrada: horaEntradaForApi,
        toleranciaMinutos: parseInt(formData.toleranciaMinutos, 10),
        activo: formData.activo,
      };

      if (isEditMode) {
        await updateHorario(id, payload);
        setSnackbar({
          open: true,
          message: 'Horario actualizado correctamente.',
          severity: 'success',
        });
      } else {
        await createHorario(payload);
        setSnackbar({
          open: true,
          message: 'Horario creado correctamente.',
          severity: 'success',
        });
      }

      setTimeout(() => {
        navigate('/horarios');
      }, 1200);
    } catch (error) {
      console.error('Error al guardar horario:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Error al guardar el horario.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
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
          {isEditMode ? 'Editar Horario' : 'Nuevo Horario'}
        </Typography>
      </Box>

      <Card>
        <CardHeader
          title={isEditMode ? 'Modificar datos del horario' : 'Registrar un nuevo horario'}
          titleTypographyProps={{ variant: 'h6' }}
        />
        <Divider />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              select
              label="Día de la Semana"
              name="diaSemana"
              value={formData.diaSemana}
              onChange={handleChange}
              error={Boolean(errors.diaSemana)}
              helperText={errors.diaSemana}
              required
              margin="normal"
            >
              {DIAS_SEMANA.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Hora de Entrada"
              name="horaEntrada"
              type="time"
              value={formData.horaEntrada}
              onChange={handleChange}
              error={Boolean(errors.horaEntrada)}
              helperText={errors.horaEntrada}
              required
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 60,
              }}
            />

            <TextField
              fullWidth
              label="Tolerancia (minutos)"
              name="toleranciaMinutos"
              type="number"
              value={formData.toleranciaMinutos}
              onChange={handleChange}
              error={Boolean(errors.toleranciaMinutos)}
              helperText={errors.toleranciaMinutos}
              required
              margin="normal"
              inputProps={{
                min: 0,
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.activo}
                  onChange={handleSwitchChange}
                  name="activo"
                  color="primary"
                />
              }
              label={formData.activo ? 'Activo' : 'Inactivo'}
              sx={{ mt: 2, mb: 1 }}
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                component={Link}
                to="/horarios"
                color="inherit"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Horario'}
              </Button>
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

export default HorarioFormPage;
