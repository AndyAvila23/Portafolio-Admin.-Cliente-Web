import React, { useState } from 'react';
import { FiLink, FiDownload, FiTrash2, FiPlus, FiSave, FiEdit2 } from 'react-icons/fi';
import './AdminStyles.css';

const ResourceBuilder = ({ resources = [], onSave }) => {
  const [localResources, setLocalResources] = useState(resources);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', url: '', isDownloadable: false });

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ title: '', url: '', isDownloadable: false });
  };

  const handleEditClick = (resource) => {
    setIsAdding(true);
    setEditingId(resource.id);
    setFormData({ title: resource.title, url: resource.url, isDownloadable: resource.isDownloadable });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este recurso?')) {
      const updated = localResources.filter(r => r.id !== id);
      setLocalResources(updated);
      onSave(updated);
    }
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    let updated;
    if (editingId) {
      updated = localResources.map(r => r.id === editingId ? { ...r, ...formData } : r);
    } else {
      const newResource = {
        id: `r${Date.now()}`,
        ...formData
      };
      updated = [...localResources, newResource];
    }
    setLocalResources(updated);
    onSave(updated);
    setIsAdding(false);
  };

  return (
    <div className="builder-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Recursos Adicionales</h3>
        {!isAdding && (
          <button className="auth-button" style={{ margin: 0, padding: '8px 16px', fontSize: '14px' }} onClick={handleAddClick}>
            <FiPlus style={{ marginRight: '5px' }} /> Añadir Recurso
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSaveForm} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <h4>{editingId ? 'Editar Recurso' : 'Nuevo Recurso'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div className="form-group">
              <label>Título / Nombre del Archivo</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="toolbar-input" style={{ width: '100%' }} />
            </div>
            
            <div className="form-group">
              <label>URL del Recurso (Drive, Dropbox, etc.)</label>
              <input type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} required className="toolbar-input" style={{ width: '100%' }} placeholder="https://..." />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="checkbox-group">
                <input type="checkbox" checked={formData.isDownloadable} onChange={e => setFormData({...formData, isDownloadable: e.target.checked})} />
                <span>Marcar como descargable</span>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" className="auth-button" style={{ margin: 0 }}><FiSave style={{ marginRight: '5px' }}/> Guardar</button>
            <button type="button" className="auth-button" style={{ margin: 0, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} onClick={() => setIsAdding(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="resources-list">
        {localResources.length > 0 ? localResources.map((resource) => (
          <div key={resource.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '20px', color: '#10b981' }}>
                {resource.isDownloadable ? <FiDownload /> : <FiLink />}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{resource.title}</div>
                <a href={resource.url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}>Ver enlace</a>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="action-btn edit" onClick={() => handleEditClick(resource)}><FiEdit2 /></button>
              <button className="action-btn delete" onClick={() => handleDelete(resource.id)}><FiTrash2 /></button>
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            <p>Aún no hay recursos adicionales en este curso.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceBuilder;
