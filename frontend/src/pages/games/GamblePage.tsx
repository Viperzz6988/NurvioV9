import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const GamblePage = () => {
  const { t } = useLanguage();
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [winChance, setWinChance] = useState(50);
  const [multiplier, setMultiplier] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastResult, setLastResult] = useState<'win' | 'lose' | null>(null);
  const [gameHistory, setGameHistory] = useState<{ result: 'win' | 'lose', amount: number }[]>([]);

  useEffect(() => {
    // Calculate multiplier based on win chance
    const newMultiplier = Math.max(1.1, (100 / winChance) * 0.95);
    setMultiplier(Number(newMultiplier.toFixed(2)));
  }, [winChance]);

  const placeBet = () => {
    if (balance < bet || isPlaying) return;

    setIsPlaying(true);
    setLastResult(null);

    // Animate the gambling process
    setTimeout(() => {
      // Use crypto.getRandomValues for true randomness
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      const randomValue = (randomArray[0] / (0xFFFFFFFF + 1)) * 100;

      const won = randomValue < winChance;
      
      if (won) {
        const winAmount = Math.floor(bet * multiplier);
        setBalance(prev => prev + winAmount - bet);
        setLastResult('win');
        setGameHistory(prev => [...prev.slice(-9), { result: 'win', amount: winAmount }]);
      } else {
        setBalance(prev => prev - bet);
        setLastResult('lose');
        setGameHistory(prev => [...prev.slice(-9), { result: 'lose', amount: bet }]);
      }

      setIsPlaying(false);
    }, 1500);
  };

  const resetGame = () => {
    setBalance(1000);
    setWinChance(50);
    setBet(10);
    setLastResult(null);
    setGameHistory([]);
  };

  const adjustWinChance = (delta: number) => {
    const newChance = Math.max(5, Math.min(95, winChance + delta));
    setWinChance(newChance);
  };

  const adjustBet = (delta: number) => {
    const newBet = Math.max(1, Math.min(balance, bet + delta));
    setBet(newBet);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            {t('gamble.landing.title')}
          </h1>
          <p className="text-lg text-muted-foreground">{t('gamble.landing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="text-primary" size={24} />
                  {t('riskplay.balance')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  ${balance.toLocaleString()}
                </div>
                <Button
                  onClick={resetGame}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  {t('riskplay.reset')}
                </Button>
              </CardContent>
            </Card>

            {/* Betting Controls */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('riskplay.betChanceTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bet Amount */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('riskplay.bet')}: ${bet}
                  </label>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => adjustBet(-5)} 
                      variant="outline" 
                      size="sm"
                      disabled={bet <= 5}
                    >
                      -5
                    </Button>
                    <Button 
                      onClick={() => adjustBet(-1)} 
                      variant="outline" 
                      size="sm"
                      disabled={bet <= 1}
                    >
                      -1
                    </Button>
                    <Button 
                      onClick={() => adjustBet(1)} 
                      variant="outline" 
                      size="sm"
                      disabled={bet >= balance}
                    >
                      +1
                    </Button>
                    <Button 
                      onClick={() => adjustBet(5)} 
                      variant="outline" 
                      size="sm"
                      disabled={bet + 5 > balance}
                    >
                      +5
                    </Button>
                  </div>
                </div>

                {/* Win Chance */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('riskplay.winChance')}: {winChance}%
                  </label>
                  <Progress value={winChance} className="mb-2" />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => adjustWinChance(-5)} 
                      variant="outline" 
                      size="sm"
                      disabled={winChance <= 5}
                    >
                      -5%
                    </Button>
                    <Button 
                      onClick={() => adjustWinChance(-1)} 
                      variant="outline" 
                      size="sm"
                      disabled={winChance <= 5}
                    >
                      -1%
                    </Button>
                    <Button 
                      onClick={() => adjustWinChance(1)} 
                      variant="outline" 
                      size="sm"
                      disabled={winChance >= 95}
                    >
                      +1%
                    </Button>
                    <Button 
                      onClick={() => adjustWinChance(5)} 
                      variant="outline" 
                      size="sm"
                      disabled={winChance >= 95}
                    >
                      +5%
                    </Button>
                  </div>
                </div>

                {/* Multiplier Display */}
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">{t('riskplay.multiplier')}</div>
                  <div className="text-2xl font-bold text-primary">{multiplier}x</div>
                  <div className="text-sm text-muted-foreground">
                    {t('riskplay.potentialWin')}: ${Math.floor(bet * multiplier).toLocaleString()}
                  </div>
                </div>

                {/* Play Button */}
                <Button
                  onClick={placeBet}
                  disabled={balance < bet || isPlaying}
                  className={`w-full text-lg py-6 transition-all duration-300 ${
                    isPlaying 
                      ? 'bg-muted animate-pulse' 
                      : 'bg-gradient-primary hover:shadow-hover hover:scale-105'
                  }`}
                >
                  {isPlaying ? t('riskplay.playing') : `${t('riskplay.play')} ($${bet})`}
                </Button>
              </CardContent>
            </Card>

            {/* Result Display */}
            {lastResult && (
              <Card className={`glass-card border-2 ${
                lastResult === 'win' 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-red-500 bg-red-500/10'
              }`}>
                <CardContent className="text-center py-6">
                  <div className={`text-4xl mb-2 ${
                    lastResult === 'win' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {lastResult === 'win' ? '🎉' : '💸'}
                  </div>
                  <div className={`text-2xl font-bold ${
                    lastResult === 'win' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {lastResult === 'win' ? t('animations.won') : t('animations.lose')}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Game History */}
          <div>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('games.highscore')}</CardTitle>
                <CardDescription>{t('games.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      {t('leaderboard.empty')}
                    </div>
                  ) : (
                    gameHistory.map((game, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 rounded bg-muted/20"
                      >
                        <div className="flex items-center gap-2">
                          {game.result === 'win' ? (
                            <TrendingUp className="text-green-500" size={16} />
                          ) : (
                            <TrendingDown className="text-red-500" size={16} />
                          )}
                          <span className={`text-sm ${
                            game.result === 'win' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {game.result === 'win' ? t('animations.won') : t('animations.lose')}
                          </span>
                        </div>
                        <span className={`font-bold ${
                          game.result === 'win' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {game.result === 'win' ? '+' : '-'}${game.amount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamblePage;