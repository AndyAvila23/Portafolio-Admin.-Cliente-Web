import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiBook, FiUser, FiLogOut, FiMenu, FiX, FiAward, FiFileText } from 'react-icons/fi';
import './StudentLayout.css';

const StudentLayout = () => {
  const { currentUser, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'student') {
      window.isViewerMode = true;
    } else {
      window.isViewerMode = false;
      delete window.__viewerCache;
    }
    return () => {
      window.isViewerMode = false;
      delete window.__viewerCache;
    };
  }, [currentUser]);

  if (isLoading) return <div>Cargando...</div>;
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // No mostrar el layout completo si estamos dentro de un visor de curso inmersivo
  const isCourseViewer = location.pathname.includes('/student/course/');

  if (isCourseViewer) {
    return <Outlet />; // El visor de curso tiene su propio header inmersivo
  }

  return (
    <div className="student-layout">
      {/* Banner de Modo Vista (Admin/Instructor) */}
      {currentUser && (currentUser.role === 'admin' || currentUser.role === 'instructor') && (
        <div style={{ background: '#3b82f6', color: 'white', padding: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>
          Estás viendo el Portal como {currentUser.role === 'admin' ? 'Administrador' : 'Instructor'}.
          <button 
            onClick={() => navigate('/admin')} 
            style={{ marginLeft: '10px', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Volver a mi panel
          </button>
        </div>
      )}

      {/* Navbar Superior */}
      <nav className="student-navbar">
        <div className="navbar-brand">
          <div className="logo-placeholder">ULCAP</div>
        </div>

        <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/student" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
            <FiHome /> Catálogo
          </NavLink>
          <NavLink to="/student/my-courses" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
            <FiBook /> Mis Cursos
          </NavLink>
          <NavLink to="/student/certificates" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
            <FiAward /> Certificados
          </NavLink>
          <NavLink to="/student/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
            <FiUser /> Mi Perfil
          </NavLink>
          
          <button className="nav-link logout-mobile" onClick={handleLogout}>
            <FiLogOut /> Cerrar Sesión
          </button>
        </div>

        <div className="navbar-user">
          <div className="user-profile" onClick={() => navigate('/student/profile')} style={{ cursor: 'pointer' }}>
            <span className="user-name-short">{currentUser.names.split(' ')[0]}</span>
            <div className="avatar small">
              {currentUser.names.charAt(0)}{currentUser.lastNames.charAt(0)}
            </div>
          </div>
          <button className="icon-btn logout-desktop" onClick={handleLogout} title="Cerrar Sesión">
            <FiLogOut />
          </button>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="student-main">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
