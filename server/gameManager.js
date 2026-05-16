const { v4: uuidv4 } = require('uuid');
const { getRandomQuestions } = require('./questions');

const rooms = new Map();

function createRoom(hostId, hostName, settings = {}) {
  const roomCode = generateRoomCode();
  const room = {
    id: roomCode,
    hostId,
    players: [{
      id: hostId,
      name: hostName,
      score: 0,
      answers: [],
      isReady: false,
      isConnected: true
    }],
    status: 'waiting', // waiting, countdown, playing, finished
    questions: [],
    currentQuestionIndex: 0,
    settings: {
      maxPlayers: settings.maxPlayers || 8,
      questionCount: settings.questionCount || 10,
      timePerQuestion: settings.timePerQuestion || 20
    },
    timer: null,
    questionStartTime: null,
    answeredCount: 0
  };
  rooms.set(roomCode, room);
  return room;
}

function joinRoom(roomCode, playerId, playerName) {
  const room = rooms.get(roomCode);
  if (!room) return { error: 'Xona topilmadi' };
  if (room.status !== 'waiting') return { error: 'O\'yin allaqachon boshlangan' };
  if (room.players.length >= room.settings.maxPlayers) return { error: 'Xona to\'la' };
  
  const existingPlayer = room.players.find(p => p.name === playerName);
  if (existingPlayer) return { error: 'Bu nom band' };

  room.players.push({
    id: playerId,
    name: playerName,
    score: 0,
    answers: [],
    isReady: false,
    isConnected: true
  });
  
  return { room };
}

function leaveRoom(roomCode, playerId) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  
  room.players = room.players.filter(p => p.id !== playerId);
  
  if (room.players.length === 0) {
    if (room.timer) clearTimeout(room.timer);
    rooms.delete(roomCode);
    return null;
  }
  
  if (room.hostId === playerId && room.players.length > 0) {
    room.hostId = room.players[0].id;
  }
  
  return room;
}

function startGame(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  
  room.questions = getRandomQuestions(room.settings.questionCount);
  room.currentQuestionIndex = 0;
  room.status = 'playing';
  room.players.forEach(p => {
    p.score = 0;
    p.answers = [];
  });
  
  return room;
}

function submitAnswer(roomCode, playerId, answerIndex) {
  const room = rooms.get(roomCode);
  if (!room || room.status !== 'playing') return null;
  
  const player = room.players.find(p => p.id === playerId);
  if (!player) return null;
  
  const currentQuestion = room.questions[room.currentQuestionIndex];
  if (!currentQuestion) return null;
  
  const alreadyAnswered = player.answers.find(a => a.questionIndex === room.currentQuestionIndex);
  if (alreadyAnswered) return null;
  
  const timeElapsed = (Date.now() - room.questionStartTime) / 1000;
  const timeLimit = currentQuestion.timeLimit;
  const isCorrect = answerIndex === currentQuestion.correct;
  
  let points = 0;
  if (isCorrect) {
    const timeBonus = Math.max(0, timeLimit - timeElapsed);
    points = Math.round(100 + (timeBonus / timeLimit) * 50);
  }
  
  player.score += points;
  player.answers.push({
    questionIndex: room.currentQuestionIndex,
    answer: answerIndex,
    isCorrect,
    points,
    timeElapsed: Math.round(timeElapsed * 10) / 10
  });
  
  room.answeredCount = room.players.filter(p => 
    p.answers.some(a => a.questionIndex === room.currentQuestionIndex)
  ).length;
  
  return { player, room, isCorrect, points, allAnswered: room.answeredCount === room.players.length };
}

function nextQuestion(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  
  room.currentQuestionIndex++;
  room.answeredCount = 0;
  
  if (room.currentQuestionIndex >= room.questions.length) {
    room.status = 'finished';
    return { room, finished: true };
  }
  
  room.questionStartTime = Date.now();
  return { room, finished: false };
}

function getRoom(roomCode) {
  return rooms.get(roomCode);
}

function getLeaderboard(room) {
  return [...room.players]
    .sort((a, b) => b.score - a.score)
    .map((p, index) => ({ ...p, rank: index + 1 }));
}

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  startGame,
  submitAnswer,
  nextQuestion,
  getRoom,
  getLeaderboard
};
