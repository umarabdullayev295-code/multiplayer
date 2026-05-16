import React, { createContext, useContext, useReducer, useCallback } from 'react';

const GameContext = createContext(null);

const initialState = {
  screen: 'home', // home, lobby, game, results
  socket: null,
  roomCode: null,
  playerName: null,
  playerId: null,
  isHost: false,
  isSolo: false,
  room: null,
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 0,
  timeLeft: 0,
  selectedAnswer: null,
  correctAnswer: null,
  lastPoints: 0,
  isCorrect: null,
  showResults: false,
  leaderboard: [],
  answeredCount: 0,
  gameFinished: false,
  error: null,
  isConnected: false
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'ROOM_CREATED':
      return {
        ...state,
        roomCode: action.payload.roomCode,
        room: action.payload.room,
        isHost: action.payload.room.hostId === state.playerId,
        isSolo: action.payload.isSolo || false,
        screen: action.payload.isSolo ? 'lobby' : 'lobby',
        error: null
      };
    case 'ROOM_JOINED':
      return {
        ...state,
        roomCode: action.payload.roomCode,
        room: action.payload.room,
        isHost: action.payload.room.hostId === state.playerId,
        isSolo: false,
        screen: 'lobby',
        error: null
      };
    case 'SET_PLAYER_INFO':
      return { ...state, playerName: action.payload.name, playerId: action.payload.id };
    case 'UPDATE_ROOM':
      return {
        ...state,
        room: action.payload,
        isHost: action.payload.hostId === state.playerId
      };
    case 'GAME_STARTED':
      return {
        ...state,
        screen: 'game',
        gameFinished: false,
        selectedAnswer: null,
        correctAnswer: null,
        showResults: false,
        leaderboard: []
      };
    case 'NEW_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload,
        questionIndex: action.payload.questionIndex,
        totalQuestions: action.payload.totalQuestions,
        timeLeft: action.payload.timeLimit,
        selectedAnswer: null,
        correctAnswer: null,
        showResults: false,
        lastPoints: 0,
        isCorrect: null,
        answeredCount: 0
      };
    case 'ANSWER_CONFIRMED':
      return {
        ...state,
        isCorrect: action.payload.isCorrect,
        lastPoints: action.payload.points,
        correctAnswer: action.payload.correctAnswer
      };
    case 'ANSWER_SELECTED':
      return { ...state, selectedAnswer: action.payload };
    case 'PLAYER_ANSWERED':
      return { ...state, answeredCount: action.payload.answeredCount };
    case 'SHOW_RESULTS':
      return {
        ...state,
        showResults: true,
        correctAnswer: action.payload.correctAnswer,
        leaderboard: action.payload.leaderboard
      };
    case 'QUESTION_TIMEOUT':
      return {
        ...state,
        correctAnswer: action.payload.correctAnswer,
        showResults: false,
        timeLeft: 0
      };
    case 'GAME_FINISHED':
      return {
        ...state,
        screen: 'results',
        gameFinished: true,
        leaderboard: action.payload.leaderboard
      };
    case 'SET_TIME':
      return { ...state, timeLeft: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET':
      return { ...initialState, isConnected: state.isConnected, socket: state.socket };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const setError = useCallback((message) => {
    dispatch({ type: 'SET_ERROR', payload: message });
    setTimeout(() => dispatch({ type: 'CLEAR_ERROR' }), 4000);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, setError }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
