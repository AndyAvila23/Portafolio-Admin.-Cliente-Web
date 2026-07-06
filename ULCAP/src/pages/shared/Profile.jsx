import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiSave, FiUser, FiMapPin, FiLock } from 'react-icons/fi';
import '../admin/AdminStyles.css'; // Reutilizamos estilos

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();

  const [form, setForm] = useState({
    names: currentUser.names || '',
    lastNames: currentUser.lastNames || '',
    phone: currentUser.phone || '',
    country: currentUser.country || 'Ecuador',
    state: currentUser.state || '',
    city: currentUser.city || '',
    address: currentUser.address || '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');

  const provinces = ['Azuay','Bolívar','Cañar','Carchi','Chimborazo','Cotopaxi','El Oro','Esmeraldas','Galápagos','Guayas','Imbabura','Loja','Los Ríos','Manabí','Morona Santiago','Napo','Orellana','Pastaza','Pichincha','Santa Elena','Santo Domingo','Sucumbíos','Tungurahua','Zamora Chinchipe'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && value !== '' && !/^\d*$/.test(value)) return;
    if (name === 'phone' && value.length > 10) return;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.phone.length !== 10) {
      setMessage('El teléfono debe tener 10 dígitos.');
      return;
    }
    
    if (form.newPassword) {
      if (form.newPassword !== form.confirmPassword) {
        setMessage('Las contraseñas no coinciden.');
        return;
      }
    }

    const updatedUser = { ...currentUser, ...form };
    
    if (form.newPassword) {
      updatedUser.password = form.newPassword;
      updatedUser.mustChangePassword = false;
    }
    
    delete updatedUser.newPassword;
    delete updatedUser.confirmPassword;

    updateProfile(updatedUser);
    setMessage('¡Perfil actualizado con éxito!');
    setTimeout(() => setMessage(''), 3000);
    setForm(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
  };

  return (
    <div className="admin-view-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="view-header">
        <div>
          <h2>Mi Perfil</h2>
          <p>Gestiona tu información personal y credenciales de acceso.</p>
        </div>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', background: message.includes('éxito') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.includes('éxito') ? '#4ade80' : '#ef4444', borderRadius: '8px', border: `1px solid ${message.includes('éxito') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, fontSize: '14px' }}>
          {message}
        </div>
      )}

      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* IDENTIFICACIÓN FIJA */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px', alignItems: 'center', padding: '16px', background: 'rgba(15,23,42,0.4)', borderRadius: '12px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px', color: '#fff', flexShrink: 0 }}>
              {currentUser.names.charAt(0)}{currentUser.lastNames.charAt(0)}
            </div>
            <div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{currentUser.names} {currentUser.lastNames}</h3>
              <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <span><strong>Rol:</strong> {currentUser.role.toUpperCase()}</span>
                <span><strong>Cédula:</strong> {currentUser.idCard || 'N/A'}</span>
                <span><strong>Correo:</strong> {currentUser.email}</span>
              </div>
            </div>
          </div>

          {/* DATOS PERSONALES */}
          <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8' }}><FiUser /> Datos Personales</h4>
          </div>

          <div className="form-group">
            <label>Nombres</label>
            <input name="names" value={form.names} onChange={handleChange} required className="toolbar-input" />
          </div>
          <div className="form-group">
            <label>Apellidos</label>
            <input name="lastNames" value={form.lastNames} onChange={handleChange} required className="toolbar-input" />
          </div>
          <div className="form-group">
            <label>Teléfono (10 dígitos)</label>
            <input name="phone" value={form.phone} onChange={handleChange} required className="toolbar-input" />
          </div>

          {/* UBICACIÓN */}
          <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: '10px' }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8' }}><FiMapPin /> Ubicación</h4>
          </div>

          <div className="form-group">
            <label>País</label>
            <select name="country" value={form.country} onChange={handleChange} className="toolbar-select" style={{ width: '100%' }}>
              <option value="Ecuador">Ecuador</option>
              <option value="Colombia">Colombia</option>
              <option value="Perú">Perú</option>
              <option value="México">México</option>
            </select>
          </div>
          <div className="form-group">
            <label>Provincia</label>
            {form.country === 'Ecuador' ? (
              <select name="state" value={form.state} onChange={handleChange} className="toolbar-select" style={{ width: '100%' }}>
                <option value="">Seleccionar</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            ) : (
              <input name="state" value={form.state} onChange={handleChange} className="toolbar-input" />
            )}
          </div>
          <div className="form-group">
            <label>Ciudad</label>
            <input name="city" value={form.city} onChange={handleChange} className="toolbar-input" />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input name="address" value={form.address} onChange={handleChange} className="toolbar-input" />
          </div>

          {/* SEGURIDAD */}
          <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: '10px' }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8' }}><FiLock /> Seguridad</h4>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Déjalo en blanco si no deseas cambiar tu contraseña.</p>
          </div>

          <div className="form-group">
            <label>Nueva Contraseña</label>
            <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} className="toolbar-input" />
          </div>
          <div className="form-group">
            <label>Confirmar Nueva Contraseña</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="toolbar-input" />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="submit" className="auth-button" style={{ margin: 0, width: 'auto', padding: '12px 24px' }}>
              <FiSave style={{ marginRight: '8px' }} /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
