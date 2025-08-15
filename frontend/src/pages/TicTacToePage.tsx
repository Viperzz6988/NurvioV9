import React from 'react';
import TicTacToeGame from '@/components/games/TicTacToeGame';
import { useLanguage } from '@/contexts/LanguageContext';

const TicTacToePage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            {t('games.tictactoe.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('games.tictactoe.description')}
          </p>
        </div>
        <TicTacToeGame />
      </div>
    </div>
  );
};

export default TicTacToePage;