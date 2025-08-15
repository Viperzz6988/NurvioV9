import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Star, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLeaderboard } from '@/contexts/LeaderboardContext';

const SpielelobbyPage = () => {
  const { t } = useLanguage();
  const { entries } = useLeaderboard();

  const games = [
    {
      id: 'tetris',
      title: 'Tetris',
      description: t('games.tetris.description'),
      href: '/spiele/tetris',
      difficulty: t('games.details.difficulty.medium'),
      players: t('games.details.players.single'),
      duration: '10-30',
      rating: 4.8,
      color: 'from-blue-500 to-purple-500',
      icon: '🧩',
      features: [t('games.features.levels'), t('games.features.highscore'), t('games.features.pause')]
    },
    {
      id: 'snake',
      title: 'Snake',
      description: t('games.snake.description'),
      href: '/spiele/snake',
      difficulty: t('games.details.difficulty.easy'),
      players: t('games.details.players.single'),
      duration: '5-15',
      rating: 4.6,
      color: 'from-green-500 to-emerald-500',
      icon: '🐍',
      features: [t('games.features.difficultyScaling'), t('games.features.powerups'), t('games.features.maps')]
    },
    {
      id: 'tictactoe',
      title: 'Tic-Tac-Toe',
      description: t('games.tictactoe.description'),
      href: '/spiele/tictactoe',
      difficulty: t('games.details.difficulty.easy'),
      players: t('games.details.players.two'),
      duration: '2-5',
      rating: 4.4,
      color: 'from-red-500 to-pink-500',
      icon: '⭕',
      features: [t('games.features.localMultiplayer'), t('games.features.ai'), t('games.features.stats')]
    }
  ];

  const topSnake = entries.filter((e) => e.game === 'Snake').sort((a, b) => b.score - a.score).slice(0, 5);
  const topTetris = entries.filter((e) => e.game === 'Tetris').sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            {t('games.lobby.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('games.lobby.subtitle')}
          </p>
        </div>

        {/* Leaderboards for Snake and Tetris */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary"><Trophy size={18} /> Snake Highscores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topSnake.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{t('leaderboard.empty')}</div>
                ) : (
                  topSnake.map((e, idx) => (
                    <div key={e.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-muted text-muted-foreground'}`}>{idx + 1}</span>
                        <span className="font-medium">{e.name}</span>
                      </div>
                      <span className="text-primary font-bold tabular-nums">{e.score.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary"><Trophy size={18} /> Tetris Highscores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topTetris.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{t('leaderboard.empty')}</div>
                ) : (
                  topTetris.map((e, idx) => (
                    <div key={e.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-muted text-muted-foreground'}`}>{idx + 1}</span>
                        <span className="font-medium">{e.name}</span>
                      </div>
                      <span className="text-primary font-bold tabular-nums">{e.score.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Games */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('games.all')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-primary">{game.difficulty}</div>
                      <div className="text-muted-foreground">{t('games.details.difficulty.label')}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-primary">{game.players}</div>
                      <div className="text-muted-foreground">{t('games.details.players.label')}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-primary">{game.duration} {t('games.details.duration.minutes')}</div>
                      <div className="text-muted-foreground">{t('games.details.duration.label')}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">{t('games.details.features')}</div>
                    <div className="flex flex-wrap gap-1">
                      {game.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
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

export default SpielelobbyPage;