import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const GambleIndexPage: React.FC = () => {
  const { entries } = useLeaderboard();
  const top = entries.slice(0, 5);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">{t('gamble.landing.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('gamble.landing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('riskplay.title')}</CardTitle>
              <CardDescription>{t('riskplay.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/gamble/riskplay"><Button className="bg-gradient-primary">{t('games.play')}</Button></Link>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('hrc.title')}</CardTitle>
              <CardDescription>{t('hrc.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/gamble/high-risk-clicker"><Button className="bg-gradient-primary">{t('games.play')}</Button></Link>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('blackjack.title')}</CardTitle>
              <CardDescription>{t('blackjack.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/gamble/blackjack"><Button className="bg-gradient-primary">{t('games.play')}</Button></Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('leaderboard.title')}</CardTitle>
              <CardDescription>{t('games.highscore')}</CardDescription>
            </CardHeader>
            <CardContent>
              {top.length === 0 ? (
                <div className="text-muted-foreground">{t('leaderboard.empty')}</div>
              ) : (
                <div className="space-y-2">
                  {top.map((e) => (
                    <div key={e.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{new Date(e.date).toLocaleDateString()}</span>
                        <span className="font-medium">{e.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{e.game}</div>
                        <div className="font-bold">{e.score}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GambleIndexPage;