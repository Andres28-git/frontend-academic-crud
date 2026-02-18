import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import { getRepresentantes, deleteRepresentante } from '../../api/representantesService';
import { getUsuarios } from '../../api/usuariosService';
import { getRelaciones } from '../../api/relacionesService';
import { getEstudiantes } from '../../api/estudiantesService';

export default function RepresentantesListPage() {
  const navigate = useNavigate();

  const [representantes, setRepresentantes] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Estado para modal de Representados
  const [representadosDialogOpen, setRepresentadosDialogOpen] = useState(false);
  const [representados, setRepresentados] = useState([]);
  const [loadingRepresentados, setLoadingRepresentados] = useState(false);
  const [selectedRepNombre, setSelectedRepNombre] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [repsRes, usersRes] = await Promise.all([
        getRepresentantes(),
        getUsuarios(),
      ]);
      const usersMap = {};
      (usersRes.data || []).forEach((u) => {
        usersMap[u.id] = u.nombre || u.correo || `Usuario ${u.id}`;
      });
      setUsuarios(usersMap);
      setRepresentantes(repsRes.data || []);
    } catch (err) {
      setError('Error al cargar los representantes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await deleteRepresentante(selectedId);
      setRepresentantes((prev) => prev.filter((r) => r.id !== selectedId));
      setDeleteDialogOpen(false);
      setSelectedId(null);
    } catch (err) {
      setError('Error al eliminar el representante.');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedId(null);
  };

  const handleRepresentadosClick = async (row) => {
    setSelectedRepNombre(usuarios[row.usuarioId] || 'Representante');
    setRepresentadosDialogOpen(true);
    setLoadingRepresentados(true);
    try {
      const [relRes, estRes, usersRes] = await Promise.all([
        getRelaciones(),
        getEstudiantes(),
        getUsuarios(),
      ]);
      const relaciones = (relRes.data || []).filter(
        (r) => r.representanteId === row.id
      );
      const estudiantesMap = {};
      (estRes.data || []).forEach((e) => {
        estudiantesMap[e.id] = e;
      });
      const usersMap = {};
      (usersRes.data || []).forEach((u) => {
        usersMap[u.id] = u.nombre || u.correo || `Usuario ${u.id}`;
      });
      const lista = relaciones.map((rel) => {
        const est = estudiantesMap[rel.estudianteId] || {};
        return {
          id: rel.id,
          nombre: usersMap[est.usuarioId] || 'Desconocido',
          codigo: est.codigo || '—',
          parentesco: rel.parentesco || '—',
        };
      });
      setRepresentados(lista);
    } catch (err) {
      console.error('Error al cargar representados:', err);
      setRepresentados([]);
    } finally {
      setLoadingRepresentados(false);
    }
  };

  const handleCloseRepresentados = () => {
    setRepresentadosDialogOpen(false);
    setRepresentados([]);
    setSelectedRepNombre('');
  };

  // Obtener nombre del representante seleccionado para el diálogo de eliminar
  const getSelectedRepName = () => {
    const rep = representantes.find((r) => r.id === selectedId);
    return rep ? usuarios[rep.usuarioId] || 'este representante' : 'este representante';
  };

  const columns = [
    {
      field: 'usuarioId',
      headerName: 'Usuario',
      width: 200,
      renderCell: (params) =>
        usuarios[params.value] || 'Desconocido',
    },
    { field: 'telefono', headerName: 'Teléfono', width: 160 },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 130,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Activo" color="success" size="small" />
        ) : (
          <Chip label="Inactivo" color="error" size="small" />
        ),
    },
    {
      field: 'createdAt',
      headerName: 'Fecha de Creación',
      width: 200,
      renderCell: (params) =>
        params.value
          ? new Date(params.value).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—',
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Ver">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/representantes/${params.row.id}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/representantes/${params.row.id}/editar`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Representados">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handleRepresentadosClick(params.row)}
            >
              <GroupIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Representantes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/representantes/nuevo')}
        >
          Nuevo Representante
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={representantes}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
        />
      </Box>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar al representante{' '}
            <strong>{getSelectedRepName()}</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Representados */}
      <Dialog
        open={representadosDialogOpen}
        onClose={handleCloseRepresentados}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Representados de {selectedRepNombre}
        </DialogTitle>
        <DialogContent>
          {loadingRepresentados ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={30} />
            </Box>
          ) : representados.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No tiene estudiantes asociados.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Estudiante</strong></TableCell>
                    <TableCell><strong>Código</strong></TableCell>
                    <TableCell><strong>Parentesco</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {representados.map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell>{rep.nombre}</TableCell>
                      <TableCell>{rep.codigo}</TableCell>
                      <TableCell>{rep.parentesco}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRepresentados}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
