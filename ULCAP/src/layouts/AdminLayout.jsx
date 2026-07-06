import React from 'react';
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiBookOpen, FiUsers, FiPieChart, FiLogOut, FiUser } from 'react-icons/fi';
import './AdminLayout.css';

const AdminLayout = () => {
  const { currentUser, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <div>Cargando...</div>;
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'instructor')) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>ULCAP Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <FiHome /> Dashboard
          </NavLink>
          <NavLink to="/admin/courses" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <FiBookOpen /> Cursos
          </NavLink>
          
          {/* Solo administradores pueden ver gestión de usuarios y reportes completos */}
          {currentUser.role === 'admin' && (
            <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <FiUsers /> Usuarios
            </NavLink>
          )}

          <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <FiPieChart /> Reportes
          </NavLink>

          <div style={{ marginTop: 'auto' }}></div>
          
          <button 
            className="nav-item" 
            style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', marginBottom: '10px' }}
            onClick={() => navigate('/student')}
          >
            <FiUser style={{ marginRight: '10px' }} /> Ver Portal de Alumnos
          </button>
          <NavLink to="/admin/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <FiUser /> Mi Perfil
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1>{currentUser.role === 'admin' ? 'Administración Global' : 'Panel de Instructor'}</h1>
          </div>
          <div className="topbar-right">
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{currentUser.names} {currentUser.lastNames}</span>
                <span className="user-role">{currentUser.role}</span>
              </div>
              <div className="avatar">
                {currentUser.names.charAt(0)}{currentUser.lastNames.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
