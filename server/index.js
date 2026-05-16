const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const {
  createRoom,
  joinRoom,
  leaveRoom,
  startGame,
  submitAnswer,
  nextQuestion,
  getRoom,
  getLeaderboard
} = require('./gameManager');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: isProduction ? '*' : 'http://localhost:3000',
  methods: ['GET', 'POST']
}));
app.use(express.json());

if (isProduction) {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuildPath));
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const QUESTION_TRANSITION_DELAY = 3000;
const questionTimers = new Map();

io.on('connection', (socket) => {
  console.log(`Yangi ulanish: ${socket.id}`);

  socket.on('create_room', ({ playerName, settings, isSolo }) => {
    if (!playerName || playerName.trim().length < 2) {
      return socket.emit('error', { message: 'Ism kamida 2 ta harf bo\'lishi kerak' });
    }

    const room = createRoom(socket.id, playerName.trim(), settings);
    socket.join(room.id);
    socket.roomCode = room.id;

    socket.emit('room_created', {
      roomCode: room.id,
      room: sanitizeRoom(room),
      isSolo: !!isSolo
    });

    console.log(`Xona yaratildi: ${room.id} (${playerName})${isSolo ? ' [Solo]' : ''}`);
  });

  socket.on('join_room', ({ roomCode, playerName }) => {
    if (!playerName || playerName.trim().length < 2) {
      return socket.emit('error', { message: 'Ism kamida 2 ta harf bo\'lishi kerak' });
    }
    if (!roomCode || roomCode.trim().length !== 6) {
      return socket.emit('error', { message: 'Xona kodi 6 ta belgi bo\'lishi kerak' });
    }

    const result = joinRoom(roomCode.toUpperCase(), socket.id, playerName.trim());

    if (result.error) {
      return socket.emit('error', { message: result.error });
    }

    socket.join(roomCode.toUpperCase());
    socket.roomCode = roomCode.toUpperCase();

    socket.emit('room_joined', {
      roomCode: roomCode.toUpperCase(),
      room: sanitizeRoom(result.room)
    });

    socket.to(roomCode.toUpperCase()).emit('player_joined', {
      player: result.room.players.find(p => p.id === socket.id),
      room: sanitizeRoom(result.room)
    });

    console.log(`${playerName} xonaga qo'shildi: ${roomCode.toUpperCase()}`);
  });

  socket.on('start_game', () => {
    const roomCode = socket.roomCode;
    const room = getRoom(roomCode);

    if (!room) return socket.emit('error', { message: 'Xona topilmadi' });
    if (room.hostId !== socket.id) return socket.emit('error', { message: 'Faqat xona egasi o\'yinni boshlashi mumkin' });
    if (room.players.length < 1) return socket.emit('error', { message: 'Kamida 1 ta o\'yinchi kerak' });

    const updatedRoom = startGame(roomCode);
    if (!updatedRoom) return socket.emit('error', { message: 'O\'yinni boshlashda xatolik' });

    io.to(roomCode).emit('game_started', {
      room: sanitizeRoom(updatedRoom)
    });

    sendQuestion(roomCode);
  });

  socket.on('submit_answer', ({ answerIndex }) => {
    const roomCode = socket.roomCode;
    if (answerIndex === undefined || answerIndex === null) return;

    const result = submitAnswer(roomCode, socket.id, answerIndex);
    if (!result) return;

    socket.emit('answer_confirmed', {
      isCorrect: result.isCorrect,
      points: result.points,
      correctAnswer: result.room.questions[result.room.currentQuestionIndex].correct
    });

    io.to(roomCode).emit('player_answered', {
      playerId: socket.id,
      playerName: result.player.name,
      answeredCount: result.room.answeredCount,
      totalPlayers: result.room.players.length
    });

    if (result.allAnswered) {
      clearQuestionTimer(roomCode);
      scheduleNextQuestion(roomCode);
    }
  });

  socket.on('disconnect', () => {
    const roomCode = socket.roomCode;
    if (!roomCode) return;

    const room = leaveRoom(roomCode, socket.id);
    
    if (room) {
      io.to(roomCode).emit('player_left', {
        playerId: socket.id,
        room: sanitizeRoom(room)
      });
    }

    console.log(`Uzilish: ${socket.id} (${roomCode})`);
  });
});

function sendQuestion(roomCode) {
  const room = getRoom(roomCode);
  if (!room || room.status !== 'playing') return;

  const question = room.questions[room.currentQuestionIndex];
  if (!question) return;

  room.questionStartTime = Date.now();

  const questionData = {
    questionIndex: room.currentQuestionIndex,
    totalQuestions: room.questions.length,
    question: question.question,
    options: question.options,
    category: question.category,
    timeLimit: question.timeLimit
  };

  io.to(roomCode).emit('new_question', questionData);

  const timerId = setTimeout(() => {
    const currentRoom = getRoom(roomCode);
    if (!currentRoom || currentRoom.currentQuestionIndex !== room.currentQuestionIndex) return;

    io.to(roomCode).emit('question_timeout', {
      correctAnswer: question.correct,
      questionIndex: room.currentQuestionIndex
    });

    scheduleNextQuestion(roomCode, QUESTION_TRANSITION_DELAY);
  }, question.timeLimit * 1000);

  questionTimers.set(roomCode, timerId);
}

function clearQuestionTimer(roomCode) {
  const timerId = questionTimers.get(roomCode);
  if (timerId) {
    clearTimeout(timerId);
    questionTimers.delete(roomCode);
  }
}

function scheduleNextQuestion(roomCode, delay = QUESTION_TRANSITION_DELAY) {
  const room = getRoom(roomCode);
  if (!room) return;

  const currentQuestion = room.questions[room.currentQuestionIndex];
  
  io.to(roomCode).emit('show_results', {
    correctAnswer: currentQuestion.correct,
    leaderboard: getLeaderboard(room),
    questionIndex: room.currentQuestionIndex
  });

  setTimeout(() => {
    const result = nextQuestion(roomCode);
    if (!result) return;

    if (result.finished) {
      io.to(roomCode).emit('game_finished', {
        leaderboard: getLeaderboard(result.room),
        players: result.room.players
      });
    } else {
      sendQuestion(roomCode);
    }
  }, delay);
}

function sanitizeRoom(room) {
  return {
    id: room.id,
    hostId: room.hostId,
    status: room.status,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      isConnected: p.isConnected
    })),
    settings: room.settings,
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: room.questions ? room.questions.length : 0
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (isProduction) {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Quiz server ishga tushdi: http://localhost:${PORT}`);
});
