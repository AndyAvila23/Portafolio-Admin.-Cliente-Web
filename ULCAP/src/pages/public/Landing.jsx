import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';
import { FiClock, FiBook, FiUser } from 'react-icons/fi';
import Modal from '../../components/Modal';
import './Landing.css';

const PublicLanding = () => {
  const [courses] = useLocalStorage('courses');
  const [categories] = useLocalStorage('categories');
  const [users] = useLocalStorage('users');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedCourse, setSelectedCourse] = useState(null);

  // Solo mostrar cursos activos al público
  const activeCourses = courses.filter(c => c.status === 'active');

  const getInstructorName = (instructorId) => {
    const inst = users.find(u => u.id === instructorId);
    return inst ? `${inst.names} ${inst.lastNames}` : 'Instructor ULCAP';
  };

  const handleAction = (course) => {
    setSelectedCourse(course);
  };

  return (
    <div className="landing-page">
      <nav className="landing-navbar">
        <div className="landing-logo">ULCAP</div>
        <div className="landing-nav-actions">
          {currentUser ? (
            <Link 
              to={currentUser.role === 'student' ? '/student' : '/admin'} 
              className="landing-btn-primary"
            >
              Ir a mi panel
            </Link>
          ) : (
            <>
              <Link to="/login" className="landing-btn-outline">Iniciar Sesión</Link>
              <Link to="/register" className="landing-btn-primary">Regístrate Gratis</Link>
            </>
          )}
        </div>
      </nav>

      <header className="landing-hero">
        <h1>Transforma tu futuro a tu propio ritmo</h1>
        <p>Descubre decenas de cursos especializados y mejora tus habilidades profesionales con instructores expertos. Únete a la comunidad de ULCAP hoy mismo.</p>
        {!currentUser && (
          <Link to="/register" className="landing-btn-primary" style={{ padding: '15px 30px', fontSize: '18px' }}>
            Comenzar a Aprender
          </Link>
        )}
      </header>

      <section className="landing-catalog">
        <h2 className="landing-catalog-title">Explora nuestro Catálogo</h2>
        
        <div className="public-course-grid">
          {activeCourses.length > 0 ? activeCourses.map(course => {
            const categoryName = categories.find(c => c.id === course.categoryId)?.name || 'General';
            return (
              <div key={course.id} className="public-course-card">
                <img src={course.thumbnail} alt={course.title} className="public-course-img" />
                <div className="public-course-content">
                  <span className="public-course-category">{categoryName}</span>
                  <h3 className="public-course-title">{course.title}</h3>
                  <p className="public-course-desc">{course.description}</p>
                  
                  <div className="public-course-meta">
                    <span><FiUser /> {getInstructorName(course.instructorId)}</span>
                    <span><FiClock /> {course.duration}h</span>
                  </div>

                  <button className="public-enroll-btn" onClick={() => handleAction(course)}>
                    Ver Curso
                  </button>
                </div>
              </div>
            );
          }) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <h3>Aún no hay cursos disponibles</h3>
              <p>Vuelve más tarde para ver el catálogo actualizado.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} ULCAP E-Learning Platform. Todos los derechos reservados.</p>
      </footer>

      {/* Modal para usuarios que no están logueados intentando ver un curso */}
      <Modal isOpen={!!selectedCourse} onClose={() => setSelectedCourse(null)} title={selectedCourse?.title}>
        {selectedCourse && (
          <div className="modal-auth-prompt">
            <h2>¡Estás a un paso de aprender!</h2>
            <p>
              Para acceder al contenido del curso <strong>"{selectedCourse.title}"</strong>, 
              necesitas tener una cuenta en ULCAP. ¡El registro es completamente gratis y rápido!
            </p>
            <div className="modal-auth-buttons">
              <button className="landing-btn-outline" onClick={() => navigate('/login')}>
                Ya tengo cuenta
              </button>
              <button className="landing-btn-primary" onClick={() => navigate('/register')}>
                Crear mi cuenta gratis
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PublicLanding;
