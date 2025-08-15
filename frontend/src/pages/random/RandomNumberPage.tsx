import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, Shuffle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const RandomNumberPage = () => {
  const { t } = useLanguage();
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [result, setResult] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<number[]>([]);

  const generateNumber = () => {
    if (isGenerating || min >= max) return;

    setIsGenerating(true);
    setResult(null);

    setTimeout(() => {
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      const randomValue = randomArray[0] / (0xFFFFFFFF + 1);
      
      const newResult = Math.floor(randomValue * (max - min + 1)) + min;
      setResult(newResult);
      setHistory(prev => [...prev, newResult].slice(-10));
      setIsGenerating(false);
    }, 1000);
  };

  const reset = () => {
    setResult(null);
    setHistory([]);
  };

  const quickSet = (minVal: number, maxVal: number) => {
    setMin(minVal);
    setMax(maxVal);
  };

  const isValidRange = min < max && min >= 0 && max <= 1000000;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            {t('random.number.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('random.number.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="mb-8">
                  <div className={`w-48 h-48 rounded-full border-8 border-primary flex items-center justify-center ${
                    isGenerating ? 'animate-pulse bg-gradient-primary' : 'bg-gradient-card'
                  }`}>
                    <div className={`text-center ${isGenerating ? 'animate-bounce' : ''}`}>
                      {isGenerating ? (
                        <div className="text-4xl">🎲</div>
                      ) : result !== null ? (
                        <div className="text-5xl font-bold text-primary">{result}</div>
                      ) : (
                        <div className="text-4xl text-muted-foreground">?</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  {result !== null && !isGenerating && (
                    <div className="animate-fade-in">
                      <div className="text-lg text-muted-foreground mb-2">
                        {t('random.number.result')} {t('common.from') ?? ''} {min} {t('common.to') ?? ''} {max}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('random.number.possible')}: {max - min + 1}
                      </div>
                    </div>
                  )}
                  {isGenerating && (
                    <div className="animate-pulse">
                      <div className="text-xl font-bold text-primary">
                        {t('random.number.generating')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={generateNumber}
                    disabled={isGenerating || !isValidRange}
                    className={`px-8 py-4 text-lg ${
                      isGenerating 
                        ? 'bg-muted animate-pulse' 
                        : 'bg-gradient-primary hover:shadow-hover hover:scale-105'
                    }`}
                  >
                    <Shuffle className="mr-2" size={20} />
                    {isGenerating ? t('random.number.generating') : t('random.number.generate')}
                  </Button>
                  
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="px-8 py-4 text-lg"
                    disabled={history.length === 0 && result === null}
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
                <CardTitle>{t('random.number.rangeTitle')}</CardTitle>
                <CardDescription>{t('random.number.rangeSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min">{t('random.number.min')}</Label>
                    <Input
                      id="min"
                      type="number"
                      value={min}
                      onChange={(e) => setMin(Number(e.target.value))}
                      min={0}
                      max={999999}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max">{t('random.number.max')}</Label>
                    <Input
                      id="max"
                      type="number"
                      value={max}
                      onChange={(e) => setMax(Number(e.target.value))}
                      min={1}
                      max={1000000}
                    />
                  </div>
                </div>

                {!isValidRange && (
                  <div className="text-sm text-red-500">
                    {t('random.number.invalidRange')}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  {t('random.number.possible')}: {isValidRange ? (max - min + 1).toLocaleString() : 0}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">{t('random.number.presets')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => quickSet(1, 10)} variant="outline" size="sm">1-10</Button>
                    <Button onClick={() => quickSet(1, 100)} variant="outline" size="sm">1-100</Button>
                    <Button onClick={() => quickSet(1, 1000)} variant="outline" size="sm">1-1000</Button>
                    <Button onClick={() => quickSet(0, 1)} variant="outline" size="sm">0-1</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('random.number.historyTitle')}</CardTitle>
                <CardDescription>{t('random.number.historySubtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      {t('random.number.historyEmpty')}
                    </div>
                  ) : (
                    history.slice().reverse().map((number, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                        <span className="font-bold text-primary text-lg">{number}</span>
                        <span className="text-xs text-muted-foreground">#{history.length - index}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {history.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>{t('random.number.statsTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {t('random.number.possible')}: {(max - min + 1).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomNumberPage;