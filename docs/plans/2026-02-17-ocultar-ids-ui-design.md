# Ocultar IDs y Mostrar Nombres Amigables en UI

## Objetivo
Reemplazar todos los IDs internos visibles al usuario por campos amigables (nombres, códigos, teléfonos) sin modificar la API backend.

## Principios
- Los IDs se mantienen internamente para keys, requests, navegación y operaciones CRUD
- Solo se ocultan de la interfaz visible (tablas, formularios, detalles)
- Se usan mapas de lookup (id → nombre) cargados en paralelo con Promise.all
- No se modifica ningún payload enviado a la API
- No se crean archivos nuevos, solo se editan los existentes

## Cambios por Módulo

### Estudiantes

**EstudiantesListPage.jsx**
- Agregar import de `getUsuarios` desde usuariosService
- Fetch en paralelo: `Promise.all([getEstudiantes(), getUsuarios()])`
- Crear `usersMap` (id → nombre)
- Eliminar columna `id`
- Reemplazar columna `usuarioId` → columna "Usuario" que muestra nombre resuelto

**EstudianteDetailPage.jsx**
- Agregar fetch de usuarios para resolver nombre
- Eliminar bloque que muestra "ID"
- Reemplazar bloque "Usuario ID" por "Usuario" con nombre resuelto

**EstudianteFormPage.jsx**
- En dropdown de usuario: quitar `(ID: {usuario.id})`, mostrar solo `{usuario.nombre}`

### Representantes

**RepresentantesListPage.jsx**
- Eliminar columna `id`
- Agregar botón "Representados" en columna de acciones
- Agregar modal que muestra estudiantes vinculados:
  - Fetch: `getRelaciones()` filtrado por representanteId + `getEstudiantes()` para resolver nombres
  - Tabla en modal: nombre estudiante, código, parentesco
- En diálogo eliminar: reemplazar "ID {selectedId}" por nombre del usuario

**RepresentanteDetailPage.jsx**
- Eliminar bloque "ID"
- En bloque "Usuario": quitar `(ID: {representante.usuarioId})`

**RepresentanteFormPage.jsx**
- Agregar fetch de usuarios
- Modo creación: dropdown de usuario con nombres (como EstudianteFormPage)
- Modo edición: nombre del usuario como texto readonly
- Payload sigue enviando `usuarioId` numérico

### Asistencias

**AsistenciasListPage.jsx**
- Agregar import de `getEstudiantes`
- Fetch en paralelo con asistencias
- Crear `estudiantesMap` (id → nombre/código)
- Eliminar columna `id`
- Reemplazar columna `estudianteId` → "Estudiante" con nombre resuelto
- En filtros: reemplazar input numérico por dropdown de estudiantes
- En diálogo eliminar: reemplazar "ID" por fecha + nombre estudiante

**AsistenciaFormPage.jsx**
- Agregar fetch de estudiantes al montar
- Reemplazar input numérico "Estudiante ID" por dropdown con nombres
- Payload sigue enviando `estudianteId` numérico

## Archivos No Modificados
- Todos los servicios API (`src/api/*`)
- Router (`src/router/*`)
- Store (`src/store/*`)
- Componentes compartidos (`src/components/*`)
