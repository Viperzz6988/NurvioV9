import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Play, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLeaderboard } from '@/contexts/LeaderboardContext';

const LobbyPage = () => {
  const { t } = useLanguage();
  const { entries, refresh } = useLeaderboard();

  useEffect(() => { refresh(); }, []);

  const games = [
    {
      id: 'tetris',
      title: 'Tetris',
      description: 'Der Klassiker! Stapele die Blöcke geschickt und räume komplette Reihen ab.',
      href: '/games/tetris',
      difficulty: 'Mittel',
      rating: 4.8,
      color: 'from-blue-500 to-purple-500',
      icon: '🧩'
    },
    {
      id: 'snake',
      title: 'Snake',
      description: 'Steuere die Schlange, sammle Futter und werde immer länger. Aber pass auf!',
      href: '/games/snake',
      difficulty: 'Einfach',
      rating: 4.6,
      color: 'from-green-500 to-emerald-500',
      icon: '🐍'
    },
    {
      id: 'gamble',
      title: t('gamble.landing.title'),
      description: 'Teste dein Glück in diesem spannenden Risikospiel!',
      href: '/games/gamble',
      difficulty: 'Einfach',
      rating: 4.4,
      color: 'from-yellow-500 to-orange-500',
      icon: '🎰'
    },
    {
      id: 'tictactoe',
      title: 'Tic-Tac-Toe',
      description: 'Das strategische Spiel für zwei! Wer schafft es zuerst, drei in einer Reihe?',
      href: '/games/tictactoe',
      difficulty: 'Einfach',
      rating: 4.2,
      color: 'from-red-500 to-pink-500',
      icon: '⭕'
    }
  ];

  const mapBoard = (title: string, game: 'Snake' | 'Tetris') => {
    const scores = entries.filter((e) => e.game === game).sort((a, b) => b.score - a.score).slice(0, 5);
    return { title, scores };
  };

  const leaderboards = [
    mapBoard('Snake Highscores', 'Snake'),
    mapBoard('Tetris Highscores', 'Tetris'),
    {
      title: `${t('gamble.landing.title')} ${t('games.highscore')}`,
      scores: entries.filter((e) => e.game === 'RiskPlay' || e.game === 'HighRiskClicker' || e.game === 'Blackjack')
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            {t('games.title')} Lobby
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('games.description')} und sieh dir die aktuellen Highscores an!
          </p>
        </div>

        {/* Leaderboards */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Trophy className="text-primary" size={24} />
            {t('leaderboard.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leaderboards.map((board) => (
              <Card key={board.title} className="glass-card hover-lift">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">{board.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {board.scores.length === 0 ? (
                      <div className="text-sm text-muted-foreground">{t('leaderboard.empty')}</div>
                    ) : (
                      board.scores.map((score, scoreIndex) => (
                        <div key={scoreIndex} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              scoreIndex === 0 ? 'bg-yellow-500 text-white' :
                              scoreIndex === 1 ? 'bg-gray-400 text-white' :
                              scoreIndex === 2 ? 'bg-orange-600 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {scoreIndex + 1}
                            </span>
                            <span className="font-medium">{score.name}</span>
                          </div>
                          <span className="text-primary font-bold">{score.score.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Verfügbare Spiele</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {games.map((game, index) => (
              <Card 
                key={game.id}
                className="glass-card hover-lift group transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${game.color} rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                      {game.icon}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{game.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{game.title}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="font-medium text-primary">{game.difficulty}</div>
                    <div className="text-muted-foreground text-sm">Schwierigkeit</div>
                  </div>

                  <Button asChild className="w-full bg-gradient-primary hover:shadow-hover group-hover:scale-105 transition-all">
                    <Link to={game.href}>
                      <Play className="mr-2" size={16} />
                      {t('games.play')}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;