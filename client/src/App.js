import React from 'react';
import { GameProvider } from './context/GameContext';
import AppContent from './AppContent';

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
