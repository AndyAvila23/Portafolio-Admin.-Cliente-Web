import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';

const EditProfileModal = ({ isOpen, onClose, user, onSave, isAdminRole = false }) => {
  const [form, setForm] = useState({
    names: '', lastNames: '', idCard: '', phone: '', email: '',
    newPassword: '', gender: '', role: '',
    country: '', state: '', city: '', address: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        names: user.names || '',
        lastNames: user.lastNames || '',
        idCard: user.idCard || '',
        phone: user.phone || '',
        email: user.email || '',
        newPassword: '',
        gender: user.gender || '',
        role: user.role || '',
        country: user.country || 'Ecuador',
        state: user.state || '',
        city: user.city || '',
        address: user.address || ''
      });
    }
  }, [user]);

  // Auto-generar correo si se cambia la cédula (solo para admin/instructor)
  useEffect(() => {
    if (isAdminRole && form.idCard.length === 10) {
      setForm(prev => ({ ...prev, email: `a${form.idCard}@ulcap.com` }));
    }
  }, [form.idCard, isAdminRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Validar solo números en cédula y teléfono
    if ((name === 'idCard' || name === 'phone') && value !== '' && !/^\d*$/.test(value)) return;
    if ((name === 'idCard' || name === 'phone') && value.length > 10) return;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.idCard.length !== 10) { alert('La cédula debe tener 10 dígitos'); return; }
    if (form.phone.length !== 10) { alert('El teléfono debe tener 10 dígitos'); return; }
    
    const updatedData = { ...form };
    if (!updatedData.newPassword) delete updatedData.newPassword;
    onSave(updatedData);
  };

  if (!user) return null;

  // Datos de ubicación (simplificados para Ecuador)
  const provinces = ['Azuay','Bolívar','Cañar','Carchi','Chimborazo','Cotopaxi','El Oro','Esmeraldas','Galápagos','Guayas','Imbabura','Loja','Los Ríos','Manabí','Morona Santiago','Napo','Orellana','Pastaza','Pichincha','Santa Elena','Santo Domingo','Sucumbíos','Tungurahua','Zamora Chinchipe'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil">
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {/* DATOS PERSONALES */}
        <h4 style={{ gridColumn: '1 / -1', margin: '0 0 -5px 0', color: '#818cf8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Datos Personales</h4>
        
        <div className="form-group">
          <label>Nombres</label>
          <input name="names" value={form.names} onChange={handleChange} required className="toolbar-input" style={{ width: '100%' }} />
        </div>
        <div className="form-group">
          <label>Apellidos</label>
          <input name="lastNames" value={form.lastNames} onChange={handleChange} required className="toolbar-input" style={{ width: '100%' }} />
        </div>
        <div className="form-group">
          <label>Cédula</label>
          <input name="idCard" value={form.idCard} onChange={handleChange} required className="toolbar-input" style={{ width: '100%' }} placeholder="10 dígitos" />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input name="phone" value={form.phone} onChange={handleChange} required className="toolbar-input" style={{ width: '100%' }} placeholder="10 dígitos" />
        </div>
        <div className="form-group">
          <label>Género</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="toolbar-select" style={{ width: '100%', height: '42px' }}>
            <option value="">Seleccionar</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        {isAdminRole && (
          <div className="form-group">
            <label>Rol</label>
            <select name="role" value={form.role} onChange={handleChange} className="toolbar-select" style={{ width: '100%', height: '42px' }}>
              <option value="admin">Administrador</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>
        )}

        {/* UBICACIÓN */}
        <h4 style={{ gridColumn: '1 / -1', margin: '10px 0 -5px 0', color: '#818cf8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Ubicación</h4>
        
        <div className="form-group">
          <label>País</label>
          <select name="country" value={form.country} onChange={handleChange} className="toolbar-select" style={{ width: '100%', height: '42px' }}>
            <option value="Ecuador">Ecuador</option>
            <option value="Colombia">Colombia</option>
            <option value="Perú">Perú</option>
            <option value="México">México</option>
          </select>
        </div>
        <div className="form-group">
          <label>Provincia</label>
          {form.country === 'Ecuador' ? (
            <select name="state" value={form.state} onChange={handleChange} className="toolbar-select" style={{ width: '100%', height: '42px' }}>
              <option value="">Seleccionar</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          ) : (
            <input name="state" value={form.state} onChange={handleChange} className="toolbar-input" style={{ width: '100%' }} />
          )}
        </div>
        <div className="form-group">
          <label>Ciudad</label>
          <input name="city" value={form.city} onChange={handleChange} className="toolbar-input" style={{ width: '100%' }} />
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input name="address" value={form.address} onChange={handleChange} className="toolbar-input" style={{ width: '100%' }} />
        </div>

        {/* ACCESO */}
        <h4 style={{ gridColumn: '1 / -1', margin: '10px 0 -5px 0', color: '#818cf8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Acceso</h4>
        
        <div className="form-group">
          <label>Correo {isAdminRole && '(se genera con la cédula)'}</label>
          <input name="email" value={form.email} onChange={handleChange} required className="toolbar-input" style={{ width: '100%', opacity: isAdminRole ? 0.6 : 1 }} disabled={isAdminRole} />
        </div>
        <div className="form-group">
          <label>Nueva Contraseña (opcional)</label>
          <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} className="toolbar-input" style={{ width: '100%' }} placeholder="Dejar vacío si no cambia" />
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button type="button" onClick={onClose} className="tab-btn">Cancelar</button>
          <button type="submit" className="auth-button" style={{ margin: 0 }}>Guardar</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
