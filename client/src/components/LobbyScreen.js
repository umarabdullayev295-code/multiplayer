import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useSocket } from '../hooks/useSocket';
import './LobbyScreen.css';

export default function LobbyScreen() {
  const { state, dispatch } = useGame();
  const { startGame, disconnectSocket } = useSocket();
  const [copied, setCopied] = useState(false);

  const { room, roomCode, isHost, playerName } = state;
  if (!room) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLeave = () => {
    disconnectSocket();
    dispatch({ type: 'RESET' });
  };

  const myPlayer = room.players.find(p => p.id === state.playerId || p.name === playerName);
  const sortedPlayers = [...room.players];

  return (
    <div className="lobby-screen">
      <div className="lobby-header">
        <button className="leave-btn" onClick={handleLeave}>
          ✕ Chiqish
        </button>
        <div className="lobby-title">
          <span className="lobby-icon">🎮</span>
          <h1>Lobby</h1>
        </div>
        <div className="player-count">
          {room.players.length}/{room.settings.maxPlayers}
        </div>
      </div>

      <div className="lobby-content">
        <div className="room-code-section">
          <div className="room-code-label">Xona kodi</div>
          <div className="room-code-display">
            {roomCode.split('').map((char, i) => (
              <span key={i} className="code-char">{char}</span>
            ))}
          </div>
          <button className="copy-btn" onClick={copyCode}>
            {copied ? '✓ Nusxalandi!' : '📋 Nusxalash'}
          </button>
          <p className="room-code-hint">
            Do'stlaringizga ushbu kodni yuboring
          </p>
        </div>

        <div className="lobby-main">
          <div className="players-section">
            <h3 className="section-title">
              O'yinchilar
              <span className="player-badge">{room.players.length}</span>
            </h3>
            <div className="players-list">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`player-card ${player.id === state.playerId || player.name === playerName ? 'player-card-me' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="player-avatar" style={{
                    background: getPlayerColor(index)
                  }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="player-info">
                    <span className="player-name">{player.name}</span>
                    {player.id === room.hostId && (
                      <span className="host-badge">👑 Xost</span>
                    )}
                    {(player.id === state.playerId || player.name === playerName) && (
                      <span className="me-badge">Sen</span>
                    )}
                  </div>
                  <div className="player-status">
                    <span className={`status-dot ${player.isConnected !== false ? 'connected' : 'disconnected'}`} />
                  </div>
                </div>
              ))}

              {room.players.length < room.settings.maxPlayers && (
                [...Array(Math.min(3, room.settings.maxPlayers - room.players.length))].map((_, i) => (
                  <div key={`empty-${i}`} className="player-card player-card-empty">
                    <div className="player-avatar player-avatar-empty">?</div>
                    <span className="waiting-text">Kutilmoqda...</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="game-settings-section">
            <h3 className="section-title">O'yin sozlamalari</h3>
            <div className="settings-list">
              <div className="setting-item">
                <span className="setting-icon">❓</span>
                <div>
                  <div className="setting-name">Savollar</div>
                  <div className="setting-value">{room.settings.questionCount} ta</div>
                </div>
              </div>
              <div className="setting-item">
                <span className="setting-icon">👥</span>
                <div>
                  <div className="setting-name">Max o'yinchilar</div>
                  <div className="setting-value">{room.settings.maxPlayers} ta</div>
                </div>
              </div>
              <div className="setting-item">
                <span className="setting-icon">⏱️</span>
                <div>
                  <div className="setting-name">Har savol</div>
                  <div className="setting-value">15-25 son</div>
                </div>
              </div>
              <div className="setting-item">
                <span className="setting-icon">🏆</span>
                <div>
                  <div className="setting-name">Scoring</div>
                  <div className="setting-value">Vaqt bonusi</div>
                </div>
              </div>
            </div>

            {isHost ? (
              <div className="start-section">
                {room.players.length === 1 && (
                  <div className="solo-notice">
                    <span>🎯</span>
                    <span>Solo rejim — o'zingiz o'ynaysiz</span>
                  </div>
                )}
                <button
                  className="start-btn"
                  onClick={startGame}
                >
                  <span>{room.players.length === 1 ? '🎯' : '🚀'}</span>
                  {room.players.length === 1 ? 'Solo boshlash' : 'O\'yinni boshlash'}
                </button>
              </div>
            ) : (
              <div className="waiting-start">
                <div className="waiting-spinner" />
                <span>Xost o'yinni boshlasin...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPlayerColor(index) {
  const colors = [
    'linear-gradient(135deg, #6c63ff, #9c8fff)',
    'linear-gradient(135deg, #ff6584, #ff8fa3)',
    'linear-gradient(135deg, #43d9b0, #6ce8cc)',
    'linear-gradient(135deg, #ffd166, #ffe4a0)',
    'linear-gradient(135deg, #06d6a0, #4fd6b8)',
    'linear-gradient(135deg, #ef476f, #f57c93)',
    'linear-gradient(135deg, #118ab2, #4aaccc)',
    'linear-gradient(135deg, #073b4c, #0a5270)',
  ];
  return colors[index % colors.length];
}
