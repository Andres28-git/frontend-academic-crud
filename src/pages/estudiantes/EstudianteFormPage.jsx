import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getEstudiante, createEstudiante, updateEstudiante } from '../../api/estudiantesService';
import { getUsuarios } from '../../api/usuariosService';

const EstudianteFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    usuarioId: '',
    codigo: '',
    activo: true,
  });
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUsuarios();
    if (isEditing) {
      fetchEstudiante();
    }
  }, [id]);

  const fetchUsuarios = async () => {
    try {
      const response = await getUsuarios();
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const fetchEstudiante = async () => {
    setLoading(true);
    try {
      const response = await getEstudiante(id);
      const estudiante = response.data;
      setFormData({
        usuarioId: estudiante.usuarioId || '',
        codigo: estudiante.codigo || '',
        activo: estudiante.activo ?? true,
      });
    } catch (error) {
      console.error('Error al cargar estudiante:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos del estudiante.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    setFormData((prev) => ({ ...prev, activo: e.target.checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.usuarioId || !formData.codigo) {
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
        usuarioId: Number(formData.usuarioId),
        codigo: formData.codigo,
        activo: formData.activo,
      };

      if (isEditing) {
        await updateEstudiante(id, payload);
        setSnackbar({
          open: true,
          message: 'Estudiante actualizado correctamente.',
          severity: 'success',
        });
      } else {
        await createEstudiante(payload);
        setSnackbar({
          open: true,
          message: 'Estudiante creado correctamente.',
          severity: 'success',
        });
      }

      setTimeout(() => {
        navigate('/estudiantes');
      }, 1000);
    } catch (error) {
      console.error('Error al guardar estudiante:', error);
      setSnackbar({
        open: true,
        message: isEditing
          ? 'Error al actualizar el estudiante.'
          : 'Error al crear el estudiante.',
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
          onClick={() => navigate('/estudiantes')}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              select
              label="Usuario"
              name="usuarioId"
              value={formData.usuarioId}
              onChange={handleChange}
              required
              fullWidth
            >
              {usuarios.map((usuario) => (
                <MenuItem key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Codigo"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              required
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.activo}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label={formData.activo ? 'Activo' : 'Inactivo'}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
              >
                {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/estudiantes')}
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

export default EstudianteFormPage;
