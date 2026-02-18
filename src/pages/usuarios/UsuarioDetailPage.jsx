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
  Grid,
  Typography,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getUsuario } from '../../api/usuariosService';
import { useAuth } from '../../context/AuthContext';

const UsuarioDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsuario();
  }, [id]);

  const fetchUsuario = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsuario(id);
      setUsuario(response.data);
    } catch (err) {
      console.error('Error al cargar usuario:', err);
      setError('No se pudo cargar la información del usuario.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          component={Link}
          to="/usuarios"
          startIcon={<ArrowBackIcon />}
          color="inherit"
        >
          Volver a la lista
        </Button>
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
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Detalle de Usuario
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/usuarios/${id}/editar`)}
        >
          Editar
        </Button>
      </Box>

      <Card>
        <CardHeader
          title={usuario.nombre}
          titleTypographyProps={{ variant: 'h5' }}
          subheader={`ID: ${usuario.id}`}
          action={
            <Chip
              label={usuario.activo ? 'Activo' : 'Inactivo'}
              color={usuario.activo ? 'success' : 'default'}
              variant="outlined"
            />
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="overline" color="text.secondary">
                Nombre
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {usuario.nombre}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="overline" color="text.secondary">
                Correo Electrónico
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {usuario.correo}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="overline" color="text.secondary">
                Rol
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {usuario.rol}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="overline" color="text.secondary">
                Estado
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={usuario.activo ? 'Activo' : 'Inactivo'}
                  color={usuario.activo ? 'success' : 'default'}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="overline" color="text.secondary">
                Fecha de Creación
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatDate(usuario.createdAt)}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="overline" color="text.secondary">
                ID
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {usuario.id}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UsuarioDetailPage;
