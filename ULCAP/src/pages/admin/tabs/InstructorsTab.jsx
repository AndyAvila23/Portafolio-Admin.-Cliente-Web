import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { FiUsers, FiCheckCircle, FiXCircle, FiEdit2, FiPower, FiPlus } from 'react-icons/fi';
import Modal from '../../../components/Modal';
import EditProfileModal from './EditProfileModal';
import BlockModal from './BlockModal';
import '../AdminStyles.css';

const InstructorsTab = () => {
  const [users, setUsers] = useLocalStorage('users');

  const instructors = users.filter(u => u.role === 'instructor');
  const totalInstructors = instructors.length;
  const activeInstructors = instructors.filter(i => i.status === 'active').length;
  const disabledInstructors = instructors.filter(i => i.status === 'inactive').length;

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Modales
  const [editUser, setEditUser] = useState(null);
  const [disableUser, setDisableUser] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form de creación
  const [createForm, setCreateForm] = useState({
    names: '', lastNames: '', idCard: '', phone: '', gender: '',
    country: 'Ecuador', state: '', city: '', address: ''
  });

  const provinces = ['Azuay','Bolívar','Cañar','Carchi','Chimborazo','Cotopaxi','El Oro','Esmeraldas','Galápagos','Guayas','Imbabura','Loja','Los Ríos','Manabí','Morona Santiago','Napo','Orellana','Pastaza','Pichincha','Santa Elena','Santo Domingo','Sucumbíos','Tungurahua','Zamora Chinchipe'];

  const processed = useMemo(() => {
    let result = [...instructors];
    if (filterStatus !== 'ALL') result = result.filter(i => i.status === filterStatus);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(i => i.id.toLowerCase().includes(q) || (i.idCard || '').toLowerCase().includes(q) || i.names.toLowerCase().includes(q) || i.lastNames.toLowerCase().includes(q) || i.email.toLowerCase().includes(q));
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
  }, [instructors, searchTerm, filterStatus, sortBy]);

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    return pass;
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'idCard' || name === 'phone') && value !== '' && !/^\d*$/.test(value)) return;
    if ((name === 'idCard' || name === 'phone') && value.length > 10) return;
    setCreateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (createForm.idCard.length !== 10) { alert('La cédula debe tener 10 dígitos'); return; }
    if (createForm.phone.length !== 10) { alert('El teléfono debe tener 10 dígitos'); return; }

    const tempPassword = generateTempPassword();
    const newInstructor = {
      id: `INS-${Date.now()}`,
      names: createForm.names,
      lastNames: createForm.lastNames,
      idCard: createForm.idCard,
      phone: createForm.phone,
      email: `a${createForm.idCard}@ulcap.com`,
      password: tempPassword,
      mustChangePassword: true,
      role: 'instructor',
      gender: createForm.gender,
      avatar: '',
      country: createForm.country,
      state: createForm.state,
      city: createForm.city,
      address: createForm.address,
      status: 'active',
      blockReason: '',
      blockUntil: '',
      createdAt: new Date().toISOString()
    };

    setUsers([...users, newInstructor]);
    alert(`Instructor creado exitosamente.\n\nCorreo: ${newInstructor.email}\nContraseña temporal: ${tempPassword}\n\nEl instructor deberá cambiar su contraseña al primer inicio de sesión.`);
    setIsCreateOpen(false);
    setCreateForm({ names: '', lastNames: '', idCard: '', phone: '', gender: '', country: 'Ecuador', state: '', city: '', address: '' });
  };

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

  const handleDisable = (reason) => {
    setUsers(users.map(u => {
      if (u.id === disableUser.id) return { ...u, status: 'inactive', blockReason: reason, blockUntil: '' };
      return u;
    }));
    setDisableUser(null);
  };

  const handleEnable = (userId) => {
    setUsers(users.map(u => {
      if (u.id === userId) return { ...u, status: 'active', blockReason: '', blockUntil: '' };
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
          <div className="stat-details"><h3 style={{ fontSize: '20px' }}>{totalInstructors}</h3><p>Total Instructores</p></div>
        </div>
        <div className="stat-card" style={{ padding: '15px' }}>
          <div className="stat-icon success" style={{ width: '40px', height: '40px', fontSize: '18px' }}><FiCheckCircle /></div>
          <div className="stat-details"><h3 style={{ fontSize: '20px' }}>{activeInstructors}</h3><p>Activos</p></div>
        </div>
        <div className="stat-card" style={{ padding: '15px' }}>
          <div className="stat-icon warning" style={{ width: '40px', height: '40px', fontSize: '18px' }}><FiXCircle /></div>
          <div className="stat-details"><h3 style={{ fontSize: '20px' }}>{disabledInstructors}</h3><p>Deshabilitados</p></div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="advanced-toolbar">
        <input type="text" placeholder="Buscar por ID, cédula, nombre, correo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="toolbar-input" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="toolbar-select">
          <option value="ALL">Todos los Estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Deshabilitados</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="toolbar-select">
          <option value="newest">Más recientes</option>
          <option value="az">Nombre A-Z</option>
          <option value="za">Nombre Z-A</option>
        </select>
        <button className="auth-button" style={{ margin: 0 }} onClick={() => setIsCreateOpen(true)}>
          <FiPlus style={{ marginRight: '6px' }} /> Agregar Instructor
        </button>
      </div>

      {/* TABLE */}
      <div className="datatable-container">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Instructor</th>
                <th>ID</th>
                <th>Cédula</th>
                <th>Teléfono</th>
                <th>Registro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {processed.length > 0 ? processed.map(i => (
                <tr key={i.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff', flexShrink: 0 }}>
                        {i.names.charAt(0)}{i.lastNames.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{i.names} {i.lastNames}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{i.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{i.id}</td>
                  <td>{i.idCard || '—'}</td>
                  <td>{i.phone || '—'}</td>
                  <td>{formatDate(i.createdAt)}</td>
                  <td>
                    <span className={`badge ${i.status === 'active' ? 'active' : 'pending'}`}>
                      {i.status === 'active' ? 'Activo' : 'Deshabilitado'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" onClick={() => setEditUser(i)} title="Editar"><FiEdit2 /></button>
                      {i.status === 'active' ? (
                        <button className="action-btn delete" onClick={() => setDisableUser(i)} title="Deshabilitar"><FiPower /></button>
                      ) : (
                        <button className="action-btn edit" onClick={() => handleEnable(i.id)} title="Habilitar"><FiPower /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="no-data">No se encontraron instructores.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALES */}
      <EditProfileModal isOpen={!!editUser} onClose={() => setEditUser(null)} user={editUser} onSave={handleSaveProfile} isAdminRole />
      <BlockModal isOpen={!!disableUser} onClose={() => setDisableUser(null)} user={disableUser} onConfirm={handleDisable} type="disable" />

      {/* MODAL CREAR */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Agregar Instructor">
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <h4 style={{ gridColumn: '1 / -1', margin: '0 0 -5px 0', color: '#818cf8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Datos Personales</h4>
          <div className="form-group"><label>Nombres</label><input name="names" value={createForm.names} onChange={handleCreateChange} required className="toolbar-input" style={{ width: '100%' }} /></div>
          <div className="form-group"><label>Apellidos</label><input name="lastNames" value={createForm.lastNames} onChange={handleCreateChange} required className="toolbar-input" style={{ width: '100%' }} /></div>
          <div className="form-group"><label>Cédula (10 dígitos)</label><input name="idCard" value={createForm.idCard} onChange={handleCreateChange} required className="toolbar-input" style={{ width: '100%' }} /></div>
          <div className="form-group"><label>Teléfono (10 dígitos)</label><input name="phone" value={createForm.phone} onChange={handleCreateChange} required className="toolbar-input" style={{ width: '100%' }} /></div>
          <div className="form-group">
            <label>Género</label>
            <select name="gender" value={createForm.gender} onChange={handleCreateChange} className="toolbar-select" style={{ width: '100%', height: '42px' }}>
              <option value="">Seleccionar</option><option value="masculino">Masculino</option><option value="femenino">Femenino</option><option value="otro">Otro</option>
            </select>
          </div>
          <div className="form-group"><label>Rol</label><input value="Instructor" disabled className="toolbar-input" style={{ width: '100%', opacity: 0.6 }} /></div>

          <h4 style={{ gridColumn: '1 / -1', margin: '10px 0 -5px 0', color: '#818cf8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Ubicación</h4>
          <div className="form-group">
            <label>País</label>
            <select name="country" value={createForm.country} onChange={handleCreateChange} className="toolbar-select" style={{ width: '100%', height: '42px' }}>
              <option value="Ecuador">Ecuador</option><option value="Colombia">Colombia</option><option value="Perú">Perú</option><option value="México">México</option>
            </select>
          </div>
          <div className="form-group">
            <label>Provincia</label>
            {createForm.country === 'Ecuador' ? (
              <select name="state" value={createForm.state} onChange={handleCreateChange} className="toolbar-select" style={{ width: '100%', height: '42px' }}>
                <option value="">Seleccionar</option>{provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            ) : (<input name="state" value={createForm.state} onChange={handleCreateChange} className="toolbar-input" style={{ width: '100%' }} />)}
          </div>
          <div className="form-group"><label>Ciudad</label><input name="city" value={createForm.city} onChange={handleCreateChange} className="toolbar-input" style={{ width: '100%' }} /></div>
          <div className="form-group"><label>Dirección</label><input name="address" value={createForm.address} onChange={handleCreateChange} className="toolbar-input" style={{ width: '100%' }} /></div>

          <h4 style={{ gridColumn: '1 / -1', margin: '10px 0 -5px 0', color: '#818cf8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Acceso (Automático)</h4>
          <div className="form-group">
            <label>Correo (generado con cédula)</label>
            <input value={createForm.idCard.length === 10 ? `a${createForm.idCard}@ulcap.com` : 'Ingrese la cédula completa...'} disabled className="toolbar-input" style={{ width: '100%', opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label>Contraseña temporal</label>
            <input value="Se genera automáticamente" disabled className="toolbar-input" style={{ width: '100%', opacity: 0.6 }} />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsCreateOpen(false)} className="tab-btn">Cancelar</button>
            <button type="submit" className="auth-button" style={{ margin: 0 }}>Crear Instructor</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default InstructorsTab;
