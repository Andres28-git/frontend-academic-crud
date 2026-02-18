import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import { UsuariosListPage, UsuarioFormPage, UsuarioDetailPage } from './pages/usuarios';
import { EstudiantesListPage, EstudianteFormPage, EstudianteDetailPage } from './pages/estudiantes';
import { RepresentantesListPage, RepresentanteFormPage, RepresentanteDetailPage } from './pages/representantes';
import { HorariosListPage, HorarioFormPage, HorarioDetailPage } from './pages/horarios';
import { AsistenciasListPage, AsistenciaFormPage, AsistenciaDetailPage } from './pages/asistencias';
import { NotificacionesListPage, NotificacionFormPage, NotificacionDetailPage } from './pages/notificaciones';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8 },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />

              {/* Usuarios - Admin only */}
              <Route path="/usuarios" element={<ProtectedRoute roles={['ADMIN']}><UsuariosListPage /></ProtectedRoute>} />
              <Route path="/usuarios/nuevo" element={<ProtectedRoute roles={['ADMIN']}><UsuarioFormPage /></ProtectedRoute>} />
              <Route path="/usuarios/:id" element={<ProtectedRoute roles={['ADMIN']}><UsuarioDetailPage /></ProtectedRoute>} />
              <Route path="/usuarios/:id/editar" element={<ProtectedRoute roles={['ADMIN']}><UsuarioFormPage /></ProtectedRoute>} />

              {/* Estudiantes */}
              <Route path="/estudiantes" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><EstudiantesListPage /></ProtectedRoute>} />
              <Route path="/estudiantes/nuevo" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><EstudianteFormPage /></ProtectedRoute>} />
              <Route path="/estudiantes/:id" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><EstudianteDetailPage /></ProtectedRoute>} />
              <Route path="/estudiantes/:id/editar" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><EstudianteFormPage /></ProtectedRoute>} />

              {/* Representantes */}
              <Route path="/representantes" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><RepresentantesListPage /></ProtectedRoute>} />
              <Route path="/representantes/nuevo" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><RepresentanteFormPage /></ProtectedRoute>} />
              <Route path="/representantes/:id" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><RepresentanteDetailPage /></ProtectedRoute>} />
              <Route path="/representantes/:id/editar" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><RepresentanteFormPage /></ProtectedRoute>} />

              {/* Horarios */}
              <Route path="/horarios" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><HorariosListPage /></ProtectedRoute>} />
              <Route path="/horarios/nuevo" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><HorarioFormPage /></ProtectedRoute>} />
              <Route path="/horarios/:id" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><HorarioDetailPage /></ProtectedRoute>} />
              <Route path="/horarios/:id/editar" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><HorarioFormPage /></ProtectedRoute>} />

              {/* Asistencias */}
              <Route path="/asistencias" element={<AsistenciasListPage />} />
              <Route path="/asistencias/nueva" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><AsistenciaFormPage /></ProtectedRoute>} />
              <Route path="/asistencias/:id" element={<AsistenciaDetailPage />} />
              <Route path="/asistencias/:id/editar" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><AsistenciaFormPage /></ProtectedRoute>} />

              {/* Notificaciones */}
              <Route path="/notificaciones" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><NotificacionesListPage /></ProtectedRoute>} />
              <Route path="/notificaciones/nueva" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><NotificacionFormPage /></ProtectedRoute>} />
              <Route path="/notificaciones/:id" element={<ProtectedRoute roles={['ADMIN', 'DOCENTE']}><NotificacionDetailPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
