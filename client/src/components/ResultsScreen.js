import React from 'react';
import { useGame } from '../context/GameContext';
import { useSocket } from '../hooks/useSocket';
import './ResultsScreen.css';

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_COLORS = ['#ffd166', '#a09cc4', '#cd7f32'];

export default function ResultsScreen() {
  const { state, dispatch } = useGame();
  const { leaderboard, playerName, playerId } = state;

  const myResult = leaderboard.find(p => p.id === playerId || p.name === playerName);
  const myRank = myResult?.rank || leaderboard.length;

  const { disconnectSocket } = useSocket();

  const handlePlayAgain = () => {
    disconnectSocket();
    dispatch({ type: 'RESET' });
  };

  const getRankMessage = () => {
    if (myRank === 1) return { text: 'Ajoyib! Siz birinchisiz! 🎉', color: '#ffd166' };
    if (myRank === 2) return { text: 'Zo\'r! Ikkinchi o\'rin! 🥈', color: '#a09cc4' };
    if (myRank === 3) return { text: 'Yaxshi! Uchinchi o\'rin! 🥉', color: '#cd7f32' };
    return { text: 'Yaxshi harakat! Keyinroq yaxshiroq bo\'lasiz! 💪', color: '#6c63ff' };
  };

  const rankMsg = getRankMessage();

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="results-screen">
      <div className="results-bg" />

      <div className="results-content">
        <div className="results-header animate-in">
          <div className="trophy-icon">🏆</div>
          <h1 className="results-title">O'yin tugadi!</h1>
          {myResult && (
            <div className="my-rank-badge" style={{ borderColor: rankMsg.color, color: rankMsg.color }}>
              {rankMsg.text}
            </div>
          )}
        </div>

        {topThree.length > 0 && (
          <div className="podium-section animate-in">
            <div className="podium-players">
              {topThree.length > 1 && (
                <div className="podium-player podium-second">
                  <div className="podium-avatar" style={{ background: PODIUM_COLORS[1] }}>
                    {topThree[1].name.charAt(0).toUpperCase()}
                  </div>
                  <div className="podium-name">{topThree[1].name}</div>
                  <div className="podium-score">{topThree[1].score}</div>
                  <div className="podium-block podium-block-2">🥈</div>
                </div>
              )}

              <div className="podium-player podium-first">
                <div className="winner-crown">👑</div>
                <div className="podium-avatar podium-avatar-first" style={{ background: PODIUM_COLORS[0] }}>
                  {topThree[0].name.charAt(0).toUpperCase()}
                </div>
                <div className="podium-name">{topThree[0].name}</div>
                <div className="podium-score">{topThree[0].score}</div>
                <div className="podium-block podium-block-1">🥇</div>
              </div>

              {topThree.length > 2 && (
                <div className="podium-player podium-third">
                  <div className="podium-avatar" style={{ background: PODIUM_COLORS[2] }}>
                    {topThree[2].name.charAt(0).toUpperCase()}
                  </div>
                  <div className="podium-name">{topThree[2].name}</div>
                  <div className="podium-score">{topThree[2].score}</div>
                  <div className="podium-block podium-block-3">🥉</div>
                </div>
              )}
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <div className="full-leaderboard animate-in">
            <h3 className="lb-section-title">Barcha o'yinchilar</h3>
            {rest.map((player, index) => (
              <div
                key={player.id}
                className={`lb-row ${player.id === playerId || player.name === playerName ? 'lb-row-me' : ''}`}
                style={{ animationDelay: `${(index + 3) * 0.08}s` }}
              >
                <span className="lb-rank">#{player.rank}</span>
                <div className="lb-avatar" style={{
                  background: `hsl(${(index + 3) * 47}, 60%, 40%)`
                }}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="lb-name">{player.name}</span>
                {(player.id === playerId || player.name === playerName) && (
                  <span className="lb-you-badge">Sen</span>
                )}
                <div className="lb-score-bar">
                  <div
                    className="lb-score-fill"
                    style={{
                      width: `${leaderboard[0]?.score > 0 ? (player.score / leaderboard[0].score) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="lb-score">{player.score}</span>
              </div>
            ))}
          </div>
        )}

        {myResult && (
          <div className="my-stats animate-in">
            <h3 className="lb-section-title">Sizning natijangiz</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#ffd166' }}>#{myRank}</div>
                <div className="stat-label">O'rin</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#6c63ff' }}>{myResult.score}</div>
                <div className="stat-label">Ball</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#43d9b0' }}>
                  {myResult.answers?.filter(a => a.isCorrect).length || 0}
                </div>
                <div className="stat-label">To'g'ri</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#ff6584' }}>
                  {myResult.answers?.filter(a => !a.isCorrect).length || 0}
                </div>
                <div className="stat-label">Noto'g'ri</div>
              </div>
            </div>
          </div>
        )}

        <button className="play-again-btn animate-in" onClick={handlePlayAgain}>
          🔄 Qayta o'ynash
        </button>
      </div>
    </div>
  );
}
