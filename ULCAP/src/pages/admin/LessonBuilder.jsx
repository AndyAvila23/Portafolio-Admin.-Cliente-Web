import React, { useState } from 'react';
import { FiVideo, FiFileText, FiFile, FiTrash2, FiPlus, FiSave, FiEdit2 } from 'react-icons/fi';
import './AdminStyles.css';

const LessonBuilder = ({ lessons = [], onSave }) => {
  const [localLessons, setLocalLessons] = useState(lessons);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', type: 'video', content: '' });

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ title: '', type: 'video', content: '' });
  };

  const handleEditClick = (lesson) => {
    setIsAdding(true);
    setEditingId(lesson.id);
    setFormData({ title: lesson.title, type: lesson.type, content: lesson.content });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta lección?')) {
      const updated = localLessons.filter(l => l.id !== id);
      setLocalLessons(updated);
      onSave(updated);
    }
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    let updated;
    if (editingId) {
      updated = localLessons.map(l => l.id === editingId ? { ...l, ...formData } : l);
    } else {
      const newLesson = {
        id: `l${Date.now()}`,
        ...formData
      };
      updated = [...localLessons, newLesson];
    }
    setLocalLessons(updated);
    onSave(updated);
    setIsAdding(false);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'video': return <FiVideo color="#eab308" />;
      case 'pdf': return <FiFile color="#ef4444" />;
      default: return <FiFileText color="#3b82f6" />;
    }
  };

  return (
    <div className="builder-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Temario del Curso</h3>
        {!isAdding && (
          <button className="auth-button" style={{ margin: 0, padding: '8px 16px', fontSize: '14px' }} onClick={handleAddClick}>
            <FiPlus style={{ marginRight: '5px' }} /> Añadir Lección
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSaveForm} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <h4>{editingId ? 'Editar Lección' : 'Nueva Lección'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Título de la Lección</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="toolbar-input" style={{ width: '100%' }} />
            </div>
            
            <div className="form-group">
              <label>Tipo de Contenido</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="toolbar-select" style={{ width: '100%' }}>
                <option value="video">Video (URL de YouTube/Vimeo)</option>
                <option value="text">Texto / Artículo</option>
                <option value="pdf">Documento PDF (URL)</option>
              </select>
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>{formData.type === 'text' ? 'Contenido de la Lección (Texto)' : 'URL del Archivo/Video'}</label>
              {formData.type === 'text' ? (
                <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required className="toolbar-input" style={{ width: '100%', minHeight: '100px' }} />
              ) : (
                <input type="url" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required className="toolbar-input" style={{ width: '100%' }} placeholder="https://..." />
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" className="auth-button" style={{ margin: 0 }}><FiSave style={{ marginRight: '5px' }}/> Guardar</button>
            <button type="button" className="auth-button" style={{ margin: 0, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} onClick={() => setIsAdding(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="lessons-list">
        {localLessons.length > 0 ? localLessons.map((lesson, index) => (
          <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {index + 1}
              </div>
              <div style={{ fontSize: '20px' }}>{getIcon(lesson.type)}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{lesson.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{lesson.type}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="action-btn edit" onClick={() => handleEditClick(lesson)}><FiEdit2 /></button>
              <button className="action-btn delete" onClick={() => handleDelete(lesson.id)}><FiTrash2 /></button>
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            <p>Aún no hay lecciones en este curso.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonBuilder;
