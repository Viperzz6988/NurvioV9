import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DollarSign, RotateCcw } from 'lucide-react';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import MoneyRain from '@/components/animations/MoneyRain';
import LoseBlast from '@/components/animations/LoseBlast';
import { useLanguage } from '@/contexts/LanguageContext';

const quickBets = [5, 10, 100, 1000, 10000] as const;

const RiskPlayPage: React.FC = () => {
  const [balance, setBalance] = useState<number>(1000);
  const [bet, setBet] = useState<number>(10);
  const [winChance, setWinChance] = useState<number>(50);
  const [multiplier, setMultiplier] = useState<number>(2);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [showWin, setShowWin] = useState<boolean>(false);
  const [showLose, setShowLose] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { addEntry } = useLeaderboard();
  const { t } = useLanguage();

  useEffect(() => {
    const newMultiplier = Math.max(1.1, (100 / winChance) * 0.95);
    setMultiplier(Number(newMultiplier.toFixed(2)));
  }, [winChance]);

  const play = () => {
    if (isPlaying || bet <= 0 || bet > balance) return;
    setIsPlaying(true);
    setLastWinAmount(0);
    setShowWin(false);
    setShowLose(false);
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const randomValue = (randomArray[0] / (0xFFFFFFFF + 1)) * 100;
    const won = randomValue < winChance;

    setTimeout(() => {
      if (won) {
        const winAmount = Math.floor(bet * multiplier);
        setBalance((prev) => prev + winAmount - bet);
        setLastWinAmount(winAmount);
        addEntry({ game: 'RiskPlay', score: winAmount });
        setShowWin(true);
      } else {
        setBalance((prev) => Math.max(0, prev - bet));
        setShowLose(true);
      }
      setIsPlaying(false);
    }, 900);
  };

  const reset = () => {
    setBalance(1000);
    setBet(10);
    setWinChance(50);
    setLastWinAmount(0);
  };

  const setMax = () => setBet(balance);

  const canPlay = balance >= bet && bet > 0 && !isPlaying;

  return (
    <div ref={containerRef} className="min-h-screen py-10 px-4">
      {/* Win/Lose overlays */}
      {showWin && <div className="pointer-events-none fixed inset-0 bg-green-500/10 z-[55]" />}
      <MoneyRain show={showWin} amountText={`${t('animations.won')} $${lastWinAmount.toLocaleString()}`} onEnd={() => setShowWin(false)} />
      <LoseBlast show={showLose} message={t('animations.lose')} onEnd={() => setShowLose(false)} />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">{t('riskplay.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('riskplay.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><DollarSign className="text-primary" size={20} /> {t('riskplay.balance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">${balance.toLocaleString()}</div>
                <Button onClick={reset} variant="outline" size="sm" className="flex items-center gap-2"><RotateCcw size={14} /> {t('riskplay.reset')}</Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('riskplay.betChanceTitle')}</CardTitle>
                <CardDescription>{t('riskplay.betChanceDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm mb-2">{t('riskplay.bet')}: ${bet}</div>
                  <div className="flex flex-wrap gap-2">
                    {quickBets.map((q) => (
                      <Button key={q} variant="outline" size="sm" onClick={() => setBet((v) => Math.min(balance, v + q))} disabled={bet + q > balance}>+{q}</Button>
                    ))}
                    <Button variant="secondary" size="sm" onClick={setMax} disabled={balance === 0}>{t('riskplay.quickBets.max')}</Button>
                  </div>
                </div>

                <div>
                  <div className="text-sm mb-2">{t('riskplay.winChance')}: {winChance}%</div>
                  <Progress value={winChance} className="mb-2" />
                  <div className="flex gap-2">
                    <Button onClick={() => setWinChance((v) => Math.max(5, v - 5))} variant="outline" size="sm" disabled={winChance <= 5}>-5%</Button>
                    <Button onClick={() => setWinChance((v) => Math.min(95, v + 5))} variant="outline" size="sm" disabled={winChance >= 95}>+5%</Button>
                  </div>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">{t('riskplay.multiplier')}</div>
                  <div className="text-2xl font-bold text-primary">{multiplier}x</div>
                  <div className="text-sm text-muted-foreground">{t('riskplay.potentialWin')}: ${Math.floor(bet * multiplier).toLocaleString()}</div>
                </div>

                <Button onClick={play} disabled={!canPlay} className={`${isPlaying ? 'bg-muted animate-pulse' : 'bg-gradient-primary hover:shadow-hover'} w-full text-lg py-5`}>
                  {isPlaying ? t('riskplay.playing') : `${t('riskplay.play')} ($$${bet})`}
                </Button>

                {lastWinAmount > 0 && (
                  <div className="text-center font-extrabold text-green-600 bg-green-500/10 inline-block px-4 py-2 rounded">{t('animations.won')} ${lastWinAmount.toLocaleString()}</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('riskplay.note.title')}</CardTitle>
                <CardDescription>{t('riskplay.note.text')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t('riskplay.leaderboardSaved')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskPlayPage;