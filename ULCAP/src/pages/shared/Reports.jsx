import React, { useMemo, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';
import { FiDownload, FiPrinter, FiUsers, FiBook, FiAward, FiFilter, FiX } from 'react-icons/fi';
import { downloadCSV } from '../../utils/exportUtils';
import '../admin/AdminStyles.css';

const Reports = () => {
  const { currentUser } = useAuth();
  
  const [users] = useLocalStorage('users');
  const [courses] = useLocalStorage('courses');
  const [inscriptions] = useLocalStorage('inscriptions');
  const [certificates] = useLocalStorage('certificates');

  const [printData, setPrintData] = useState(null);
  const [printTitle, setPrintTitle] = useState('');

  // Estados para filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (mas recientes primero) o 'asc' (mas antiguos primero)

  // -------------------------------------------------------------
  // LÓGICA DE FILTRADO POR ROL
  // -------------------------------------------------------------
  // Admin ve todo
  // Instructor ve solo sus cursos, estudiantes de sus cursos y certificados de sus cursos
  // Estudiante ve solo sus propios cursos y certificados
  
  const myCourses = useMemo(() => {
    if (currentUser.role === 'admin') return courses;
    if (currentUser.role === 'instructor') return courses.filter(c => c.instructorId === currentUser.id);
    // Student: courses they are enrolled in
    if (currentUser.role === 'student') {
      const myInscriptions = inscriptions.filter(i => i.studentId === currentUser.id);
      return courses.filter(c => myInscriptions.some(i => i.courseId === c.id));
    }
    return [];
  }, [courses, currentUser, inscriptions]);

  const myCourseIds = myCourses.map(c => c.id);

  const myInscriptions = useMemo(() => {
    if (currentUser.role === 'admin') return inscriptions;
    if (currentUser.role === 'instructor') return inscriptions.filter(i => myCourseIds.includes(i.courseId));
    if (currentUser.role === 'student') return inscriptions.filter(i => i.studentId === currentUser.id);
    return [];
  }, [inscriptions, currentUser, myCourseIds]);

  const myCertificates = useMemo(() => {
    if (currentUser.role === 'admin') return certificates;
    if (currentUser.role === 'instructor') return certificates.filter(c => myCourseIds.includes(c.courseId));
    if (currentUser.role === 'student') return certificates.filter(c => c.studentId === currentUser.id);
    return [];
  }, [certificates, currentUser, myCourseIds]);

  // -------------------------------------------------------------
  // LÓGICA DE FILTRADO GLOBAL
  // -------------------------------------------------------------
  const applyFilters = (data, dateField) => {
    let filtered = [...data];

    // Filtrar por fechas si existen
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => new Date(item[dateField]) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item[dateField]) <= end);
    }

    // Ordenar
    filtered.sort((a, b) => {
      const dateA = new Date(a[dateField]);
      const dateB = new Date(b[dateField]);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  // -------------------------------------------------------------
  // GENERADORES DE DATOS
  // -------------------------------------------------------------

  const getInscriptionsReport = () => {
    const filteredInscriptions = applyFilters(myInscriptions, 'enrolledAt');
    return filteredInscriptions.map(ins => {
      const student = users.find(u => u.id === ins.studentId) || {};
      const course = courses.find(c => c.id === ins.courseId) || {};
      return {
        'ID Estudiante': student.id || 'N/A',
        'Nombres': student.names || 'N/A',
        'Apellidos': student.lastNames || 'N/A',
        'Correo': student.email || 'N/A',
        'Curso': course.title || 'N/A',
        'Fecha Inscripción': new Date(ins.enrolledAt).toLocaleDateString(),
        'Estado': ins.status
      };
    });
  };

  const getCertificatesReport = () => {
    const filteredCertificates = applyFilters(myCertificates, 'issueDate');
    return filteredCertificates.map(cert => {
      const student = users.find(u => u.id === cert.studentId) || {};
      const course = courses.find(c => c.id === cert.courseId) || {};
      return {
        'ID Certificado': cert.certificateCode,
        'Estudiante': `${student.names || ''} ${student.lastNames || ''}`.trim() || 'N/A',
        'Curso': course.title || 'N/A',
        'Fecha Emisión': new Date(cert.issueDate).toLocaleDateString()
      };
    });
  };

  const getCoursesReport = () => {
    const filteredCourses = applyFilters(myCourses, 'createdAt');
    return filteredCourses.map(course => {
      const instructor = users.find(u => u.id === course.instructorId) || {};
      const enrolledCount = inscriptions.filter(i => i.courseId === course.id && i.status === 'active').length;
      return {
        'ID Curso': course.id,
        'Título': course.title,
        'Nivel': course.level,
        'Duración (hrs)': course.duration,
        'Instructor': `${instructor.names || ''} ${instructor.lastNames || ''}`.trim() || 'N/A',
        'Inscritos Activos': enrolledCount,
        'Fecha Creación': new Date(course.createdAt).toLocaleDateString(),
        'Estado': course.status
      };
    });
  };

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  
  const handleExportCSV = (type) => {
    let data = [];
    let filename = '';
    
    if (type === 'inscriptions') {
      data = getInscriptionsReport();
      filename = `reporte-inscripciones-${new Date().toISOString().split('T')[0]}`;
    } else if (type === 'certificates') {
      data = getCertificatesReport();
      filename = `reporte-certificados-${new Date().toISOString().split('T')[0]}`;
    } else if (type === 'courses') {
      data = getCoursesReport();
      filename = `reporte-cursos-${new Date().toISOString().split('T')[0]}`;
    }

    downloadCSV(data, filename);
  };

  const handlePrint = (type) => {
    let data = [];
    let title = '';

    if (type === 'inscriptions') {
      data = getInscriptionsReport();
      title = 'Reporte de Inscripciones y Estudiantes';
    } else if (type === 'certificates') {
      data = getCertificatesReport();
      title = 'Reporte de Certificados Emitidos';
    } else if (type === 'courses') {
      data = getCoursesReport();
      title = 'Reporte del Catálogo de Cursos';
    }

    setPrintTitle(title);
    setPrintData(data);
    
    // Necesitamos esperar al renderizado de la tabla para imprimir
    setTimeout(() => {
      window.print();
      setPrintData(null); // Limpiar después de imprimir
    }, 100);
  };

  // -------------------------------------------------------------
  // PESTAÑAS Y TABLA ACTIVA
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState('inscriptions');

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSortOrder('desc');
  };

  // Obtener los datos actuales según la pestaña activa
  const currentReportData = useMemo(() => {
    const applyFiltersLocal = (data, dateField) => {
      let filtered = [...data];
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filtered = filtered.filter(item => new Date(item[dateField]) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(item => new Date(item[dateField]) <= end);
      }
      filtered.sort((a, b) => {
        const dateA = new Date(a[dateField]);
        const dateB = new Date(b[dateField]);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
      return filtered;
    };

    if (activeTab === 'inscriptions') {
      return applyFiltersLocal(myInscriptions, 'enrolledAt').map(ins => {
        const student = users.find(u => u.id === ins.studentId) || {};
        const course = courses.find(c => c.id === ins.courseId) || {};
        return {
          'ID Estudiante': student.id || 'N/A',
          'Nombres': student.names || 'N/A',
          'Apellidos': student.lastNames || 'N/A',
          'Correo': student.email || 'N/A',
          'Curso': course.title || 'N/A',
          'Fecha Inscripción': new Date(ins.enrolledAt).toLocaleDateString(),
          'Estado': ins.status
        };
      });
    }
    if (activeTab === 'certificates') {
      return applyFiltersLocal(myCertificates, 'issueDate').map(cert => {
        const student = users.find(u => u.id === cert.studentId) || {};
        const course = courses.find(c => c.id === cert.courseId) || {};
        return {
          'ID Certificado': cert.certificateCode,
          'Estudiante': `${student.names || ''} ${student.lastNames || ''}`.trim() || 'N/A',
          'Curso': course.title || 'N/A',
          'Fecha Emisión': new Date(cert.issueDate).toLocaleDateString()
        };
      });
    }
    if (activeTab === 'courses') {
      return applyFiltersLocal(myCourses, 'createdAt').map(course => {
        const instructor = users.find(u => u.id === course.instructorId) || {};
        const enrolledCount = inscriptions.filter(i => i.courseId === course.id && i.status === 'active').length;
        return {
          'ID Curso': course.id,
          'Título': course.title,
          'Nivel': course.level,
          'Duración (hrs)': course.duration,
          'Instructor': `${instructor.names || ''} ${instructor.lastNames || ''}`.trim() || 'N/A',
          'Inscritos Activos': enrolledCount,
          'Fecha Creación': new Date(course.createdAt).toLocaleDateString(),
          'Estado': course.status
        };
      });
    }
    return [];
  }, [activeTab, myInscriptions, myCertificates, myCourses, startDate, endDate, sortOrder, users, courses, inscriptions]);

  return (
    <>
      <div className="admin-view-container hide-on-print">
        <div className="view-header">
          <div>
            <h2>Centro de Reportes</h2>
            <p>Exporta y visualiza la información clave de la plataforma.</p>
          </div>
        </div>

        {/* Pestañas (Tabs) */}
        <div className="admin-tabs" style={{ marginBottom: '20px' }}>
          <button 
            className={`tab-btn ${activeTab === 'inscriptions' ? 'active' : ''}`} 
            onClick={() => setActiveTab('inscriptions')}
          >
            <FiUsers /> Inscripciones
          </button>
          <button 
            className={`tab-btn ${activeTab === 'certificates' ? 'active' : ''}`} 
            onClick={() => setActiveTab('certificates')}
          >
            <FiAward /> Certificados Emitidos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} 
            onClick={() => setActiveTab('courses')}
          >
            <FiBook /> Resumen de Cursos
          </button>
        </div>

        {/* Barra de Filtros y Acciones */}
        <div className="toolbar" style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Lado izquierdo: Filtros */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiFilter color="var(--text-muted)" />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Filtros de Fecha:</span>
            </div>
            
            <input 
              type="date" 
              className="toolbar-input" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Fecha Desde"
            />
            <span style={{ color: 'var(--text-muted)' }}>-</span>
            <input 
              type="date" 
              className="toolbar-input" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Fecha Hasta"
            />

            <select 
              className="toolbar-input" 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Más recientes primero</option>
              <option value="asc">Más antiguos primero</option>
            </select>

            {(startDate || endDate || sortOrder !== 'desc') && (
              <button className="tab-btn" onClick={clearFilters} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FiX /> Limpiar
              </button>
            )}
          </div>

          {/* Lado derecho: Botones de Exportación */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="enroll-btn" 
              onClick={() => handleExportCSV(activeTab)} 
              style={{ width: 'auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
              disabled={currentReportData.length === 0}
            >
              <FiDownload /> Exportar CSV
            </button>
            <button 
              className="tab-btn" 
              onClick={() => handlePrint(activeTab)} 
              style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
              disabled={currentReportData.length === 0}
            >
              <FiPrinter /> Imprimir PDF
            </button>
          </div>
        </div>

        {/* Contenedor de la Tabla */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {currentReportData.length > 0 ? Object.keys(currentReportData[0]).map(key => (
                  <th key={key}>{key}</th>
                )) : <th>Datos</th>}
              </tr>
            </thead>
            <tbody>
              {currentReportData.length > 0 ? currentReportData.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                </tr>
              )) : (
                <tr>
                  <td colSpan="100%" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No se encontraron registros para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'right' }}>
          Mostrando {currentReportData.length} registros.
        </div>
      </div>

      {/* -------------------------------------------------------------
          VISTA EXCLUSIVA PARA IMPRESIÓN (PDF)
      ------------------------------------------------------------- */}
      {printData && (
        <div className="print-only-container">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>ULCAP</h1>
            <h2 style={{ margin: '0', color: '#334155' }}>{printTitle}</h2>
            <p style={{ margin: '5px 0', color: '#64748b' }}>Fecha de generación: {new Date().toLocaleDateString()}</p>
            <p style={{ margin: '5px 0', color: '#64748b' }}>Generado por: {currentUser.names} {currentUser.lastNames} ({currentUser.role})</p>
          </div>
          
          <table className="print-table">
            <thead>
              <tr>
                {Object.keys(printData[0] || {}).map(key => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {printData.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default Reports;
