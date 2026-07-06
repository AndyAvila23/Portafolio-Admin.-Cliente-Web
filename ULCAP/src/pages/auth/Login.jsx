import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail } from 'react-icons/fi';
import '../../styles/Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaResolved, setCaptchaResolved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCaptcha = () => {
    // Simulamos resolver el captcha
    setTimeout(() => {
      setCaptchaResolved(true);
      setFailedAttempts(0);
      setError('');
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (failedAttempts >= 3 && !captchaResolved) {
      setError('Demasiados intentos fallidos. Por favor, resuelve el CAPTCHA.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const user = await login(formData.email, formData.password);
      
      // La redirección inicial ya ocurre en AppRoutes, pero forzamos por si acaso
      if (user.role === 'admin' || user.role === 'instructor') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } catch (err) {
      setError(err.message);
      setFailedAttempts(prev => prev + 1);
      setCaptchaResolved(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Bienvenido a ULCAP</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        {error && <div className="form-error" style={{ whiteSpace: 'pre-line' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Correo Electrónico</label>
            <div className="input-wrapper">
              <input 
                type="email" 
                name="email"
                placeholder="ejemplo@ulcap.com" 
                value={formData.email}
                onChange={handleChange}
                required
              />
              <FiMail className="input-icon" />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {showPassword ? 
                <FiEyeOff className="input-icon" onClick={() => setShowPassword(false)} /> : 
                <FiEye className="input-icon" onClick={() => setShowPassword(true)} />
              }
            </div>
          </div>

          <div className="auth-options">
            <label className="checkbox-group">
              <input 
                type="checkbox" 
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Recuérdame</span>
            </label>
            <button type="button" className="forgot-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>¿Olvidaste tu contraseña?</button>
          </div>

          {failedAttempts >= 3 && !captchaResolved && (
            <div className="captcha-mock">
              <p style={{ fontSize: '12px', margin: 0 }}>Comprobación de seguridad requerida</p>
              <button type="button" className="captcha-button" onClick={handleCaptcha}>
                No soy un robot (Resolver CAPTCHA)
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading || (failedAttempts >= 3 && !captchaResolved)}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tienes una cuenta? <Link to="/register">Regístrate como estudiante</Link>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => {
                window.localStorage.clear();
                window.location.reload();
              }}
              style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' }}
            >
              Restaurar Base de Datos (Dev)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
