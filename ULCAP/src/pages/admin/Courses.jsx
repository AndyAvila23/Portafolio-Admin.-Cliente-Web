import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import { FiEdit2, FiPlus, FiPower, FiBookOpen, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './AdminStyles.css';

const Courses = () => {
  const [courses, setCourses] = useLocalStorage('courses');
  const [users] = useLocalStorage('users');
  const [categories] = useLocalStorage('categories');
  const [inscriptions] = useLocalStorage('inscriptions');
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', categoryId: '', level: 'Básico', 
    duration: '', instructorId: currentUser.role === 'instructor' ? currentUser.id : '', thumbnail: ''
  });

  // Filtros y Ordenamiento
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Filtrar los cursos que el usuario tiene permitido ver (Admin ve todos, Instructor los suyos)
  const allowedCourses = currentUser.role === 'admin' 
    ? courses 
    : courses.filter(c => c.instructorId === currentUser.id);

  // Stats
  const totalCourses = allowedCourses.length;
  const activeCourses = allowedCourses.filter(c => c.status === 'active').length;
  const inactiveCourses = allowedCourses.filter(c => c.status === 'inactive').length;

  // Lógica combinada para Filtros, Búsqueda y Ordenamiento
  const processedCourses = useMemo(() => {
    let result = [...allowedCourses];

    // Filtro por Estado
    if (filterStatus !== 'ALL') {
      result = result.filter(c => c.status === filterStatus);
    }

    // Filtro por Categoría
    if (filterCategory !== 'ALL') {
      result = result.filter(c => c.categoryId === filterCategory);
    }

    // Búsqueda (Título, categoría nombre, nivel, instructor nombre)
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(c => {
        const cat = categories.find(cat => cat.id === c.categoryId)?.name || '';
        const inst = users.find(u => u.id === c.instructorId);
        const instName = inst ? `${inst.names} ${inst.lastNames}`.toLowerCase() : '';
        
        return c.title.toLowerCase().includes(lowerSearch) || 
               cat.toLowerCase().includes(lowerSearch) ||
               c.level.toLowerCase().includes(lowerSearch) ||
               instName.includes(lowerSearch);
      });
    }

    // Ordenamiento
    result.sort((a, b) => {
      const getInscriptions = (courseId) => inscriptions.filter(i => i.courseId === courseId && i.status === 'active').length;
      
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'az': return a.title.localeCompare(b.title);
        case 'za': return b.title.localeCompare(a.title);
        case 'most_enrolled': return getInscriptions(b.id) - getInscriptions(a.id);
        case 'most_hours': return (b.duration || 0) - (a.duration || 0);
        case 'most_lessons': return (b.lessons?.length || 0) - (a.lessons?.length || 0);
        default: return 0;
      }
    });

    return result;
  }, [allowedCourses, filterStatus, filterCategory, searchTerm, sortBy, categories, users, inscriptions]);


  const handleToggleStatus = (id) => {
    setCourses(courses.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'active' ? 'inactive' : 'active' };
      }
      return c;
    }));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const newCourse = {
      id: `c${Date.now()}`,
      title: formData.title,
      description: formData.description,
      categoryId: formData.categoryId,
      level: formData.level,
      duration: parseInt(formData.duration) || 0,
      instructorId: formData.instructorId,
      status: 'active',
      studentsEnrolled: 0,
      createdAt: new Date().toISOString(),
      thumbnail: formData.thumbnail || 'https://via.placeholder.com/800x400?text=Nuevo+Curso',
      lessons: []
    };
    
    setCourses([...courses, newCourse]);
    setIsModalOpen(false);
    setFormData({ title: '', description: '', categoryId: '', level: 'Básico', duration: '', instructorId: currentUser.role === 'instructor' ? currentUser.id : '', thumbnail: '' });
  };

  const instructors = users.filter(u => u.role === 'instructor');

  return (
    <div className="admin-view-container">
      {/* HEADER & STATS */}
      <div className="view-header">
        <div>
          <h2>Gestión de Cursos</h2>
          <p>Administra los cursos, filtra y crea nuevo contenido.</p>
        </div>
        <button className="auth-button" style={{ margin: 0 }} onClick={() => setIsModalOpen(true)}>
          <FiPlus style={{ marginRight: '8px' }} /> Agregar Curso
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '10px' }}>
        <div className="stat-card" style={{ padding: '15px' }}>
          <div className="stat-icon primary" style={{ width: '40px', height: '40px', fontSize: '18px' }}><FiBookOpen /></div>
          <div className="stat-details">
            <h3 style={{ fontSize: '20px' }}>{totalCourses}</h3><p>Total de Cursos</p>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '15px' }}>
          <div className="stat-icon success" style={{ width: '40px', height: '40px', fontSize: '18px' }}><FiCheckCircle /></div>
          <div className="stat-details">
            <h3 style={{ fontSize: '20px' }}>{activeCourses}</h3><p>Cursos Activos</p>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '15px' }}>
          <div className="stat-icon warning" style={{ width: '40px', height: '40px', fontSize: '18px' }}><FiXCircle /></div>
          <div className="stat-details">
            <h3 style={{ fontSize: '20px' }}>{inactiveCourses}</h3><p>Cursos Inactivos</p>
          </div>
        </div>
      </div>

      {/* TOOLBAR AVANZADO */}
      <div className="advanced-toolbar">
        <input 
          type="text" 
          placeholder="Buscar cursos..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="toolbar-input"
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="toolbar-select">
          <option value="ALL">Todas las Categorías</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="toolbar-select">
          <option value="ALL">Todos los Estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="toolbar-select">
          <option value="newest">Más recientes</option>
          <option value="az">Título A-Z</option>
          <option value="za">Título Z-A</option>
          <option value="most_enrolled">Más inscritos</option>
          <option value="most_hours">Más horas</option>
          <option value="most_lessons">Más lecciones</option>
        </select>
      </div>

      {/* CUSTOM TABLE */}
      <div className="datatable-container">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Portada</th>
                <th>Información Principal</th>
                <th>Instructor</th>
                <th>Duración / Lecciones</th>
                <th>Inscritos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {processedCourses.length > 0 ? processedCourses.map(course => {
                const cat = categories.find(c => c.id === course.categoryId)?.name || 'Sin Categoría';
                const inst = users.find(u => u.id === course.instructorId);
                const instName = inst ? `${inst.names} ${inst.lastNames}` : 'Desconocido';
                const enrolled = inscriptions.filter(i => i.courseId === course.id && i.status === 'active').length;
                const lessonsCount = course.lessons?.length || 0;

                return (
                  <tr key={course.id}>
                    <td>
                      <img src={course.thumbnail} alt={course.title} style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{course.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat} • Nivel {course.level}</div>
                    </td>
                    <td>{instName}</td>
                    <td>{course.duration}h / {lessonsCount} lecc.</td>
                    <td>{enrolled}</td>
                    <td>
                      <span className={`badge ${course.status === 'active' ? 'active' : 'pending'}`}>
                        {course.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit" onClick={() => navigate(`/admin/courses/${course.id}`)} title="Editar Curso">
                          <FiEdit2 />
                        </button>
                        <button 
                          className={`action-btn ${course.status === 'active' ? 'delete' : 'edit'}`} 
                          onClick={() => handleToggleStatus(course.id)} 
                          title={course.status === 'active' ? 'Inactivar Curso' : 'Activar Curso'}
                        >
                          <FiPower />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="7" className="no-data">No se encontraron cursos con estos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREACION */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Nuevo Curso">
        <form onSubmit={handleCreate} className="auth-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Título del Curso</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="toolbar-input" style={{ width: '100%' }} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Descripción Corta</label>
            <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="toolbar-input" style={{ width: '100%' }} />
          </div>
          
          <div className="form-group">
            <label>Categoría</label>
            <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required className="toolbar-select" style={{ width: '100%', height: '42px' }}>
              <option value="">Seleccione Categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Nivel</label>
            <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="toolbar-select" style={{ width: '100%', height: '42px' }}>
              <option value="Básico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Duración (Horas)</label>
            <input type="number" min="1" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required className="toolbar-input" style={{ width: '100%' }} />
          </div>
          <div className="form-group">
            <label>Instructor Asignado</label>
            <select 
              value={formData.instructorId} 
              onChange={e => setFormData({...formData, instructorId: e.target.value})} 
              required 
              className="toolbar-select" 
              style={{ width: '100%', height: '42px' }}
              disabled={currentUser.role === 'instructor'} // Instructores solo pueden asignarse a sí mismos
            >
              <option value="">Seleccione Instructor</option>
              {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.names} {inst.lastNames}</option>)}
            </select>
          </div>
          
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>URL de la Portada (Imagen)</label>
            <input type="url" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} placeholder="https://ejemplo.com/imagen.jpg" className="toolbar-input" style={{ width: '100%' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Para subir archivo directo, esto se implementará a futuro. Por ahora provee una URL.</span>
          </div>

          <button type="submit" className="auth-button" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
            Crear Curso
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Courses;
