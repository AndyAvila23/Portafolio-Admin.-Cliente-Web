import React, { useState } from 'react';
import Modal from '../../../components/Modal';

const BlockModal = ({ isOpen, onClose, user, onConfirm, type = 'block' }) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('24h');

  const isBlock = type === 'block'; // block = estudiantes (con tiempo), disable = admin/instructor (sin tiempo)

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) { alert('Debes indicar un motivo'); return; }

    let blockUntil = '';
    if (isBlock) {
      const now = new Date();
      switch (duration) {
        case '24h': blockUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); break;
        case '3d': blockUntil = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(); break;
        case '7d': blockUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); break;
        case '30d': blockUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); break;
        case 'indef': blockUntil = 'indefinido'; break;
        default: blockUntil = 'indefinido';
      }
    }

    onConfirm(reason, blockUntil);
    setReason('');
    setDuration('24h');
  };

  if (!user) return null;

  const title = isBlock 
    ? `Bloquear a ${user.names} ${user.lastNames}` 
    : `Deshabilitar a ${user.names} ${user.lastNames}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#fca5a5' }}>
            {isBlock 
              ? 'El estudiante no podrá iniciar sesión durante el período seleccionado. Se le mostrará el motivo del bloqueo.'
              : 'El usuario no podrá iniciar sesión. Se le mostrará el motivo de la deshabilitación.'}
          </p>
        </div>

        <div className="form-group">
          <label>Motivo</label>
          <textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            required 
            className="toolbar-input" 
            style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} 
            placeholder="Ej: Comportamiento inadecuado en foros..."
          />
        </div>

        {isBlock && (
          <div className="form-group">
            <label>Duración del bloqueo</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="toolbar-select" style={{ width: '100%', height: '42px' }}>
              <option value="24h">24 horas</option>
              <option value="3d">3 días</option>
              <option value="7d">1 semana</option>
              <option value="30d">30 días</option>
              <option value="indef">Indefinido</option>
            </select>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '5px' }}>
          <button type="button" onClick={onClose} className="tab-btn">Cancelar</button>
          <button type="submit" className="auth-button" style={{ margin: 0, background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
            {isBlock ? 'Bloquear' : 'Deshabilitar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BlockModal;
