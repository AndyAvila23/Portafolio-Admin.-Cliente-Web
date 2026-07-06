import React, { useMemo, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiPlayCircle, FiAward } from 'react-icons/fi';
import CertificateViewer from './CertificateViewer';
import './StudentStyles.css';

const MyCourses = () => {
  const [courses] = useLocalStorage('courses');
  const [inscriptions] = useLocalStorage('inscriptions');
  const [progressData] = useLocalStorage('progress');
  const [categories] = useLocalStorage('categories');
  const [certificates, setCertificates] = useLocalStorage('certificates');
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedCertId, setSelectedCertId] = useState(null);

  // Obtener las inscripciones del estudiante activo
  const myInscriptions = inscriptions.filter(i => i.studentId === currentUser.id && i.status === 'active');

  const myCoursesList = useMemo(() => {
    return myInscriptions.map(ins => {
      const course = courses.find(c => c.id === ins.courseId);
      if (!course) return null;

      const progress = progressData.find(p => p.studentId === currentUser.id && p.courseId === course.id);
      const completedCount = progress?.completedLessons?.length || 0;
      const totalLessons = course.lessons?.length || 1; // Evitar división por cero
      const percent = Math.round((completedCount / totalLessons) * 100);

      return {
        ...course,
        percent,
        completedCount,
        totalLessons
      };
    }).filter(Boolean);
  }, [myInscriptions, courses, progressData, currentUser.id]);

  const handleCertificateClick = (courseId) => {
    // Verificar si ya existe
    let cert = certificates.find(c => c.courseId === courseId && c.studentId === currentUser.id);
    
    if (!cert) {
      // Generar nuevo
      const newCert = {
        id: `cert-${Date.now()}`,
        studentId: currentUser.id,
        courseId: courseId,
        issueDate: new Date().toISOString(),
        certificateCode: `ULCAP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      };
      setCertificates([...certificates, newCert]);
      cert = newCert;
    }
    
    setSelectedCertId(cert.id);
  };

  return (
    <div className="student-container">
      <div className="welcome-banner" style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
        <h1 style={{ fontSize: '28px' }}>Mis Cursos</h1>
        <p>Continúa tu aprendizaje donde lo dejaste.</p>
      </div>

      <div className="course-grid">
        {myCoursesList.length > 0 ? myCoursesList.map(course => {
          const categoryName = categories.find(c => c.id === course.categoryId)?.name || 'General';
          
          return (
            <div key={course.id} className="course-card">
              <div className="course-img-wrapper" style={{ height: '120px' }}>
                <img src={course.thumbnail} alt={course.title} className="course-img" />
                {course.percent === 100 && (
                  <span className="course-level-badge" style={{ background: '#22c55e' }}><FiAward style={{ display: 'inline', marginBottom: '-2px' }}/> Completado</span>
                )}
              </div>
              <div className="course-content">
                <span className="course-category">{categoryName}</span>
                <h3 className="course-title" style={{ fontSize: '16px' }}>{course.title}</h3>
                
                {/* ProgressBar */}
                <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    <span>Progreso</span>
                    <span>{course.percent}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${course.percent}%`, height: '100%', background: course.percent === 100 ? '#22c55e' : 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px', textAlign: 'right' }}>
                    {course.completedCount} de {course.totalLessons} lecciones
                  </div>
                </div>

                {course.percent === 100 ? (
                  <button 
                    className="enroll-btn" 
                    style={{ marginTop: '15px', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)' }}
                    onClick={() => handleCertificateClick(course.id)}
                  >
                    <FiAward style={{ marginRight: '8px' }} /> Ver Certificado
                  </button>
                ) : (
                  <button 
                    className="enroll-btn" 
                    style={{ marginTop: '15px' }}
                    onClick={() => navigate(`/student/course/${course.id}`)}
                  >
                    <FiPlayCircle style={{ marginRight: '8px' }} /> {course.percent === 0 ? 'Comenzar' : 'Continuar'}
                  </button>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="empty-state">
            <h3>Aún no tienes cursos</h3>
            <p>Explora el catálogo para inscribirte en tu primer curso.</p>
            <button className="enroll-btn" style={{ maxWidth: '200px', margin: '20px auto 0' }} onClick={() => navigate('/student')}>
              Ir al Catálogo
            </button>
          </div>
        )}
      </div>

      {selectedCertId && (
        <CertificateViewer 
          certificateId={selectedCertId} 
          onClose={() => setSelectedCertId(null)} 
        />
      )}
    </div>
  );
};

export default MyCourses;
