import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import { useLanguage } from '@/contexts/LanguageContext';

const GambleLobbyPage: React.FC = () => {
  const { entries } = useLeaderboard();
  const { t } = useLanguage();

  const onlyAuth = useMemo(() => entries.filter((e) => !!e.userId), [entries]);
  const topRiskPlay = useMemo(() => onlyAuth.filter((e) => e.game === 'RiskPlay').sort((a, b) => b.score - a.score).slice(0, 10), [onlyAuth]);
  const topHRC = useMemo(() => onlyAuth.filter((e) => e.game === 'HighRiskClicker').sort((a, b) => b.score - a.score).slice(0, 10), [onlyAuth]);
  const topBlackjack = useMemo(() => onlyAuth.filter((e) => e.game === 'Blackjack').sort((a, b) => b.score - a.score).slice(0, 10), [onlyAuth]);

  const leaderboardCards = [
    { title: t('riskplay.title'), rows: topRiskPlay },
    { title: t('hrc.title'), rows: topHRC },
    { title: t('blackjack.title'), rows: topBlackjack },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">{t('gamble.landing.title')}</h1>
          <p className="text-muted-foreground text-lg">{t('gamble.landing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Gamepad2 size={22} /> {t('games.title')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/gamble/riskplay"><Button className="w-full bg-gradient-primary">{t('riskplay.title')}</Button></Link>
                <Link to="/gamble/high-risk-clicker"><Button className="w-full bg-gradient-primary">{t('hrc.title')}</Button></Link>
                <Link to="/gamble/blackjack"><Button className="w-full bg-gradient-primary">{t('blackjack.title')}</Button></Link>
              </CardContent>
            </Card>
          </div>

          {/* Professional side-by-side leaderboards */}
          <div className="space-y-6">
            {leaderboardCards.map((lb) => (
              <Card key={lb.title} className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Trophy className="text-primary" size={20} /> {lb.title}</CardTitle>
                  <CardDescription>{t('leaderboard.title')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lb.rows.length === 0 ? (
                      <div className="text-muted-foreground">{t('leaderboard.empty')}</div>
                    ) : (
                      lb.rows.map((entry, idx) => (
                        <div key={entry.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-muted text-muted-foreground'}`}>{idx + 1}</span>
                            <span className="font-medium truncate max-w-[120px]">{entry.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-primary font-bold tabular-nums">{entry.score.toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GambleLobbyPage;