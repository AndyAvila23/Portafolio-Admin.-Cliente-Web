import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiClock, FiBook, FiCheckCircle, FiUser, FiInfo } from 'react-icons/fi';
import Modal from '../../components/Modal';
import './StudentStyles.css';

const Home = () => {
  const [courses] = useLocalStorage('courses');
  const [categories] = useLocalStorage('categories');
  const [inscriptions, setInscriptions] = useLocalStorage('inscriptions');
  const [users] = useLocalStorage('users');
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Solo mostrar cursos activos
  const activeCourses = courses.filter(c => c.status === 'active');

  const processedCourses = useMemo(() => {
    let result = [...activeCourses];
    if (selectedCategory !== 'ALL') {
      result = result.filter(c => c.categoryId === selectedCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCourses, selectedCategory, searchTerm]);

  // Revisar si el estudiante ya está inscrito
  const getEnrollment = (courseId) => {
    return inscriptions.find(i => i.courseId === courseId && i.studentId === currentUser.id && i.status === 'active');
  };

  const handleEnroll = (courseId) => {
    const newInscription = {
      id: `ins${Date.now()}`,
      studentId: currentUser.id,
      courseId: courseId,
      status: 'active',
      enrolledAt: new Date().toISOString()
    };
    setInscriptions([...inscriptions, newInscription]);
    alert('¡Te has inscrito exitosamente!');
    setSelectedCourse(null);
    navigate(`/student/course/${courseId}`);
  };

  const handleAction = (course, isEnrolled) => {
    if (isEnrolled) {
      navigate(`/student/course/${course.id}`);
    } else {
      setSelectedCourse(course);
    }
  };

  const getInstructorName = (instructorId) => {
    const inst = users.find(u => u.id === instructorId);
    return inst ? `${inst.names} ${inst.lastNames}` : 'Desconocido';
  };

  return (
    <div className="student-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-content">
          <h1>Hola, {currentUser.names} 👋</h1>
          <p>¿Qué te gustaría aprender hoy? Explora nuestro catálogo de cursos.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="catalog-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por título o palabra clave..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-pills">
          <button 
            className={`pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              className={`pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="course-grid">
        {processedCourses.length > 0 ? processedCourses.map(course => {
          const isEnrolled = getEnrollment(course.id);
          const categoryName = categories.find(c => c.id === course.categoryId)?.name || 'General';

          return (
            <div key={course.id} className="course-card">
              <div className="course-img-wrapper">
                <img src={course.thumbnail} alt={course.title} className="course-img" />
                <span className="course-level-badge">{course.level}</span>
              </div>
              <div className="course-content">
                <span className="course-category">{categoryName}</span>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                
                <div className="course-meta">
                  <span><FiUser /> {getInstructorName(course.instructorId)}</span>
                  <span><FiClock /> {course.duration}h</span>
                  <span><FiBook /> {course.lessons?.length || 0} Lecc.</span>
                </div>

                <button 
                  className={`enroll-btn ${isEnrolled ? 'enrolled' : ''}`} 
                  onClick={() => handleAction(course, isEnrolled)}
                >
                  {isEnrolled ? (
                    <><FiCheckCircle style={{ marginRight: '8px' }} /> Ir al curso</>
                  ) : (
                    <><FiInfo style={{ marginRight: '8px' }} /> Ver Curso</>
                  )}
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="empty-state">
            <h3>No se encontraron cursos</h3>
            <p>Intenta con otros filtros de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Modal Detalles del Curso */}
      <Modal 
        isOpen={!!selectedCourse} 
        onClose={() => setSelectedCourse(null)} 
        title="Detalles del Curso"
      >
        {selectedCourse && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <img 
              src={selectedCourse.thumbnail} 
              alt={selectedCourse.title} 
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }} 
            />
            
            <div>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{selectedCourse.title}</h2>
              <span className="course-category" style={{ display: 'inline-block', marginBottom: '15px' }}>
                {categories.find(c => c.id === selectedCourse.categoryId)?.name || 'General'}
              </span>
              
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                {selectedCourse.description}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'rgba(15,23,42,0.4)', padding: '16px', borderRadius: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block' }}>Instructor</span>
                  <strong>{getInstructorName(selectedCourse.instructorId)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block' }}>Nivel</span>
                  <strong>{selectedCourse.level}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block' }}>Duración</span>
                  <strong>{selectedCourse.duration} horas</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block' }}>Lecciones</span>
                  <strong>{selectedCourse.lessons?.length || 0} lecciones</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button className="tab-btn" onClick={() => setSelectedCourse(null)}>Cancelar</button>
              <button 
                className="enroll-btn" 
                style={{ width: 'auto', padding: '10px 24px' }}
                onClick={() => handleEnroll(selectedCourse.id)}
              >
                Inscribirse Gratis
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
