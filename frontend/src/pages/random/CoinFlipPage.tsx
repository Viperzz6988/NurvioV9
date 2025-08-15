import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const CoinFlipPage = () => {
  const { t } = useLanguage();
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [flipCount, setFlipCount] = useState(0);
  const [history, setHistory] = useState<('heads' | 'tails')[]>([]);

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      const randomValue = randomArray[0] / (0xFFFFFFFF + 1);
      
      const newResult = randomValue < 0.5 ? 'heads' : 'tails';
      setResult(newResult);
      setFlipCount(prev => prev + 1);
      setHistory(prev => [...prev, newResult].slice(-10) as ('heads' | 'tails')[]);
      setIsFlipping(false);
    }, 2000);
  };

  const reset = () => {
    setResult(null);
    setFlipCount(0);
    setHistory([]);
  };

  const headsCount = history.filter(flip => flip === 'heads').length;
  const tailsCount = history.filter(flip => flip === 'tails').length;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            {t('random.coinflip.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('random.coinflip.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className={`w-48 h-48 mb-8 relative ${isFlipping ? 'animate-spin' : ''}`}>
                  <div className={`w-full h-full rounded-full border-8 border-primary flex items-center justify-center text-6xl font-bold transition-all duration-500 ${
                    result === 'heads' 
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-glow' 
                      : result === 'tails'
                      ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-glow'
                      : 'bg-gradient-primary text-white'
                  }`}>
                    {isFlipping ? (
                      <div className="animate-bounce">🪙</div>
                    ) : result === 'heads' ? (
                      '👑'
                    ) : result === 'tails' ? (
                      '⚫'
                    ) : (
                      '?'
                    )}
                  </div>
                </div>

                <div className="text-center mb-8">
                  {result && !isFlipping && (
                    <div className="animate-fade-in">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {result === 'heads' ? t('random.coinflip.heads') : t('random.coinflip.tails')}!
                      </div>
                      <div className="text-lg text-muted-foreground">
                        {result === 'heads' ? t('random.coinflip.headsLabel') : t('random.coinflip.tailsLabel')}
                      </div>
                    </div>
                  )}
                  {isFlipping && (
                    <div className="animate-pulse">
                      <div className="text-2xl font-bold text-primary">
                        {t('random.coinflip.flipping')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={flipCoin}
                    disabled={isFlipping}
                    className={`px-8 py-4 text-lg ${
                      isFlipping 
                        ? 'bg-muted animate-pulse' 
                        : 'bg-gradient-primary hover:shadow-hover hover:scale-105'
                    }`}
                  >
                    {isFlipping ? t('random.coinflip.flipping') : t('random.coinflip.flip')}
                  </Button>
                  
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="px-8 py-4 text-lg"
                    disabled={flipCount === 0}
                  >
                    <RotateCcw className="mr-2" size={20} />
                    {t('common.reset')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('random.coinflip.stats')}</CardTitle>
                <CardDescription>{t('random.coinflip.historyTitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{flipCount}</div>
                    <div className="text-sm text-muted-foreground">{t('random.coinflip.total')}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {flipCount > 0 ? Math.round((headsCount / flipCount) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">{t('random.coinflip.headRate')}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span>👑</span>
                      <span>{t('random.coinflip.headsLabel')}</span>
                    </span>
                    <span className="font-bold text-primary">{headsCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span>⚫</span>
                      <span>{t('random.coinflip.tailsLabel')}</span>
                    </span>
                    <span className="font-bold text-primary">{tailsCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('random.coinflip.recentFlips')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {history.map((flip, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                        flip === 'heads' 
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                          : 'bg-gradient-to-br from-gray-400 to-gray-600'
                      }`}
                    >
                      {flip === 'heads' ? '👑' : '⚫'}
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 10 - history.length) }).map((_, index) => (
                    <div key={`empty-${index}`} className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinFlipPage;