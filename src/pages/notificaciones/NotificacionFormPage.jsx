import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createNotificacion } from '../../api/notificacionesService';
import { ESTADOS_ENVIO, TIPOS_NOTIFICACION } from '../../utils/roleHelpers';

const NotificacionFormPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    estudianteId: '',
    representanteId: '',
    fechaEvento: '',
    tipo: '',
    canal: '',
    estadoEnvio: 'Pendiente',
    detalle: '',
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.estudianteId || !formData.representanteId || !formData.fechaEvento || !formData.tipo || !formData.canal) {
      setSnackbar({
        open: true,
        message: 'Por favor complete todos los campos obligatorios.',
        severity: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        estudianteId: Number(formData.estudianteId),
        representanteId: Number(formData.representanteId),
        fechaEvento: formData.fechaEvento,
        tipo: formData.tipo,
        canal: formData.canal,
        estadoEnvio: formData.estadoEnvio,
        detalle: formData.detalle,
      };

      await createNotificacion(payload);
      setSnackbar({
        open: true,
        message: 'Notificacion creada correctamente.',
        severity: 'success',
      });

      setTimeout(() => {
        navigate('/notificaciones');
      }, 1000);
    } catch (error) {
      console.error('Error al crear notificacion:', error);
      setSnackbar({
        open: true,
        message: 'Error al crear la notificacion.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/notificaciones')}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          Nueva Notificacion
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 700 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Estudiante ID"
                  name="estudianteId"
                  type="number"
                  value={formData.estudianteId}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Representante ID"
                  name="representanteId"
                  type="number"
                  value={formData.representanteId}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Fecha del Evento"
              name="fechaEvento"
              type="datetime-local"
              value={formData.fechaEvento}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Tipo de Notificacion"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                  fullWidth
                >
                  {TIPOS_NOTIFICACION.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Canal"
                  name="canal"
                  value={formData.canal}
                  onChange={handleChange}
                  required
                  fullWidth
                  placeholder="Email, SMS, WhatsApp"
                />
              </Grid>
            </Grid>

            <TextField
              select
              label="Estado de Envio"
              name="estadoEnvio"
              value={formData.estadoEnvio}
              onChange={handleChange}
              required
              fullWidth
            >
              {ESTADOS_ENVIO.map((estado) => (
                <MenuItem key={estado.value} value={estado.value}>
                  {estado.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Detalle"
              name="detalle"
              value={formData.detalle}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              placeholder="Descripcion detallada de la notificacion..."
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Crear Notificacion'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/notificaciones')}
                disabled={saving}
              >
                Cancelar
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

export default NotificacionFormPage;
