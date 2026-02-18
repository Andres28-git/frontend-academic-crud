import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  getRepresentante,
  createRepresentante,
  updateRepresentante,
} from '../../api/representantesService';
import { getUsuarios } from '../../api/usuariosService';

export default function RepresentanteFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    usuarioId: '',
    telefono: '',
    activo: true,
  });
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioNombre, setUsuarioNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isEdit) {
          const [repRes, usersRes] = await Promise.all([
            getRepresentante(id),
            getUsuarios(),
          ]);
          const data = repRes.data;
          setForm({
            usuarioId: data.usuarioId ?? '',
            telefono: data.telefono ?? '',
            activo: data.activo ?? true,
          });
          const user = (usersRes.data || []).find((u) => u.id === data.usuarioId);
          setUsuarioNombre(user ? user.nombre || user.correo : 'Desconocido');
        } else {
          const usersRes = await getUsuarios();
          setUsuarios(usersRes.data || []);
        }
      } catch (err) {
        setError('Error al cargar los datos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    setForm((prev) => ({ ...prev, activo: e.target.checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      usuarioId: Number(form.usuarioId),
      telefono: form.telefono,
      activo: form.activo,
    };

    try {
      if (isEdit) {
        await updateRepresentante(id, payload);
        setSuccess('Representante actualizado correctamente.');
      } else {
        await createRepresentante(payload);
        setSuccess('Representante creado correctamente.');
      }
      setTimeout(() => {
        navigate('/representantes');
      }, 1200);
    } catch (err) {
      setError(
        isEdit
          ? 'Error al actualizar el representante.'
          : 'Error al crear el representante.'
      );
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEdit ? 'Editar Representante' : 'Nuevo Representante'}
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {isEdit ? (
              <TextField
                label="Usuario"
                value={usuarioNombre}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            ) : (
              <TextField
                select
                label="Usuario"
                name="usuarioId"
                value={form.usuarioId}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              >
                {usuarios.map((usuario) => (
                  <MenuItem key={usuario.id} value={usuario.id}>
                    {usuario.nombre}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              label="Teléfono"
              name="telefono"
              type="text"
              value={form.telefono}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.activo}
                  onChange={handleSwitchChange}
                  name="activo"
                  color="primary"
                />
              }
              label="Activo"
              sx={{ mt: 1, mb: 2, display: 'block' }}
            />

            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/representantes')}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={submitting}
              >
                {submitting
                  ? 'Guardando...'
                  : isEdit
                  ? 'Actualizar'
                  : 'Crear'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
