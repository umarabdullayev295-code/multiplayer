import React from 'react';
import { useGame } from './context/GameContext';
import { useSocket } from './hooks/useSocket';
import HomeScreen from './components/HomeScreen';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import Toast from './components/Toast';

export default function AppContent() {
  useSocket();
  const { state } = useGame();

  const renderScreen = () => {
    switch (state.screen) {
      case 'home':
        return <HomeScreen />;
      case 'lobby':
        return <LobbyScreen />;
      case 'game':
        return <GameScreen />;
      case 'results':
        return <ResultsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <>
      {renderScreen()}
      <Toast />
    </>
  );
}
