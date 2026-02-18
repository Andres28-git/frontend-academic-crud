import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';

const menuConfig = [
  {
    label: 'Dashboard',
    path: '/',
    icon: DashboardIcon,
    roles: ['ADMIN', 'DOCENTE', 'REPRESENTANTE', 'ESTUDIANTE'],
  },
  {
    label: 'Usuarios',
    path: '/usuarios',
    icon: PeopleIcon,
    roles: ['ADMIN'],
  },
  {
    label: 'Estudiantes',
    path: '/estudiantes',
    icon: SchoolIcon,
    roles: ['ADMIN', 'DOCENTE'],
  },
  {
    label: 'Representantes',
    path: '/representantes',
    icon: FamilyRestroomIcon,
    roles: ['ADMIN', 'DOCENTE'],
  },
  {
    label: 'Horarios',
    path: '/horarios',
    icon: ScheduleIcon,
    roles: ['ADMIN', 'DOCENTE'],
  },
  {
    label: 'Asistencias',
    path: '/asistencias',
    icon: CheckCircleIcon,
    roles: ['ADMIN', 'DOCENTE', 'REPRESENTANTE'],
  },
  {
    label: 'Notificaciones',
    path: '/notificaciones',
    icon: NotificationsIcon,
    roles: ['ADMIN', 'DOCENTE'],
  },
];

export default menuConfig;
