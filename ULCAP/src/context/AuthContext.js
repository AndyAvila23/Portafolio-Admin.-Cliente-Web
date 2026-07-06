import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useLocalStorage('users');
  const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulando una carga inicial
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          // Verificar si está inactivo/bloqueado
          if (user.status !== 'active') {
            const reason = user.blockReason || 'No se proporcionó motivo.';
            
            // Para estudiantes: verificar bloqueo temporal
            if (user.role === 'student' && user.blockUntil && user.blockUntil !== 'indefinido') {
              const blockEnd = new Date(user.blockUntil);
              const now = new Date();
              
              if (now >= blockEnd) {
                // El bloqueo expiró, desbloquear automáticamente
                const updatedUsers = users.map(u => {
                  if (u.id === user.id) return { ...u, status: 'active', blockReason: '', blockUntil: '' };
                  return u;
                });
                setUsers(updatedUsers);
                const unlockedUser = { ...user, status: 'active', blockReason: '', blockUntil: '' };
                setCurrentUser(unlockedUser);
                resolve(unlockedUser);
                return;
              } else {
                // Bloqueo activo: calcular tiempo restante
                const diffMs = blockEnd - now;
                const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
                const timeMsg = diffHours > 24 
                  ? `${Math.ceil(diffHours / 24)} día(s)` 
                  : `${diffHours} hora(s)`;
                reject(new Error(`Tu cuenta ha sido bloqueada.\nMotivo: ${reason}\nSe desbloqueará en: ${timeMsg}`));
                return;
              }
            }
            
            // Admin/Instructor deshabilitado o bloqueo indefinido
            reject(new Error(`Tu cuenta ha sido ${user.role === 'student' ? 'bloqueada' : 'deshabilitada'}.\nMotivo: ${reason}`));
            return;
          }
          
          setCurrentUser(user);
          resolve(user);
        } else {
          reject(new Error('Credenciales incorrectas.'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const exists = users.find(u => u.email === userData.email);
        if (exists) {
          reject(new Error('El correo ya está registrado.'));
          return;
        }

        const newUser = {
          ...userData,
          id: `STU-${Date.now()}`,
          role: 'student', // Por defecto los registros públicos son estudiantes
          status: 'active',
          createdAt: new Date().toISOString()
        };

        setUsers([...users, newUser]);
        setCurrentUser(newUser);
        resolve(newUser);
      }, 1000);
    });
  };

  const updateProfile = (updatedUser) => {
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(newUsers);
    setCurrentUser(updatedUser);
  };

  const value = {
    currentUser,
    users,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!currentUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
