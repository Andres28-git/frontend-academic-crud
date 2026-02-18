import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getUsuario, createUsuario, updateUsuario } from '../../api/usuariosService';
import { useAuth } from '../../context/AuthContext';
import { ROLE_OPTIONS } from '../../utils/roleHelpers';

const UsuarioFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    passwordHash: '',
    rol: '',
    activo: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (isEditMode) {
      fetchUsuario();
    }
  }, [id]);

  const fetchUsuario = async () => {
    setFetching(true);
    try {
      const response = await getUsuario(id);
      const data = response.data;
      setFormData({
        nombre: data.nombre || '',
        correo: data.correo || '',
        passwordHash: '',
        rol: data.rol || '',
        activo: data.activo ?? true,
      });
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos del usuario.',
        severity: 'error',
      });
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Ingrese un correo electrónico válido.';
    }

    if (!isEditMode && !formData.passwordHash.trim()) {
      newErrors.passwordHash = 'La contraseña es obligatoria.';
    }

    if (!formData.rol) {
      newErrors.rol = 'Debe seleccionar un rol.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
      const payload = { ...formData };

      // En modo edicion, solo enviar password si se ingreso uno nuevo
      if (isEditMode && !payload.passwordHash.trim()) {
        delete payload.passwordHash;
      }

      if (isEditMode) {
        await updateUsuario(id, payload);
        setSnackbar({
          open: true,
          message: 'Usuario actualizado correctamente.',
          severity: 'success',
        });
      } else {
        await createUsuario(payload);
        setSnackbar({
          open: true,
          message: 'Usuario creado correctamente.',
          severity: 'success',
        });
      }

      setTimeout(() => {
        navigate('/usuarios');
      }, 1200);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Error al guardar el usuario.';
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
          to="/usuarios"
          startIcon={<ArrowBackIcon />}
          color="inherit"
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
        </Typography>
      </Box>

      <Card>
        <CardHeader
          title={isEditMode ? 'Modificar datos del usuario' : 'Registrar un nuevo usuario'}
          titleTypographyProps={{ variant: 'h6' }}
        />
        <Divider />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              error={Boolean(errors.nombre)}
              helperText={errors.nombre}
              required
              margin="normal"
              autoFocus
            />

            <TextField
              fullWidth
              label="Correo Electrónico"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleChange}
              error={Boolean(errors.correo)}
              helperText={errors.correo}
              required
              margin="normal"
            />

            <TextField
              fullWidth
              label={isEditMode ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
              name="passwordHash"
              type="password"
              value={formData.passwordHash}
              onChange={handleChange}
              error={Boolean(errors.passwordHash)}
              helperText={errors.passwordHash}
              required={!isEditMode}
              margin="normal"
            />

            <FormControl fullWidth margin="normal" error={Boolean(errors.rol)} required>
              <InputLabel id="rol-label">Rol</InputLabel>
              <Select
                labelId="rol-label"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                label="Rol"
              >
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.rol && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.rol}
                </Typography>
              )}
            </FormControl>

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
                to="/usuarios"
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
                {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Usuario'}
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

export default UsuarioFormPage;
