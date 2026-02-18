import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getRepresentante } from '../../api/representantesService';
import { getUsuarios } from '../../api/usuariosService';

export default function RepresentanteDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [representante, setRepresentante] = useState(null);
  const [usuarioNombre, setUsuarioNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [repRes, usersRes] = await Promise.all([
          getRepresentante(id),
          getUsuarios(),
        ]);
        const rep = repRes.data;
        setRepresentante(rep);
        const user = (usersRes.data || []).find((u) => u.id === rep.usuarioId);
        setUsuarioNombre(user ? user.nombre || user.correo || `ID: ${user.id}` : `ID: ${rep.usuarioId}`);
      } catch (err) {
        setError('Error al cargar los datos del representante.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/representantes')}
        >
          Volver
        </Button>
      </Box>
    );
  }

  if (!representante) {
    return null;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Detalle del Representante
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Usuario
              </Typography>
              <Typography variant="body1">
                {usuarioNombre}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Teléfono
              </Typography>
              <Typography variant="body1">
                {representante.telefono || '—'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Estado
              </Typography>
              {representante.activo ? (
                <Chip label="Activo" color="success" size="small" />
              ) : (
                <Chip label="Inactivo" color="error" size="small" />
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Fecha de Creación
              </Typography>
              <Typography variant="body1">
                {formatDate(representante.createdAt)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box display="flex" gap={2} mt={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/representantes')}
        >
          Volver
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/representantes/${id}/editar`)}
        >
          Editar
        </Button>
      </Box>
    </Box>
  );
}
