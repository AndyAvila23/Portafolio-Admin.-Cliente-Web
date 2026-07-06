import React, { useMemo, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';
import { FiAward, FiDownload } from 'react-icons/fi';
import CertificateViewer from './CertificateViewer';
import './StudentStyles.css';

const Certificates = () => {
  const [certificates] = useLocalStorage('certificates');
  const [courses] = useLocalStorage('courses');
  const { currentUser } = useAuth();
  
  const [selectedCert, setSelectedCert] = useState(null);

  const myCertificates = useMemo(() => {
    return certificates
      .filter(c => c.studentId === currentUser.id)
      .map(cert => {
        const course = courses.find(c => c.id === cert.courseId);
        return {
          ...cert,
          courseTitle: course ? course.title : 'Curso Desconocido',
          thumbnail: course ? course.thumbnail : ''
        };
      })
      .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
  }, [certificates, courses, currentUser.id]);

  return (
    <div className="student-container">
      <div className="welcome-banner" style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.15))', borderColor: 'rgba(234, 179, 8, 0.3)' }}>
        <h1 style={{ fontSize: '28px' }}>Mis Certificados</h1>
        <p>Aquí están todos los logros que has obtenido en ULCAP.</p>
      </div>

      <div className="course-grid">
        {myCertificates.length > 0 ? myCertificates.map(cert => (
          <div key={cert.id} className="course-card" style={{ border: '1px solid rgba(234, 179, 8, 0.4)' }}>
            <div className="course-img-wrapper" style={{ height: '140px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiAward size={60} color="#eab308" />
            </div>
            <div className="course-content" style={{ textAlign: 'center' }}>
              <span className="course-category" style={{ color: '#eab308' }}>Certificado de Finalización</span>
              <h3 className="course-title" style={{ fontSize: '18px', margin: '10px 0' }}>{cert.courseTitle}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 20px 0' }}>
                Emitido el: {new Date(cert.issueDate).toLocaleDateString()}
              </p>

              <button 
                className="enroll-btn" 
                style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)' }}
                onClick={() => setSelectedCert(cert)}
              >
                <FiDownload style={{ marginRight: '8px' }} /> Ver y Descargar
              </button>
            </div>
          </div>
        )) : (
          <div className="empty-state">
            <FiAward size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: '15px' }} />
            <h3>Aún no tienes certificados</h3>
            <p>Completa al 100% las lecciones de tus cursos para obtener tu primer certificado.</p>
          </div>
        )}
      </div>

      {selectedCert && (
        <CertificateViewer 
          certificateId={selectedCert.id} 
          onClose={() => setSelectedCert(null)} 
        />
      )}
    </div>
  );
};

export default Certificates;
