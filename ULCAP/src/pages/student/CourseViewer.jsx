import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';
import { FiArrowLeft, FiCheckCircle, FiCircle, FiPlay, FiAward } from 'react-icons/fi';

const CourseViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [courses] = useLocalStorage('courses');
  const [progressData, setProgressData] = useLocalStorage('progress');
  const [inscriptions] = useLocalStorage('inscriptions');

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  const course = courses.find(c => c.id === id);
  const isEnrolled = inscriptions.some(i => i.studentId === currentUser.id && i.courseId === id && i.status === 'active');
  const studentProgress = progressData.find(p => p.studentId === currentUser.id && p.courseId === id);
  const completedLessons = studentProgress?.completedLessons || [];

  // Seguridad: si no existe el curso o no está inscrito
  useEffect(() => {
    if (!course || !isEnrolled) {
      navigate('/student');
    }
  }, [course, isEnrolled, navigate]);

  if (!course || !isEnrolled) return null;

  const lessons = course.lessons || [];
  const activeLesson = lessons[activeLessonIndex];

  const handleToggleComplete = (lessonId) => {
    let newCompleted;
    if (completedLessons.includes(lessonId)) {
      newCompleted = completedLessons.filter(lId => lId !== lessonId);
    } else {
      newCompleted = [...completedLessons, lessonId];
    }

    // Actualizar progress.json
    const otherProgress = progressData.filter(p => !(p.studentId === currentUser.id && p.courseId === id));
    
    if (newCompleted.length > 0) {
      setProgressData([...otherProgress, { id: studentProgress?.id || `p${Date.now()}`, studentId: currentUser.id, courseId: id, completedLessons: newCompleted }]);
    } else {
      // Si ya no tiene completadas, lo quitamos o dejamos vacío (mejor dejarlo vacío por si acaso)
      setProgressData([...otherProgress, { id: studentProgress?.id || `p${Date.now()}`, studentId: currentUser.id, courseId: id, completedLessons: [] }]);
    }
  };

  const progressPercent = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-color)', overflow: 'hidden' }}>
      
      {/* Contenido Principal (Video / Reading) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Inmersivo */}
        <div style={{ padding: '15px 30px', background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => navigate('/student/my-courses')} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
              <FiArrowLeft /> Volver
            </button>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{course.title}</h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Progreso: {progressPercent}%</div>
            <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: progressPercent === 100 ? '#22c55e' : 'var(--primary-color)', transition: 'width 0.3s' }}></div>
            </div>
            {progressPercent === 100 && <FiAward color="#22c55e" size={20} title="Curso Completado" />}
          </div>
        </div>

        {/* Visor */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {activeLesson ? (
            <div style={{ width: '100%', maxWidth: '900px' }}>
              {/* Fake Video Player */}
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <FiPlay size={64} color="rgba(255,255,255,0.3)" />
                <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}></div>
              </div>
              
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>{activeLesson.title}</h1>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{activeLesson.content || 'No hay descripción detallada para esta lección.'}</p>
                </div>
                <button 
                  onClick={() => handleToggleComplete(activeLesson.id)}
                  style={{ 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    background: completedLessons.includes(activeLesson.id) ? 'rgba(34, 197, 94, 0.1)' : 'var(--primary-color)', 
                    color: completedLessons.includes(activeLesson.id) ? '#4ade80' : '#fff',
                    border: completedLessons.includes(activeLesson.id) ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {completedLessons.includes(activeLesson.id) ? <><FiCheckCircle /> Completada</> : <><FiCircle /> Marcar como Completada</>}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '100px' }}>
              <h3>Este curso aún no tiene lecciones</h3>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar de Lecciones */}
      <div style={{ width: '350px', background: 'var(--card-bg)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Contenido del Curso</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{completedLessons.length} / {lessons.length} completadas</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {lessons.map((lesson, idx) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isActive = activeLessonIndex === idx;
            return (
              <div 
                key={lesson.id}
                onClick={() => setActiveLessonIndex(idx)}
                style={{ 
                  padding: '16px 20px', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  background: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ color: isCompleted ? '#22c55e' : (isActive ? '#818cf8' : 'var(--text-muted)'), marginTop: '2px' }}>
                  {isCompleted ? <FiCheckCircle /> : (isActive ? <FiPlay /> : <FiCircle />)}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text-main)' : 'var(--text-main)' }}>
                    {idx + 1}. {lesson.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {lesson.duration} min
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
