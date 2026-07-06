import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiCreditCard, FiPhone } from 'react-icons/fi';
import '../../styles/Auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    names: '',
    lastNames: '',
    idCard: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Evaluador de fuerza de contraseña
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, color: 'transparent' };
    if (pass.length > 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 2) return { score, color: '#ef4444' }; // Rojo
    if (score <= 4) return { score, color: '#eab308' }; // Amarillo
    return { score, color: '#22c55e' }; // Verde
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Validaciones en tiempo real para cédula y teléfono (solo números)
    if ((name === 'idCard' || name === 'phone') && value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    // Límite de 10 caracteres para cédula y teléfono
    if ((name === 'idCard' || name === 'phone') && value.length > 10) {
      return;
    }

    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateForm = () => {
    if (formData.idCard.length !== 10) return "La cédula debe tener exactamente 10 dígitos.";
    if (formData.phone.length !== 10) return "El teléfono debe tener exactamente 10 dígitos.";
    if (formData.password !== formData.confirmPassword) return "Las contraseñas no coinciden.";
    if (!formData.terms) return "Debes aceptar los términos y condiciones.";
    if (strength.score < 3) return "La contraseña es muy débil (usa mayúsculas, números y al menos 7 caracteres).";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(formData);
      navigate('/student', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h1>Crea tu cuenta</h1>
          <p>Únete a ULCAP como estudiante</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombres</label>
              <div className="input-wrapper">
                <input type="text" name="names" placeholder="Tus nombres" value={formData.names} onChange={handleChange} required />
                <FiUser className="input-icon" />
              </div>
            </div>
            <div className="form-group">
              <label>Apellidos</label>
              <div className="input-wrapper">
                <input type="text" name="lastNames" placeholder="Tus apellidos" value={formData.lastNames} onChange={handleChange} required />
                <FiUser className="input-icon" />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cédula</label>
              <div className="input-wrapper">
                <input type="text" name="idCard" placeholder="10 dígitos" value={formData.idCard} onChange={handleChange} required />
                <FiCreditCard className="input-icon" />
              </div>
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <div className="input-wrapper">
                <input type="text" name="phone" placeholder="10 dígitos" value={formData.phone} onChange={handleChange} required />
                <FiPhone className="input-icon" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Correo Electrónico</label>
            <div className="input-wrapper">
              <input type="email" name="email" placeholder="ejemplo@ulcap.com" value={formData.email} onChange={handleChange} required />
              <FiMail className="input-icon" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {showPassword ? 
                  <FiEyeOff className="input-icon" onClick={() => setShowPassword(false)} /> : 
                  <FiEye className="input-icon" onClick={() => setShowPassword(true)} />
                }
              </div>
              <div className="strength-meter">
                <div 
                  className="strength-bar" 
                  style={{ width: `${(strength.score / 5) * 100}%`, backgroundColor: strength.color }}
                ></div>
              </div>
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <div className="input-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="confirmPassword"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <FiLock className="input-icon" />
              </div>
            </div>
          </div>

          <div className="auth-options" style={{ marginTop: '10px' }}>
            <label className="checkbox-group">
              <input 
                type="checkbox" 
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
              <span>Acepto los términos, condiciones y políticas de privacidad.</span>
            </label>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
