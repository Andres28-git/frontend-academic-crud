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
import { getUsuarios, deleteUsuario } from '../../api/usuariosService';
import { useAuth } from '../../context/AuthContext';

const UsuariosListPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await getUsuarios();
      setUsuarios(response.data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar la lista de usuarios.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleDeleteClick = (usuario) => {
    setUsuarioToDelete(usuario);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!usuarioToDelete) return;
    try {
      await deleteUsuario(usuarioToDelete.id);
      setSnackbar({
        open: true,
        message: 'Usuario eliminado correctamente.',
        severity: 'success',
      });
      fetchUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el usuario.',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setUsuarioToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUsuarioToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
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
      field: 'nombre',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'correo',
      headerName: 'Correo',
      flex: 1,
      minWidth: 220,
    },
    {
      field: 'rol',
      headerName: 'Rol',
      width: 150,
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
      headerName: 'Fecha de Creación',
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
              onClick={() => navigate(`/usuarios/${params.row.id}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/usuarios/${params.row.id}/editar`)}
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
          Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/usuarios/nuevo')}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <DataGrid
            rows={usuarios}
            columns={columns}
            loading={loading}
            autoHeight
            pageSizeOptions={[5, 10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            localeText={{
              noRowsLabel: 'No se encontraron usuarios',
              MuiTablePagination: {
                labelRowsPerPage: 'Filas por página:',
                labelDisplayedRows: ({ from, to, count }) =>
                  `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
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
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar al usuario{' '}
            <strong>{usuarioToDelete?.nombre}</strong>? Esta acción no se puede deshacer.
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

export default UsuariosListPage;
