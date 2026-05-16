import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useGame } from '../context/GameContext';
import './HomeScreen.css';

export default function HomeScreen() {
  const [mode, setMode] = useState(null); // 'solo' | 'create' | 'join'
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [settings, setSettings] = useState({ questionCount: 10, maxPlayers: 8 });
  const { createRoom, joinRoom, startGame } = useSocket();
  const { state } = useGame();

  const handleCreate = (e) => {
    e.preventDefault();
    if (playerName.trim().length < 2) return;
    createRoom(playerName.trim(), settings);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (playerName.trim().length < 2 || roomCode.trim().length !== 6) return;
    joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
  };

  return (
    <div className="home-screen">
      <div className="bg-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i % 5}`} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }} />
        ))}
      </div>

      <div className="home-content animate-in">
        <div className="logo-section">
          <div className="logo-icon">🧠</div>
          <h1 className="logo-title">
            <span className="text-gradient">Quiz</span>Battle
          </h1>
          <p className="logo-subtitle">Do'stlar bilan bilimingizni sinab ko'ring!</p>
        </div>

        {!state.isConnected && (
          <div className="connection-warning">
            <span className="warning-dot" />
            Server bilan ulanmoqda...
          </div>
        )}

        {!mode ? (
          <div className="mode-selector">
            <button
              className="mode-btn mode-btn-solo"
              onClick={() => setMode('solo')}
            >
              <span className="mode-btn-icon">🎯</span>
              <span className="mode-btn-text">
                <strong>Solo o'ynash</strong>
                <small>Bir o'zingiz bilimingizni sinang</small>
              </span>
            </button>
            <button
              className="mode-btn mode-btn-create"
              onClick={() => setMode('create')}
            >
              <span className="mode-btn-icon">🎮</span>
              <span className="mode-btn-text">
                <strong>Xona yaratish</strong>
                <small>Do'stlarni taklif qilib birga o'ynash</small>
              </span>
            </button>
            <button
              className="mode-btn mode-btn-join"
              onClick={() => setMode('join')}
            >
              <span className="mode-btn-icon">🚀</span>
              <span className="mode-btn-text">
                <strong>Xonaga qo'shilish</strong>
                <small>Mavjud o'yinga qo'shilish</small>
              </span>
            </button>
          </div>
        ) : mode === 'solo' ? (
          <div className="form-card animate-in">
            <button className="back-btn" onClick={() => setMode(null)}>← Orqaga</button>
            <h2>🎯 Solo o'ynash</h2>
              <form onSubmit={(e) => { e.preventDefault(); if (playerName.trim().length >= 2) createRoom(playerName.trim(), settings, true); }}>
              <div className="form-group">
                <label>Ismingiz</label>
                <input
                  type="text"
                  placeholder="Ismingizni kiriting..."
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  maxLength={20}
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Savollar soni</label>
                <select
                  value={settings.questionCount}
                  onChange={e => setSettings(s => ({ ...s, questionCount: +e.target.value }))}
                  className="form-select"
                >
                  <option value={5}>5 ta (tez)</option>
                  <option value={10}>10 ta (o'rtacha)</option>
                  <option value={15}>15 ta (to'liq)</option>
                </select>
              </div>
              <button
                type="submit"
                className="submit-btn submit-btn-solo"
                disabled={playerName.trim().length < 2 || !state.isConnected}
              >
                {state.isConnected ? '🎯 Boshlash' : 'Ulanmoqda...'}
              </button>
            </form>
          </div>
        ) : mode === 'create' ? (
          <div className="form-card animate-in">
            <button className="back-btn" onClick={() => setMode(null)}>← Orqaga</button>
            <h2>Yangi xona yaratish</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Ismingiz</label>
                <input
                  type="text"
                  placeholder="Ismingizni kiriting..."
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  maxLength={20}
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Savollar soni</label>
                  <select
                    value={settings.questionCount}
                    onChange={e => setSettings(s => ({ ...s, questionCount: +e.target.value }))}
                    className="form-select"
                  >
                    <option value={5}>5 ta</option>
                    <option value={10}>10 ta</option>
                    <option value={15}>15 ta</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Max o'yinchilar</label>
                  <select
                    value={settings.maxPlayers}
                    onChange={e => setSettings(s => ({ ...s, maxPlayers: +e.target.value }))}
                    className="form-select"
                  >
                    <option value={2}>2 ta</option>
                    <option value={4}>4 ta</option>
                    <option value={8}>8 ta</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="submit-btn"
                disabled={playerName.trim().length < 2 || !state.isConnected}
              >
                {state.isConnected ? '🎮 Xona yaratish' : 'Ulanmoqda...'}
              </button>
            </form>
          </div>
        ) : (
          <div className="form-card animate-in">
            <button className="back-btn" onClick={() => setMode(null)}>← Orqaga</button>
            <h2>Xonaga qo'shilish</h2>
            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label>Ismingiz</label>
                <input
                  type="text"
                  placeholder="Ismingizni kiriting..."
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  maxLength={20}
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Xona kodi</label>
                <input
                  type="text"
                  placeholder="6 ta belgi (masalan: ABC123)"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="form-input room-code-input"
                />
              </div>
              <button
                type="submit"
                className="submit-btn submit-btn-join"
                disabled={playerName.trim().length < 2 || roomCode.trim().length !== 6 || !state.isConnected}
              >
                {state.isConnected ? '🚀 Qo\'shilish' : 'Ulanmoqda...'}
              </button>
            </form>
          </div>
        )}

        <div className="features-grid">
          <div className="feature-item">
            <span>⚡</span>
            <span>Real vaqt</span>
          </div>
          <div className="feature-item">
            <span>🏆</span>
            <span>Reyting</span>
          </div>
          <div className="feature-item">
            <span>📚</span>
            <span>15+ savol</span>
          </div>
          <div className="feature-item">
            <span>👥</span>
            <span>Ko'p o'yinchi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
