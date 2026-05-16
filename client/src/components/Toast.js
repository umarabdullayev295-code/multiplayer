import React from 'react';
import { useGame } from '../context/GameContext';
import './Toast.css';

export default function Toast() {
  const { state } = useGame();

  if (!state.error) return null;

  return (
    <div className="toast-container">
      <div className="toast toast-error">
        <span className="toast-icon">⚠️</span>
        <span className="toast-message">{state.error}</span>
      </div>
    </div>
  );
}
