import { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useGame } from '../context/GameContext';

const SOCKET_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3001'
  : window.location.origin;

let socketInstance = null;

export function useSocket() {
  const { state, dispatch, setError } = useGame();

  useEffect(() => {
    if (socketInstance) return;

    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    dispatch({ type: 'SET_SOCKET', payload: socketInstance });

    socketInstance.on('connect', () => {
      console.log('Socket ulandi:', socketInstance.id);
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket uzildi');
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Ulanish xatosi:', err.message);
    });

    socketInstance.on('error', ({ message }) => {
      setError(message);
    });

    socketInstance.on('room_created', ({ roomCode, room, isSolo }) => {
      dispatch({ type: 'ROOM_CREATED', payload: { roomCode, room, isSolo } });
      if (isSolo) {
        setTimeout(() => socketInstance.emit('start_game'), 300);
      }
    });

    socketInstance.on('room_joined', ({ roomCode, room }) => {
      dispatch({ type: 'ROOM_JOINED', payload: { roomCode, room } });
    });

    socketInstance.on('player_joined', ({ room }) => {
      dispatch({ type: 'UPDATE_ROOM', payload: room });
    });

    socketInstance.on('player_left', ({ room }) => {
      dispatch({ type: 'UPDATE_ROOM', payload: room });
    });

    socketInstance.on('game_started', ({ room }) => {
      dispatch({ type: 'GAME_STARTED', payload: room });
    });

    socketInstance.on('new_question', (question) => {
      dispatch({ type: 'NEW_QUESTION', payload: question });
    });

    socketInstance.on('answer_confirmed', (data) => {
      dispatch({ type: 'ANSWER_CONFIRMED', payload: data });
    });

    socketInstance.on('player_answered', (data) => {
      dispatch({ type: 'PLAYER_ANSWERED', payload: data });
    });

    socketInstance.on('show_results', (data) => {
      dispatch({ type: 'SHOW_RESULTS', payload: data });
    });

    socketInstance.on('question_timeout', (data) => {
      dispatch({ type: 'QUESTION_TIMEOUT', payload: data });
    });

    socketInstance.on('game_finished', (data) => {
      dispatch({ type: 'GAME_FINISHED', payload: data });
    });
  }, []);

  const createRoom = useCallback((playerName, settings, isSolo = false) => {
    if (!socketInstance) return;
    dispatch({ type: 'SET_PLAYER_INFO', payload: { name: playerName, id: socketInstance.id } });
    socketInstance.emit('create_room', { playerName, settings, isSolo });
  }, [dispatch]);

  const joinRoom = useCallback((roomCode, playerName) => {
    if (!socketInstance) return;
    dispatch({ type: 'SET_PLAYER_INFO', payload: { name: playerName, id: socketInstance.id } });
    socketInstance.emit('join_room', { roomCode, playerName });
  }, [dispatch]);

  const startGame = useCallback(() => {
    if (!socketInstance) return;
    socketInstance.emit('start_game');
  }, []);

  const submitAnswer = useCallback((answerIndex) => {
    if (!socketInstance) return;
    dispatch({ type: 'ANSWER_SELECTED', payload: answerIndex });
    socketInstance.emit('submit_answer', { answerIndex });
  }, [dispatch]);

  const disconnectSocket = useCallback(() => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  }, []);

  return { createRoom, joinRoom, startGame, submitAnswer, disconnectSocket };
}
