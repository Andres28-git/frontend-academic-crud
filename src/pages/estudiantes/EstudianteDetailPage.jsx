import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { QRCodeSVG } from 'qrcode.react';
import { getEstudiante, regenerarQR } from '../../api/estudiantesService';
import { getRelacionesPorEstudiante, createRelacion, deleteRelacion } from '../../api/relacionesService';
import { getRepresentantes } from '../../api/representantesService';
import { getUsuarios } from '../../api/usuariosService';

const EstudianteDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [estudiante, setEstudiante] = useState(null);
  const [usuarioNombre, setUsuarioNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [regenerando, setRegenerando] = useState(false);
  const [relaciones, setRelaciones] = useState([]);
  const [loadingRelaciones, setLoadingRelaciones] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estado del dialogo de asignar representante
  const [asignarDialogOpen, setAsignarDialogOpen] = useState(false);
  const [representantes, setRepresentantes] = useState([]);
  const [selectedRepresentanteId, setSelectedRepresentanteId] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [savingRelacion, setSavingRelacion] = useState(false);

  const fetchEstudiante = async () => {
    setLoading(true);
    try {
      const [estRes, usersRes] = await Promise.all([
        getEstudiante(id),
        getUsuarios(),
      ]);
      setEstudiante(estRes.data);
      const user = (usersRes.data || []).find((u) => u.id === estRes.data.usuarioId);
      setUsuarioNombre(user ? user.nombre || user.correo : 'Desconocido');
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

  const fetchRelaciones = async () => {
    setLoadingRelaciones(true);
    try {
      const response = await getRelacionesPorEstudiante(id);
      setRelaciones(response.data);
    } catch (error) {
      console.error('Error al cargar relaciones:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los representantes asignados.',
        severity: 'error',
      });
    } finally {
      setLoadingRelaciones(false);
    }
  };

  const fetchRepresentantes = async () => {
    try {
      const response = await getRepresentantes();
      setRepresentantes(response.data);
    } catch (error) {
      console.error('Error al cargar representantes:', error);
    }
  };

  useEffect(() => {
    fetchEstudiante();
    fetchRelaciones();
  }, [id]);

  const handleRegenerarQR = async () => {
    setRegenerando(true);
    try {
      await regenerarQR(id);
      setSnackbar({
        open: true,
        message: 'Codigo QR regenerado correctamente.',
        severity: 'success',
      });
      await fetchEstudiante();
    } catch (error) {
      console.error('Error al regenerar QR:', error);
      setSnackbar({
        open: true,
        message: 'Error al regenerar el codigo QR.',
        severity: 'error',
      });
    } finally {
      setRegenerando(false);
    }
  };

  const handleOpenAsignarDialog = () => {
    fetchRepresentantes();
    setSelectedRepresentanteId('');
    setParentesco('');
    setAsignarDialogOpen(true);
  };

  const handleCloseAsignarDialog = () => {
    setAsignarDialogOpen(false);
    setSelectedRepresentanteId('');
    setParentesco('');
  };

  const handleAsignarRepresentante = async () => {
    if (!selectedRepresentanteId || !parentesco.trim()) {
      setSnackbar({
        open: true,
        message: 'Seleccione un representante e ingrese el parentesco.',
        severity: 'warning',
      });
      return;
    }

    setSavingRelacion(true);
    try {
      await createRelacion({
        estudianteId: Number(id),
        representanteId: Number(selectedRepresentanteId),
        parentesco: parentesco.trim(),
      });
      setSnackbar({
        open: true,
        message: 'Representante asignado correctamente.',
        severity: 'success',
      });
      handleCloseAsignarDialog();
      fetchRelaciones();
    } catch (error) {
      console.error('Error al asignar representante:', error);
      setSnackbar({
        open: true,
        message: 'Error al asignar el representante.',
        severity: 'error',
      });
    } finally {
      setSavingRelacion(false);
    }
  };

  const handleQuitarRelacion = async (relacionId) => {
    try {
      await deleteRelacion(relacionId);
      setSnackbar({
        open: true,
        message: 'Representante removido correctamente.',
        severity: 'success',
      });
      fetchRelaciones();
    } catch (error) {
      console.error('Error al quitar representante:', error);
      setSnackbar({
        open: true,
        message: 'Error al quitar el representante.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const formatDate = (dateString) => {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!estudiante) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No se encontro el estudiante.</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/estudiantes')}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/estudiantes')}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Detalle del Estudiante
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/estudiantes/${id}/editar`)}
        >
          Editar
        </Button>
      </Box>

      {/* Informacion del estudiante */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Informacion General
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Codigo
              </Typography>
              <Typography variant="body1">{estudiante.codigo}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Usuario
              </Typography>
              <Typography variant="body1">{usuarioNombre}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Estado
              </Typography>
              <Chip
                label={estudiante.activo ? 'Activo' : 'Inactivo'}
                color={estudiante.activo ? 'success' : 'default'}
                size="small"
                variant="outlined"
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Fecha de Creacion
              </Typography>
              <Typography variant="body1">{formatDate(estudiante.createdAt)}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Codigo QR */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Codigo QR
          </Typography>
          <Divider sx={{ width: '100%', mb: 3 }} />

          {estudiante.qrToken ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <QRCodeSVG
                value={estudiante.qrToken}
                size={256}
                level="H"
                includeMargin
              />
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all', textAlign: 'center', maxWidth: 400 }}>
                Token: {estudiante.qrToken}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No se ha generado un codigo QR para este estudiante.
            </Typography>
          )}

          <Button
            variant="outlined"
            startIcon={<QrCode2Icon />}
            onClick={handleRegenerarQR}
            disabled={regenerando}
            sx={{ mt: 2 }}
          >
            {regenerando ? 'Regenerando...' : 'Regenerar QR'}
          </Button>
        </CardContent>
      </Card>

      {/* Representantes asignados */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">
              Representantes Asignados
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAsignarDialog}
            >
              Asignar Representante
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {loadingRelaciones ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={30} />
            </Box>
          ) : relaciones.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No hay representantes asignados a este estudiante.
            </Typography>
          ) : (
            <List disablePadding>
              {relaciones.map((relacion, index) => (
                <React.Fragment key={relacion.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <Tooltip title="Quitar representante">
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleQuitarRelacion(relacion.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={`Representante ID: ${relacion.representanteId}`}
                      secondary={`Parentesco: ${relacion.parentesco || '\u2014'}`}
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Dialogo para asignar representante */}
      <Dialog open={asignarDialogOpen} onClose={handleCloseAsignarDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar Representante</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Representante"
              value={selectedRepresentanteId}
              onChange={(e) => setSelectedRepresentanteId(e.target.value)}
              fullWidth
              required
            >
              {representantes.map((rep) => (
                <MenuItem key={rep.id} value={rep.id}>
                  ID: {rep.id} {rep.nombre ? `- ${rep.nombre}` : ''} {rep.usuarioId ? `(Usuario: ${rep.usuarioId})` : ''}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Parentesco"
              value={parentesco}
              onChange={(e) => setParentesco(e.target.value)}
              fullWidth
              required
              placeholder="Ej: Padre, Madre, Tutor"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAsignarDialog} color="inherit" disabled={savingRelacion}>
            Cancelar
          </Button>
          <Button
            onClick={handleAsignarRepresentante}
            variant="contained"
            disabled={savingRelacion}
          >
            {savingRelacion ? 'Guardando...' : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default EstudianteDetailPage;
