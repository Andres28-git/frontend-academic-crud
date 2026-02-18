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
  Grid,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { getAsistencias, deleteAsistencia } from '../../api/asistenciasService';
import { getEstudiantes } from '../../api/estudiantesService';
import { getUsuarios } from '../../api/usuariosService';
import { ESTADOS_ASISTENCIA } from '../../utils/roleHelpers';

const estadoColorMap = {
  Presente: 'success',
  Ausente: 'error',
  Tardanza: 'warning',
  Justificado: 'info',
};

const AsistenciasListPage = () => {
  const navigate = useNavigate();

  const [asistencias, setAsistencias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudiantesMap, setEstudiantesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [asistenciaToDelete, setAsistenciaToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filtros
  const [filters, setFilters] = useState({
    estudianteId: '',
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
  });

  const buildParams = () => {
    const params = {};
    if (filters.estudianteId) params.estudianteId = Number(filters.estudianteId);
    if (filters.fechaDesde) params.fechaDesde = filters.fechaDesde;
    if (filters.fechaHasta) params.fechaHasta = filters.fechaHasta;
    if (filters.estado) params.estado = filters.estado;
    return params;
  };

  const fetchInitialData = async () => {
    try {
      const [estRes, usersRes] = await Promise.all([
        getEstudiantes(),
        getUsuarios(),
      ]);
      const usersMap = {};
      (usersRes.data || []).forEach((u) => {
        usersMap[u.id] = u.nombre || u.correo || `Usuario ${u.id}`;
      });
      const estMap = {};
      (estRes.data || []).forEach((e) => {
        estMap[e.id] = usersMap[e.usuarioId] || `Estudiante ${e.id}`;
      });
      setEstudiantes(estRes.data || []);
      setEstudiantesMap(estMap);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  };

  const fetchAsistencias = async () => {
    setLoading(true);
    try {
      const response = await getAsistencias(buildParams());
      setAsistencias(response.data);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar la lista de asistencias.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchInitialData();
      await fetchAsistencias();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFiltrar = () => {
    fetchAsistencias();
  };

  const handleLimpiar = () => {
    setFilters({
      estudianteId: '',
      fechaDesde: '',
      fechaHasta: '',
      estado: '',
    });
  };

  const handleDeleteClick = (asistencia) => {
    setAsistenciaToDelete(asistencia);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!asistenciaToDelete) return;
    try {
      await deleteAsistencia(asistenciaToDelete.id);
      setSnackbar({
        open: true,
        message: 'Asistencia eliminada correctamente.',
        severity: 'success',
      });
      fetchAsistencias();
    } catch (error) {
      console.error('Error al eliminar asistencia:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar la asistencia.',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setAsistenciaToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAsistenciaToDelete(null);
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
    });
  };

  const formatHora = (horaString) => {
    if (!horaString) return '\u2014';
    const parts = horaString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return horaString;
  };

  // Obtener info legible para el diálogo de eliminar
  const getDeleteDescription = () => {
    if (!asistenciaToDelete) return '';
    const nombre = estudiantesMap[asistenciaToDelete.estudianteId] || 'Desconocido';
    const fecha = formatDate(asistenciaToDelete.fecha);
    return `${nombre} - ${fecha}`;
  };

  const columns = [
    {
      field: 'estudianteId',
      headerName: 'Estudiante',
      width: 200,
      renderCell: (params) =>
        estudiantesMap[params.value] || 'Desconocido',
    },
    {
      field: 'fecha',
      headerName: 'Fecha',
      width: 140,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'hora',
      headerName: 'Hora',
      width: 100,
      valueFormatter: (value) => formatHora(value),
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={estadoColorMap[params.value] || 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'observacion',
      headerName: 'Observacion',
      flex: 1,
      minWidth: 200,
      valueFormatter: (value) => value || '\u2014',
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
              onClick={() => navigate(`/asistencias/${params.row.id}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/asistencias/${params.row.id}/editar`)}
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
          Asistencias
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/asistencias/nueva')}
        >
          Registrar Asistencia
        </Button>
      </Box>

      {/* Seccion de filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Filtros
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Estudiante"
                select
                value={filters.estudianteId}
                onChange={handleFilterChange('estudianteId')}
                fullWidth
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                {estudiantes.map((est) => (
                  <MenuItem key={est.id} value={est.id}>
                    {estudiantesMap[est.id] || `Estudiante ${est.id}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Fecha Desde"
                type="date"
                value={filters.fechaDesde}
                onChange={handleFilterChange('fechaDesde')}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Fecha Hasta"
                type="date"
                value={filters.fechaHasta}
                onChange={handleFilterChange('fechaHasta')}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Estado"
                select
                value={filters.estado}
                onChange={handleFilterChange('estado')}
                fullWidth
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                {ESTADOS_ASISTENCIA.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={handleFiltrar}
                >
                  Filtrar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleLimpiar}
                >
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de asistencias */}
      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <DataGrid
            rows={asistencias}
            columns={columns}
            loading={loading}
            autoHeight
            pageSizeOptions={[5, 10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            localeText={{
              noRowsLabel: 'No se encontraron asistencias',
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
            ¿Esta seguro de que desea eliminar la asistencia de{' '}
            <strong>{getDeleteDescription()}</strong>? Esta accion no se puede deshacer.
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

export default AsistenciasListPage;
