# ULCAP - Plataforma de Gestión de Cursos (LMS)

ULCAP es una plataforma web moderna para la gestión del aprendizaje (Learning Management System). Está diseñada para facilitar la administración de cursos, usuarios y recursos por parte de administradores, así como brindar una experiencia intuitiva para los estudiantes al consumir contenido educativo y obtener certificados.

## 🚀 Características Principales

El sistema está dividido en dos roles principales: **Administrador** y **Estudiante**, además de una sección pública.

### 👑 Módulo de Administrador
* **Dashboard**: Vista general de métricas y estadísticas del sistema (gráficos interactivos).
* **Gestión de Cursos**: Crear, editar y gestionar cursos educativos.
* **Constructor de Contenidos**: `LessonBuilder` y `ResourceBuilder` para organizar lecciones, videos y archivos adjuntos de forma dinámica.
* **Gestión de Usuarios**: Administración de cuentas, progreso y accesos.
* **Reportes**: Visualización de estadísticas detalladas y desempeño.
* **Perfil**: Gestión de la cuenta administrativa.

### 🎓 Módulo de Estudiante
* **Inicio / Explorar Cursos**: Catálogo de cursos disponibles y recomendaciones.
* **Mis Cursos**: Acceso a los cursos en los que el estudiante está inscrito.
* **Visor de Curso (`CourseViewer`)**: Interfaz inmersiva para consumir lecciones, videos y materiales paso a paso.
* **Certificados**: Visualización de los logros y certificados obtenidos al culminar cursos.
* **Perfil**: Configuración de información personal del estudiante.

### 🔒 Autenticación y Público
* **Landing Page Pública**: Página principal informativa para captar usuarios.
* **Login y Registro**: Sistema de autenticación de usuarios para ambos roles (controlado por `AuthContext`).

## 🛠️ Tecnologías Utilizadas

Este proyecto es una Single Page Application (SPA) basada en el ecosistema de **React**.

* **React (v19)**: Librería central para construir la interfaz.
* **React Router DOM (v7)**: Manejo de las rutas de la aplicación (protección de rutas según el rol).
* **Context API**: Manejo del estado global, especialmente útil para mantener la sesión del usuario.
* **Recharts**: Creación de los gráficos y visualización de datos en los dashboards.
* **React Icons**: Integración de iconografía en toda la interfaz.
* **Vanilla CSS**: Estilos limpios y organizados para componentes y layouts, con enfoque en una interfaz rica y responsiva.

## ⚙️ Instalación y Ejecución Local

Para levantar el entorno de desarrollo local, asegúrate de tener [Node.js](https://nodejs.org/) instalado.

1. **Instalar dependencias**:
   En la raíz del proyecto, ejecuta:
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo**:
   ```bash
   npm start
   ```
   La aplicación se abrirá en [http://localhost:3000](http://localhost:3000). Soportará recarga en vivo (hot-reload) ante cualquier cambio en el código.

## 📦 Construcción para Producción

Para preparar la aplicación para ser subida a un entorno de producción, utiliza:

```bash
npm run build
```

Este comando empaquetará los archivos optimizados dentro de la carpeta `build`. Podrás servir el contenido de esta carpeta usando cualquier servidor de archivos estáticos (Netlify, Vercel, AWS S3, Nginx, etc.).

## 🗂️ Estructura del Proyecto

```text
src/
├── assets/       # Imágenes, logos y recursos estáticos
├── components/   # Componentes UI reutilizables (tarjetas, botones, menús)
├── context/      # Contextos globales de React (ej. AuthContext)
├── data/         # Archivos con datos falsos (mocks) o configuraciones
├── hooks/        # Hooks personalizados de React
├── layouts/      # Estructuras maestras para las vistas (AdminLayout, StudentLayout)
├── pages/        # Vistas de página completa
│   ├── admin/    # Vistas de administrador
│   ├── student/  # Vistas de estudiante
│   ├── auth/     # Vistas de autenticación
│   ├── public/   # Vistas públicas
│   └── shared/   # Vistas compartidas entre roles
├── routes/       # Lógica principal del enrutador (AppRoutes.jsx)
├── services/     # Integraciones de API y servicios externos
├── styles/       # Hojas de estilo CSS compartidas y variables
├── utils/        # Funciones auxiliares y formateadores
├── App.js        # Punto de ensamblaje de la aplicación
└── index.js      # Punto de entrada de React en el DOM
```
