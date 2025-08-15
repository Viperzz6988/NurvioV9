import React from 'react';
import BlackjackGame from '@/components/games/BlackjackGame';
import { useLanguage } from '@/contexts/LanguageContext';

const BlackjackPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">{t('blackjack.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('blackjack.subtitle')}</p>
        </div>
        <BlackjackGame />
      </div>
    </div>
  );
};

export default BlackjackPage;