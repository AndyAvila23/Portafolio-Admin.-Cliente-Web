import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { FiUsers, FiBookOpen, FiAward } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [users] = useLocalStorage('users');
  const [courses] = useLocalStorage('courses');
  const [inscriptions] = useLocalStorage('inscriptions');
  const [certificates] = useLocalStorage('certificates');
  
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Generar datos para gráfico de inscripciones basado en los datos reales (primer semestre)
  const chartData = [
    { name: 'Ene', inscripciones: 0 },
    { name: 'Feb', inscripciones: 0 },
    { name: 'Mar', inscripciones: 0 },
    { name: 'Abr', inscripciones: 0 },
    { name: 'May', inscripciones: 0 },
    { name: 'Jun', inscripciones: 0 },
    { name: 'Jul', inscripciones: 0 },
  ];

  inscriptions.forEach(insc => {
    const month = new Date(insc.enrolledAt || insc.date).getMonth();
    if (month >= 0 && month <= 6) {
      chartData[month].inscripciones += 1;
    }
  });

  // Datos reales para últimas inscripciones
  const recentInscriptions = inscriptions
    .sort((a, b) => new Date(b.enrolledAt || b.date) - new Date(a.enrolledAt || a.date))
    .slice(0, 5)
    .map(insc => {
      const student = users.find(u => u.id === insc.studentId);
      const course = courses.find(c => c.id === insc.courseId);
      return {
        id: insc.id,
        student: student ? `${student.names} ${student.lastNames}` : 'Estudiante Desconocido',
        course: course ? course.title : 'Curso Desconocido',
        date: insc.enrolledAt || insc.date,
        status: insc.status
      };
    });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('es-ES', options));
  }, []);

  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalCourses = courses.length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="greeting">
          <h2>{greeting}, {currentUser.names}</h2>
          <p>Aquí tienes un resumen de la actividad en ULCAP.</p>
        </div>
        <div className="date-display">
          {currentDate}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FiUsers />
          </div>
          <div className="stat-details">
            <h3>{totalStudents}</h3>
            <p>Estudiantes Totales</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <FiBookOpen />
          </div>
          <div className="stat-details">
            <h3>{totalCourses}</h3>
            <p>Cursos Activos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <FiAward />
          </div>
          <div className="stat-details">
            <h3>{certificates.length}</h3>
            <p>Certificados Emitidos</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Crecimiento de Inscripciones</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInsc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="inscripciones" stroke="#818cf8" fillOpacity={1} fill="url(#colorInsc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Últimas Inscripciones</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Curso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentInscriptions.map(insc => (
                  <tr key={insc.id}>
                    <td>{insc.student}</td>
                    <td style={{ color: '#94a3b8' }}>{insc.course}</td>
                    <td>
                      <span className={`badge ${insc.status}`}>
                        {insc.status === 'active' ? 'Activo' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
