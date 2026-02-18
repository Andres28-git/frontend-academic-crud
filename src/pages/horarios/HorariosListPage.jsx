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
import { getHorarios, deleteHorario } from '../../api/horariosService';

const HorariosListPage = () => {
  const navigate = useNavigate();

  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [horarioToDelete, setHorarioToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchHorarios = async () => {
    setLoading(true);
    try {
      const response = await getHorarios();
      setHorarios(response.data || []);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar la lista de horarios.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, []);

  const handleDeleteClick = (horario) => {
    setHorarioToDelete(horario);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!horarioToDelete) return;
    try {
      await deleteHorario(horarioToDelete.id);
      setSnackbar({
        open: true,
        message: 'Horario eliminado correctamente.',
        severity: 'success',
      });
      fetchHorarios();
    } catch (error) {
      console.error('Error al eliminar horario:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el horario.',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setHorarioToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setHorarioToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const formatHora = (horaString) => {
    if (!horaString) return '—';
    // horaEntrada comes as "HH:mm:ss", display as "HH:mm"
    const parts = horaString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return horaString;
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'diaSemana',
      headerName: 'Día de la Semana',
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'horaEntrada',
      headerName: 'Hora de Entrada',
      width: 160,
      valueFormatter: (value) => formatHora(value),
    },
    {
      field: 'toleranciaMinutos',
      headerName: 'Tolerancia',
      width: 140,
      valueFormatter: (value) => (value != null ? `${value} min` : '—'),
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
              onClick={() => navigate(`/horarios/${params.row.id}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/horarios/${params.row.id}/editar`)}
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
          Horarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/horarios/nuevo')}
        >
          Nuevo Horario
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <DataGrid
            rows={horarios}
            columns={columns}
            loading={loading}
            autoHeight
            pageSizeOptions={[5, 10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            localeText={{
              noRowsLabel: 'No se encontraron horarios',
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

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar el horario del día{' '}
            <strong>{horarioToDelete?.diaSemana}</strong>? Esta acción no se puede deshacer.
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

export default HorariosListPage;
