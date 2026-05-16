import { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useGame } from '../context/GameContext';

const SOCKET_URL = process.env.REACT_APP_SERVER_URL || 
  (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3001');

export function useSocket() {
  const { state, dispatch, setError } = useGame();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    dispatch({ type: 'SET_SOCKET', payload: socket });

    socket.on('connect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    socket.on('room_created', ({ roomCode, room }) => {
      dispatch({ type: 'ROOM_CREATED', payload: { roomCode, room } });
    });

    socket.on('room_joined', ({ roomCode, room }) => {
      dispatch({ type: 'ROOM_JOINED', payload: { roomCode, room } });
    });

    socket.on('player_joined', ({ room }) => {
      dispatch({ type: 'UPDATE_ROOM', payload: room });
    });

    socket.on('player_left', ({ room }) => {
      dispatch({ type: 'UPDATE_ROOM', payload: room });
    });

    socket.on('game_started', ({ room }) => {
      dispatch({ type: 'GAME_STARTED', payload: room });
    });

    socket.on('new_question', (question) => {
      dispatch({ type: 'NEW_QUESTION', payload: question });
    });

    socket.on('answer_confirmed', (data) => {
      dispatch({ type: 'ANSWER_CONFIRMED', payload: data });
    });

    socket.on('player_answered', (data) => {
      dispatch({ type: 'PLAYER_ANSWERED', payload: data });
    });

    socket.on('show_results', (data) => {
      dispatch({ type: 'SHOW_RESULTS', payload: data });
    });

    socket.on('question_timeout', (data) => {
      dispatch({ type: 'QUESTION_TIMEOUT', payload: data });
    });

    socket.on('game_finished', (data) => {
      dispatch({ type: 'GAME_FINISHED', payload: data });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((playerName, settings) => {
    if (!state.socket) return;
    dispatch({ type: 'SET_PLAYER_INFO', payload: { name: playerName, id: state.socket.id } });
    state.socket.emit('create_room', { playerName, settings });
  }, [state.socket, dispatch]);

  const joinRoom = useCallback((roomCode, playerName) => {
    if (!state.socket) return;
    dispatch({ type: 'SET_PLAYER_INFO', payload: { name: playerName, id: state.socket.id } });
    state.socket.emit('join_room', { roomCode, playerName });
  }, [state.socket, dispatch]);

  const startGame = useCallback(() => {
    if (!state.socket) return;
    state.socket.emit('start_game');
  }, [state.socket]);

  const submitAnswer = useCallback((answerIndex) => {
    if (!state.socket) return;
    dispatch({ type: 'ANSWER_SELECTED', payload: answerIndex });
    state.socket.emit('submit_answer', { answerIndex });
  }, [state.socket, dispatch]);

  return { createRoom, joinRoom, startGame, submitAnswer };
}
