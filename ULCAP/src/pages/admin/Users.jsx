import React, { useState } from 'react';
import StudentsTab from './tabs/StudentsTab';
import InstructorsTab from './tabs/InstructorsTab';
import AdminsTab from './tabs/AdminsTab';
import './AdminStyles.css';

const Users = () => {
  const [activeTab, setActiveTab] = useState('student');

  return (
    <div className="admin-view-container">
      <div className="view-header">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p>Administra estudiantes, instructores y administradores de la plataforma.</p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => setActiveTab('student')}
        >
          Estudiantes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'instructor' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructor')}
        >
          Instructores
        </button>
        <button 
          className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          Administradores
        </button>
      </div>

      {activeTab === 'student' && <StudentsTab />}
      {activeTab === 'instructor' && <InstructorsTab />}
      {activeTab === 'admin' && <AdminsTab />}
    </div>
  );
};

export default Users;
