import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../../context/AuthContext';
import { getUsuarios } from '../../api/usuariosService';
import { getEstudiantes } from '../../api/estudiantesService';
import { getRepresentantes } from '../../api/representantesService';
import { getAsistencias } from '../../api/asistenciasService';
import { getHorarios } from '../../api/horariosService';
import { getNotificaciones } from '../../api/notificacionesService';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" mt={1}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}20`,
          }}
        >
          <Icon sx={{ fontSize: 32, color }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const results = {};
        const promises = [];

        if (hasRole(['ADMIN'])) {
          promises.push(
            getUsuarios().then((r) => { results.usuarios = r.data?.length || 0; })
          );
        }
        promises.push(
          getEstudiantes().then((r) => { results.estudiantes = r.data?.length || 0; }),
          getRepresentantes().then((r) => { results.representantes = r.data?.length || 0; }),
          getAsistencias().then((r) => { results.asistencias = r.data?.length || 0; }),
          getHorarios().then((r) => { results.horarios = r.data?.length || 0; }),
          getNotificaciones().then((r) => { results.notificaciones = r.data?.length || 0; })
        );

        await Promise.allSettled(promises);
        setStats(results);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [hasRole]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  const cards = [
    ...(hasRole(['ADMIN'])
      ? [{ title: 'Usuarios', value: stats.usuarios || 0, icon: PeopleIcon, color: '#1976d2' }]
      : []),
    { title: 'Estudiantes', value: stats.estudiantes || 0, icon: SchoolIcon, color: '#2e7d32' },
    { title: 'Representantes', value: stats.representantes || 0, icon: FamilyRestroomIcon, color: '#ed6c02' },
    { title: 'Asistencias', value: stats.asistencias || 0, icon: CheckCircleIcon, color: '#9c27b0' },
    { title: 'Horarios', value: stats.horarios || 0, icon: ScheduleIcon, color: '#0288d1' },
    { title: 'Notificaciones', value: stats.notificaciones || 0, icon: NotificationsIcon, color: '#d32f2f' },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={1}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Bienvenido, {user?.nombre}
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardPage;
