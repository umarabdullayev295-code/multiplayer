# 🧠 QuizBattle - Multiplayer Quiz O'yini

Real vaqtda do'stlar bilan bilimingizni sinab ko'ring!

## 🚀 Ishga tushirish

### Usul 1: Avtomatik (start.bat)
`start.bat` faylini ikki marta bosing. Ikkala server ham avtomatik ishga tushadi.

### Usul 2: Qo'lda

**Server (Backend):**
```bash
cd server
npm install
npm start
```

**Client (Frontend) - yangi terminal:**
```bash
cd client
npm install
npm start
```

Brauzerda `http://localhost:3000` manzilini oching.

## 🎮 O'yin qoidalari

1. **Xona yaratish**: "Xona yaratish" tugmasini bosib, ismingizni kiriting
2. **Qo'shilish**: "Xonaga qo'shilish" tugmasini bosib, 6 ta kodni kiriting
3. **O'yin boshlash**: Xost barcha tayyor bo'lganda "O'yinni boshlash" tugmasini bosadi
4. **Javob berish**: Har bir savolga belgilangan vaqt ichida javob bering
5. **Ball hisoblash**: To'g'ri javob = 100 ball + vaqt bonusi (50 ballgacha)

## ⚙️ Texnologiyalar

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: React, Socket.io-client
- **Real-time**: WebSocket ulanish
- **UI**: Zamonaviy gradient dizayn

## 📁 Loyiha strukturasi

```
├── server/
│   ├── index.js          # Asosiy server va socket eventlar
│   ├── gameManager.js    # O'yin logikasi
│   ├── questions.js      # Quiz savollari
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.js
│   │   ├── AppContent.js
│   │   ├── context/
│   │   │   └── GameContext.js
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   └── components/
│   │       ├── HomeScreen.js/css
│   │       ├── LobbyScreen.js/css
│   │       ├── GameScreen.js/css
│   │       ├── ResultsScreen.js/css
│   │       └── Toast.js/css
│   └── package.json
├── start.bat
└── README.md
```

## 🏆 Scoring tizimi

| Holat | Ball |
|-------|------|
| To'g'ri javob | 100 |
| Vaqt bonusi | 0-50 |
| Noto'g'ri javob | 0 |
| Javob bermagan | 0 |

Qanchalik tez javob bersangiz, shunchalik ko'p bonus ball olasiz!
