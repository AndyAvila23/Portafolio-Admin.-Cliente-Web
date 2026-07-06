import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './AdminStyles.css';
import { FiArrowLeft, FiTrash2, FiSave } from 'react-icons/fi';
import LessonBuilder from './LessonBuilder';
import ResourceBuilder from './ResourceBuilder';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useLocalStorage('courses');
  const [categories] = useLocalStorage('categories');
  const [users] = useLocalStorage('users');
  const [inscriptions] = useLocalStorage('inscriptions');
  
  const course = courses.find(c => c.id === id);

  const [activeTab, setActiveTab] = useState('info');

  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    categoryId: course?.categoryId || '',
    level: course?.level || 'Básico',
    duration: course?.duration || 0,
    thumbnail: course?.thumbnail || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!course) {
    return (
      <div className="admin-view-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Curso no encontrado</h2>
          <button className="auth-button" onClick={() => navigate('/admin/courses')}>Volver a Cursos</button>
        </div>
      </div>
    );
  }

  // Verificar si hay inscripciones activas
  const activeInscriptionsCount = inscriptions.filter(i => i.courseId === id && i.status === 'active').length;
  const canDelete = activeInscriptionsCount === 0;

  const handleDelete = () => {
    if (!canDelete) return;

    if (window.confirm(`¿Estás seguro de ELIMINAR el curso "${course.title}"? Esta acción es irreversible.`)) {
      setCourses(courses.filter(c => c.id !== id));
      navigate('/admin/courses');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Validate duration
    const duration = parseInt(formData.duration) || 0;
    
    const updatedCourses = courses.map(c => {
      if (c.id === id) {
        return {
          ...c,
          ...formData,
          duration
        };
      }
      return c;
    });

    setCourses(updatedCourses);
    alert('¡Cambios guardados exitosamente!');
  };

  const instructors = users.filter(u => u.role === 'instructor');

  return (
    <div className="admin-view-container">
      <div className="view-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="action-btn" onClick={() => navigate('/admin/courses')} style={{ background: 'rgba(255,255,255,0.1)' }}>
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h2>Editando: {course.title}</h2>
            <p>Configura la información general, lecciones y recursos.</p>
          </div>
        </div>
        
        {/* Botón Eliminar solo habilitado si no hay inscritos */}
        <button 
          className="auth-button" 
          onClick={handleDelete}
          disabled={!canDelete}
          style={{ 
            background: canDelete ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', 
            color: canDelete ? '#ef4444' : '#64748b',
            border: `1px solid ${canDelete ? '#ef4444' : 'transparent'}`,
            margin: 0,
            cursor: canDelete ? 'pointer' : 'not-allowed'
          }}
          title={!canDelete ? `No se puede eliminar: Hay ${activeInscriptionsCount} inscripciones activas` : 'Eliminar Curso'}
        >
          <FiTrash2 style={{ marginRight: '8px' }} /> Eliminar Curso
        </button>
      </div>
      
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Información General</button>
        <button className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}>Lecciones</button>
        <button className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>Recursos</button>
      </div>

      <div style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        {activeTab === 'info' && (
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Título del Curso</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="toolbar-input" style={{ width: '100%' }} />
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Descripción Corta</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required className="toolbar-input" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} />
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="toolbar-select" style={{ width: '100%', height: '42px' }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Nivel</label>
              <select name="level" value={formData.level} onChange={handleChange} className="toolbar-select" style={{ width: '100%', height: '42px' }}>
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duración (Horas)</label>
              <input type="number" min="1" name="duration" value={formData.duration} onChange={handleChange} required className="toolbar-input" style={{ width: '100%' }} />
            </div>
            <div className="form-group">
              <label>Instructor Asignado (No editable)</label>
              <select defaultValue={course.instructorId} disabled className="toolbar-select" style={{ width: '100%', height: '42px', opacity: 0.6 }}>
                {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.names} {inst.lastNames}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>URL de la Portada</label>
              <input type="url" name="thumbnail" value={formData.thumbnail} onChange={handleChange} className="toolbar-input" style={{ width: '100%' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" className="auth-button" style={{ margin: 0 }}>
                <FiSave style={{ marginRight: '8px' }} /> Guardar Cambios
              </button>
            </div>
          </form>
        )}

        {activeTab === 'lessons' && (
          <LessonBuilder 
            lessons={course.lessons || []} 
            onSave={(updatedLessons) => {
              const updatedCourses = courses.map(c => c.id === id ? { ...c, lessons: updatedLessons } : c);
              setCourses(updatedCourses);
            }} 
          />
        )}
        
        {activeTab === 'resources' && (
          <ResourceBuilder 
            resources={course.resources || []} 
            onSave={(updatedResources) => {
              const updatedCourses = courses.map(c => c.id === id ? { ...c, resources: updatedResources } : c);
              setCourses(updatedCourses);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
