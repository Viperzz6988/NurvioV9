import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import confetti from 'canvas-confetti';
import { useLanguage } from '@/contexts/LanguageContext';

const HighRiskClickerPage: React.FC = () => {
  const [clicks, setClicks] = useState<number>(0);
  const [loseChance, setLoseChance] = useState<number>(0);
  const [lost, setLost] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<boolean>(false);
  const { addEntry } = useLeaderboard();
  const timeoutRef = useRef<number | null>(null);
  const { entries } = useLeaderboard();
  const { t } = useLanguage();

  const best = entries
    .filter((e) => e.game === 'HighRiskClicker')
    .sort((a, b) => b.score - a.score)[0];

  useEffect(() => () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); }, []);

  const handleClick = () => {
    if (lost || cooldown) return;
    setCooldown(true);
    timeoutRef.current = window.setTimeout(() => setCooldown(false), 120);

    const nextClicks = clicks + 1;
    const nextChance = Math.min(100, loseChance + 1);

    const roll = Math.random() * 100;
    if (roll < nextChance) {
      // loss
      setLost(true);
      addEntry({ game: 'HighRiskClicker', score: nextClicks - 1 });
    } else {
      setClicks(nextClicks);
      setLoseChance(nextChance);
      // subtle confetti on progress
      confetti({ particleCount: 20, spread: 20, origin: { y: 0.8 }, scalar: 0.6 });
    }
  };

  const reset = () => {
    setClicks(0);
    setLoseChance(0);
    setLost(false);
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">{t('hrc.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('hrc.subtitle')}</p>
        </div>

        {best && (
          <div className="glass-card mb-6 text-center">
            <div className="text-sm text-muted-foreground">{t('games.highscore')}</div>
            <div className="text-lg font-bold">{best.name} — {best.score}</div>
          </div>
        )}

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-6 text-2xl">
              <span>{t('hrc.clicks')}: {clicks}</span>
              <span>{t('hrc.loseChance')}: {loseChance}%</span>
            </CardTitle>
            <CardDescription className="text-center">{t('hrc.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <Button size="lg" className={`text-2xl px-12 py-8 ${lost ? 'bg-red-600' : 'bg-gradient-primary hover:shadow-hover'}`} onClick={handleClick} disabled={lost} aria-label={t('hrc.click')}>
              {t('hrc.click')}
            </Button>
            {lost && (
              <div className="text-center">
                <div className="text-3xl font-extrabold text-red-500 mb-2">{t('animations.lose')}</div>
                <div className="text-muted-foreground mb-4">{t('hrc.gameOver')}</div>
                <div className="text-muted-foreground mb-4">{t('hrc.score')}: {clicks}</div>
                <Button variant="outline" onClick={reset}>{t('hrc.retry')}</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HighRiskClickerPage;