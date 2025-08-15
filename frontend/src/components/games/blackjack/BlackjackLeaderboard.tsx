import React from 'react';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import { Card as UICard, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const BlackjackLeaderboard: React.FC = () => {
  const { entries } = useLeaderboard();
  const { t } = useLanguage();

  const blackjackEntries = entries
    .filter((e) => e.game === 'Blackjack')
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <UICard className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">{t('leaderboard.title')} — Blackjack</CardTitle>
      </CardHeader>
      <CardContent>
        {blackjackEntries.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t('leaderboard.empty')}</div>
        ) : (
          <ol className="space-y-2">
            {blackjackEntries.map((e, idx) => (
              <li key={e.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-right tabular-nums text-muted-foreground">{idx + 1}.</span>
                  <span className="font-medium">{e.name}</span>
                </div>
                <div className="font-semibold tabular-nums">€{e.score.toLocaleString()}</div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </UICard>
  );
};

export default BlackjackLeaderboard;