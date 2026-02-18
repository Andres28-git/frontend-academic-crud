import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getEstudiantes, deleteEstudiante } from '../../api/estudiantesService';
import { getUsuarios } from '../../api/usuariosService';

const EstudiantesListPage = () => {
  const navigate = useNavigate();

  const [estudiantes, setEstudiantes] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [estudianteToDelete, setEstudianteToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchEstudiantes = async () => {
    setLoading(true);
    try {
      const [estRes, usersRes] = await Promise.all([
        getEstudiantes(),
        getUsuarios(),
      ]);
      const usersMap = {};
      (usersRes.data || []).forEach((u) => {
        usersMap[u.id] = u.nombre || u.correo || `Usuario ${u.id}`;
      });
      setUsuarios(usersMap);
      setEstudiantes(estRes.data);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar la lista de estudiantes.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const handleDeleteClick = (estudiante) => {
    setEstudianteToDelete(estudiante);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!estudianteToDelete) return;
    try {
      await deleteEstudiante(estudianteToDelete.id);
      setSnackbar({
        open: true,
        message: 'Estudiante eliminado correctamente.',
        severity: 'success',
      });
      fetchEstudiantes();
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el estudiante.',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setEstudianteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEstudianteToDelete(null);
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

  const columns = [
    {
      field: 'codigo',
      headerName: 'Codigo',
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'usuarioId',
      headerName: 'Usuario',
      width: 200,
      renderCell: (params) => usuarios[params.value] || 'Desconocido',
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Fecha de Creacion',
      width: 180,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Ver detalle">
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/estudiantes/${params.row.id}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/estudiantes/${params.row.id}/editar`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Estudiantes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/estudiantes/nuevo')}
        >
          Nuevo Estudiante
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <DataGrid
            rows={estudiantes}
            columns={columns}
            loading={loading}
            autoHeight
            pageSizeOptions={[5, 10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            localeText={{
              noRowsLabel: 'No se encontraron estudiantes',
              MuiTablePagination: {
                labelRowsPerPage: 'Filas por pagina:',
                labelDisplayedRows: ({ from, to, count }) =>
                  `${from}\u2013${to} de ${count !== -1 ? count : `mas de ${to}`}`,
              },
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'grey.100',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Dialogo de confirmacion de eliminacion */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar Eliminacion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Esta seguro de que desea eliminar al estudiante con codigo{' '}
            <strong>{estudianteToDelete?.codigo}</strong>? Esta accion no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
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

export default EstudiantesListPage;
