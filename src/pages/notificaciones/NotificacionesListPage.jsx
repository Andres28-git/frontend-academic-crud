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
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { getNotificaciones, deleteNotificacion } from '../../api/notificacionesService';
import { ESTADOS_ENVIO, TIPOS_NOTIFICACION } from '../../utils/roleHelpers';

const estadoEnvioColor = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return 'warning';
    case 'Enviado':
      return 'success';
    case 'Fallido':
      return 'error';
    default:
      return 'default';
  }
};

const NotificacionesListPage = () => {
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificacionToDelete, setNotificacionToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filtros
  const [filters, setFilters] = useState({
    estudianteId: '',
    estadoEnvio: '',
    tipo: '',
  });

  const buildParams = () => {
    const params = {};
    if (filters.estudianteId) params.estudianteId = Number(filters.estudianteId);
    if (filters.estadoEnvio) params.estadoEnvio = filters.estadoEnvio;
    if (filters.tipo) params.tipo = filters.tipo;
    return params;
  };

  const fetchNotificaciones = async (params) => {
    setLoading(true);
    try {
      const response = await getNotificaciones(params);
      setNotificaciones(response.data);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar la lista de notificaciones.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones(buildParams());
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiltrar = () => {
    fetchNotificaciones(buildParams());
  };

  const handleLimpiar = () => {
    const emptyFilters = { estudianteId: '', estadoEnvio: '', tipo: '' };
    setFilters(emptyFilters);
    fetchNotificaciones({});
  };

  const handleDeleteClick = (notificacion) => {
    setNotificacionToDelete(notificacion);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!notificacionToDelete) return;
    try {
      await deleteNotificacion(notificacionToDelete.id);
      setSnackbar({
        open: true,
        message: 'Notificacion eliminada correctamente.',
        severity: 'success',
      });
      fetchNotificaciones(buildParams());
    } catch (error) {
      console.error('Error al eliminar notificacion:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar la notificacion.',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setNotificacionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setNotificacionToDelete(null);
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
      field: 'id',
      headerName: 'ID',
      width: 70,
    },
    {
      field: 'estudianteId',
      headerName: 'Estudiante ID',
      width: 120,
    },
    {
      field: 'representanteId',
      headerName: 'Representante ID',
      width: 140,
    },
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'estadoEnvio',
      headerName: 'Estado de Envio',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={estadoEnvioColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'fechaEvento',
      headerName: 'Fecha del Evento',
      width: 170,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'detalle',
      headerName: 'Detalle',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Tooltip title={params.value || ''}>
          <Typography variant="body2" noWrap>
            {params.value || '\u2014'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Ver detalle">
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/notificaciones/${params.row.id}`)}
            >
              <VisibilityIcon fontSize="small" />
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
          Notificaciones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/notificaciones/nueva')}
        >
          Nueva Notificacion
        </Button>
      </Box>

      {/* Seccion de filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Filtros
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Estudiante ID"
              name="estudianteId"
              type="number"
              value={filters.estudianteId}
              onChange={handleFilterChange}
              size="small"
              sx={{ minWidth: 150 }}
            />
            <TextField
              select
              label="Estado de Envio"
              name="estadoEnvio"
              value={filters.estadoEnvio}
              onChange={handleFilterChange}
              size="small"
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {ESTADOS_ENVIO.map((estado) => (
                <MenuItem key={estado.value} value={estado.value}>
                  {estado.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Tipo"
              name="tipo"
              value={filters.tipo}
              onChange={handleFilterChange}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {TIPOS_NOTIFICACION.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={handleFiltrar}
              size="medium"
            >
              Filtrar
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleLimpiar}
              size="medium"
              color="inherit"
            >
              Limpiar
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <DataGrid
            rows={notificaciones}
            columns={columns}
            loading={loading}
            autoHeight
            pageSizeOptions={[5, 10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            localeText={{
              noRowsLabel: 'No se encontraron notificaciones',
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
            ¿Esta seguro de que desea eliminar la notificacion con ID{' '}
            <strong>{notificacionToDelete?.id}</strong>? Esta accion no se puede deshacer.
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

export default NotificacionesListPage;
