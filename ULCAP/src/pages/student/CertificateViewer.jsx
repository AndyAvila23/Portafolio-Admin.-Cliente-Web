import React, { useRef } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { FiDownload } from 'react-icons/fi';
import './CertificateViewer.css';

const CertificateViewer = ({ certificateId, onClose }) => {
  const [certificates] = useLocalStorage('certificates');
  const [courses] = useLocalStorage('courses');
  const [users] = useLocalStorage('users');
  const { currentUser } = useAuth();
  const printRef = useRef();

  const certificate = certificates.find(c => c.id === certificateId);
  if (!certificate) return null;

  const course = courses.find(c => c.id === certificate.courseId);
  const instructor = users.find(u => u.id === course?.instructorId);

  const handlePrint = () => {
    // Para imprimir solo el certificado y no el resto de la página,
    // usamos CSS print rules en CertificateViewer.css
    window.print();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Tu Certificado" maxWidth="900px">
      <div className="cert-viewer-actions">
        <p className="cert-hint">Consejo: Al hacer clic en Descargar, selecciona "Guardar como PDF" en las opciones de impresión.</p>
        <button className="enroll-btn print-btn" onClick={handlePrint} style={{ width: 'auto', padding: '10px 20px', display: 'flex', gap: '8px' }}>
          <FiDownload /> Descargar / Imprimir
        </button>
      </div>

      {/* Contenedor imprimible */}
      <div className="printable-certificate-wrapper" ref={printRef}>
        <div className="diploma-container">
          <div className="diploma-border">
            <div className="diploma-content">
              
              <div className="diploma-header">
                <div className="diploma-logo">ULCAP</div>
                <h1 className="diploma-title">Certificado de Finalización</h1>
              </div>

              <div className="diploma-body">
                <p className="diploma-text">Se otorga el presente certificado a:</p>
                <h2 className="diploma-student-name">{currentUser.names} {currentUser.lastNames}</h2>
                <p className="diploma-text">Por haber completado exitosamente el curso:</p>
                <h3 className="diploma-course-name">{course?.title || 'Curso'}</h3>
                <p className="diploma-duration">Con una duración total de {course?.duration || 0} horas académicas.</p>
              </div>

              <div className="diploma-footer">
                <div className="diploma-signature">
                  <div className="signature-line">
                    <span className="signature-font">{instructor?.names} {instructor?.lastNames}</span>
                  </div>
                  <p>Instructor del Curso</p>
                </div>
                
                <div className="diploma-seal">
                  <div className="seal-inner">
                    <span>SELLO ULCAP</span>
                  </div>
                </div>

                <div className="diploma-date-code">
                  <p><strong>Fecha de Emisión:</strong> {new Date(certificate.issueDate).toLocaleDateString()}</p>
                  <p><strong>ID de Verificación:</strong> {certificate.certificateCode}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CertificateViewer;
