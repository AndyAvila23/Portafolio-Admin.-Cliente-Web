import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { FiUsers, FiCheckCircle, FiXCircle, FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';
import EditProfileModal from './EditProfileModal';
import BlockModal from './BlockModal';
import '../AdminStyles.css';

const StudentsTab = () => {
  const [users, setUsers] = useLocalStorage('users');

  const students = users.filter(u => u.role === 'student');
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const blockedStudents = students.filter(s => s.status === 'inactive').length;

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Modales
  const [editUser, setEditUser] = useState(null);
  const [blockUser, setBlockUser] = useState(null);

  const processed = useMemo(() => {
    let result = [...students];

    if (filterStatus !== 'ALL') result = result.filter(s => s.status === filterStatus);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.id.toLowerCase().includes(q) ||
        (s.idCard || '').toLowerCase().includes(q) ||
        s.names.toLowerCase().includes(q) ||
        s.lastNames.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'az': return `${a.names} ${a.lastNames}`.localeCompare(`${b.names} ${b.lastNames}`);
        case 'za': return `${b.names} ${b.lastNames}`.localeCompare(`${a.names} ${a.lastNames}`);
        default: return 0;
      }
    });

    return result;
  }, [students, searchTerm, filterStatus, sortBy]);

  const handleSaveProfile = (updatedData) => {
    setUsers(users.map(u => {
      if (u.id === editUser.id) {
        const updated = { ...u, ...updatedData };
        if (updatedData.newPassword) updated.password = updatedData.newPassword;
        return updated;
      }
      return u;
    }));
    setEditUser(null);
  };

  const handleBlock = (reason, blockUntil) => {
    setUsers(users.map(u => {
      if (u.id === blockUser.id) {
        return { ...u, status: 'inactive', blockReason: reason, blockUntil: blockUntil };
      }
      return u;
    }));
    setBlockUser(null);
  };

  const handleUnblock = (userId) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        return { ...u, status: 'active', blockReason: '', blockUntil: '' };
      }
      return u;
    }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      {/* STATS */}
      <div className="stats-grid" style={{ marginBottom: '10px' }}>
        <div className="stat-card" style={{ padding: '15px' }}>
          <div className="stat-icon primary" style={{ width: '40px', height: '40px', fontSize: '18px' }}><FiUsers /></div>
          <div className="stat-details"><h3 style={{ fontSize: '20px' }}>{totalStudents}</h3><p>Total Estudiantes</p></div>
        </div>
        <div className="stat-card" style={{ padding: '15px' }}>
          <div className="stat-icon success" style={{ width: '40px', height: '40px', fontSize: '18px' }}><FiCheckCircle /></div>
          <div className="stat-details"><h3 style={{ fontSize: '20px' }}>{activeStudents}</h3><p>Activos</p></div>
        </div>
        <div className="stat-card" style={{ padding: '15px' }}>
          <div className="stat-icon warning" style={{ width: '40px', height: '40px', fontSize: '18px' }}><FiXCircle /></div>
          <div className="stat-details"><h3 style={{ fontSize: '20px' }}>{blockedStudents}</h3><p>Bloqueados</p></div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="advanced-toolbar">
        <input type="text" placeholder="Buscar por ID, cédula, nombre, correo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="toolbar-input" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="toolbar-select">
          <option value="ALL">Todos los Estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Bloqueados</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="toolbar-select">
          <option value="newest">Más recientes</option>
          <option value="az">Nombre A-Z</option>
          <option value="za">Nombre Z-A</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="datatable-container">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>ID</th>
                <th>Cédula</th>
                <th>Teléfono</th>
                <th>Registro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {processed.length > 0 ? processed.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff', flexShrink: 0 }}>
                        {s.names.charAt(0)}{s.lastNames.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{s.names} {s.lastNames}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.id}</td>
                  <td>{s.idCard || '—'}</td>
                  <td>{s.phone || '—'}</td>
                  <td>{formatDate(s.createdAt)}</td>
                  <td>
                    <span className={`badge ${s.status === 'active' ? 'active' : 'pending'}`}>
                      {s.status === 'active' ? 'Activo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" onClick={() => setEditUser(s)} title="Editar Perfil"><FiEdit2 /></button>
                      {s.status === 'active' ? (
                        <button className="action-btn delete" onClick={() => setBlockUser(s)} title="Bloquear"><FiLock /></button>
                      ) : (
                        <button className="action-btn edit" onClick={() => handleUnblock(s.id)} title="Desbloquear"><FiUnlock /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="no-data">No se encontraron estudiantes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALES */}
      <EditProfileModal isOpen={!!editUser} onClose={() => setEditUser(null)} user={editUser} onSave={handleSaveProfile} />
      <BlockModal isOpen={!!blockUser} onClose={() => setBlockUser(null)} user={blockUser} onConfirm={handleBlock} type="block" />
    </>
  );
};

export default StudentsTab;
