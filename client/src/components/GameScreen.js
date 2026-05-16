import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useSocket } from '../hooks/useSocket';
import './GameScreen.css';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = ['#6c63ff', '#ff6584', '#43d9b0', '#ffd166'];

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const { submitAnswer } = useSocket();
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCorrect, setShowCorrect] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const {
    currentQuestion,
    questionIndex,
    totalQuestions,
    selectedAnswer,
    correctAnswer,
    showResults,
    leaderboard,
    answeredCount,
    room,
    isCorrect,
    lastPoints
  } = state;

  useEffect(() => {
    if (!currentQuestion) return;

    setTimeLeft(currentQuestion.timeLimit);
    setShowCorrect(false);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, currentQuestion.timeLimit - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
      }
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [currentQuestion?.question]);

  useEffect(() => {
    if (showResults || correctAnswer !== null) {
      clearInterval(timerRef.current);
      setShowCorrect(true);
    }
  }, [showResults, correctAnswer]);

  if (!currentQuestion) {
    return (
      <div className="game-loading">
        <div className="loading-spinner" />
        <p>Savol yuklanmoqda...</p>
      </div>
    );
  }

  const timePercent = (timeLeft / currentQuestion.timeLimit) * 100;
  const isLowTime = timeLeft <= 5;
  const totalPlayers = room?.players?.length || 1;

  const handleAnswer = (index) => {
    if (selectedAnswer !== null || showCorrect) return;
    submitAnswer(index);
  };

  const getOptionClass = (index) => {
    let cls = 'option-btn';
    if (selectedAnswer === index) cls += ' option-selected';
    if (showCorrect && correctAnswer !== null) {
      if (index === correctAnswer) cls += ' option-correct';
      else if (selectedAnswer === index && index !== correctAnswer) cls += ' option-wrong';
    }
    if (selectedAnswer !== null && !showCorrect && selectedAnswer !== index) {
      cls += ' option-dimmed';
    }
    return cls;
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <div className="question-progress">
          <span className="q-current">{questionIndex + 1}</span>
          <span className="q-separator">/</span>
          <span className="q-total">{totalQuestions}</span>
        </div>

        <div className={`timer-section ${isLowTime ? 'timer-low' : ''}`}>
          <div className="timer-circle">
            <svg viewBox="0 0 60 60" className="timer-svg">
              <circle cx="30" cy="30" r="26" className="timer-bg-circle" />
              <circle
                cx="30" cy="30" r="26"
                className="timer-progress-circle"
                strokeDasharray={`${163.36}`}
                strokeDashoffset={`${163.36 * (1 - timePercent / 100)}`}
                style={{ stroke: isLowTime ? '#ff6584' : '#6c63ff' }}
              />
            </svg>
            <span className="timer-text">{Math.ceil(timeLeft)}</span>
          </div>
        </div>

        <div className="answers-counter">
          <span className="answers-icon">✓</span>
          <span>{answeredCount}/{totalPlayers}</span>
        </div>
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{
            width: `${((questionIndex + 1) / totalQuestions) * 100}%`
          }}
        />
      </div>

      <div className="question-section">
        <div className="category-tag">{currentQuestion.category}</div>
        <h2 className="question-text">{currentQuestion.question}</h2>
      </div>

      <div className="options-grid">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            className={getOptionClass(index)}
            onClick={() => handleAnswer(index)}
            style={{
              '--option-color': OPTION_COLORS[index],
              animationDelay: `${index * 0.08}s`
            }}
            disabled={selectedAnswer !== null}
          >
            <span className="option-letter" style={{ background: OPTION_COLORS[index] }}>
              {OPTION_LETTERS[index]}
            </span>
            <span className="option-text">{option}</span>
            {showCorrect && index === correctAnswer && (
              <span className="option-indicator correct-indicator">✓</span>
            )}
            {showCorrect && selectedAnswer === index && index !== correctAnswer && (
              <span className="option-indicator wrong-indicator">✗</span>
            )}
          </button>
        ))}
      </div>

      {selectedAnswer !== null && !showCorrect && (
        <div className="waiting-banner">
          <div className="waiting-dots">
            <span /><span /><span />
          </div>
          Boshqalar javob bermoqda...
        </div>
      )}

      {showCorrect && isCorrect !== null && (
        <div className={`feedback-banner ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          {isCorrect ? (
            <>
              <span className="feedback-icon">🎉</span>
              <div>
                <div className="feedback-title">To'g'ri javob!</div>
                <div className="feedback-points">+{lastPoints} ball</div>
              </div>
            </>
          ) : (
            <>
              <span className="feedback-icon">😔</span>
              <div>
                <div className="feedback-title">Noto'g'ri javob</div>
                <div className="feedback-subtitle">
                  To'g'ri: {currentQuestion.options[correctAnswer]}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showCorrect && selectedAnswer === null && (
        <div className="feedback-banner feedback-timeout">
          <span className="feedback-icon">⏰</span>
          <div>
            <div className="feedback-title">Vaqt tugadi!</div>
            <div className="feedback-subtitle">
              To'g'ri: {currentQuestion.options[correctAnswer]}
            </div>
          </div>
        </div>
      )}

      {showResults && leaderboard.length > 0 && (
        <div className="mini-leaderboard">
          <h4 className="mini-lb-title">🏆 Reytinglar</h4>
          <div className="mini-lb-list">
            {leaderboard.slice(0, 5).map((player, i) => (
              <div key={player.id} className={`mini-lb-item ${player.name === state.playerName ? 'mini-lb-me' : ''}`}>
                <span className="mini-lb-rank">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span className="mini-lb-name">{player.name}</span>
                <span className="mini-lb-score">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
