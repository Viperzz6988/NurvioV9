import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [targetUserId, setTargetUserId] = useState('');
  const [game, setGame] = useState('Blackjack');
  const [score, setScore] = useState<number>(0);
  const [balance, setBalance] = useState<number>(1000);
  const [audit, setAudit] = useState<any[]>([]);

  const isAdmin = user?.role === 'admin';

  const refreshAudit = async () => {
    const { data } = await api<any[]>(`/admin/audit?limit=50`);
    setAudit(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (isAdmin) refreshAudit();
  }, [isAdmin]);

  if (!isAdmin) {
    return <div className="max-w-5xl mx-auto p-6">Forbidden</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Set Leaderboard Score</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input placeholder="Target User ID" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} />
          <select className="border rounded px-3 py-2" value={game} onChange={(e) => setGame(e.target.value)}>
            <option>RiskPlay</option>
            <option>HighRiskClicker</option>
            <option>Blackjack</option>
            <option>Tetris</option>
            <option>Snake</option>
          </select>
          <Input placeholder="Score" type="number" value={score} onChange={(e) => setScore(parseInt(e.target.value || '0', 10))} />
          <Button onClick={async () => { await api(`/admin/leaderboard/set`, { method: 'POST', body: JSON.stringify({ userId: targetUserId, game, score }) }); refreshAudit(); }}>Apply</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Set Blackjack Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input placeholder="Target User ID" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} />
          <Input placeholder="Amount" type="number" value={balance} onChange={(e) => setBalance(parseInt(e.target.value || '0', 10))} />
          <Button onClick={async () => { await api(`/admin/blackjack/set_balance`, { method: 'POST', body: JSON.stringify({ userId: targetUserId, amount: balance }) }); refreshAudit(); }}>Apply</Button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Recent Admin Actions</h2>
        <div className="border rounded p-3 space-y-2 max-h-[400px] overflow-auto text-sm">
          {audit.map((row) => (
            <div key={row.id} className="flex items-center justify-between border-b last:border-0 pb-2">
              <div>
                <div className="font-mono text-xs text-muted-foreground">#{row.id} · {row.created_at}</div>
                <div>{row.action} — admin {row.admin_user_id} target {row.target_user_id || '-'} game {row.game || '-'} details {row.details ? JSON.stringify(row.details) : '-'}</div>
              </div>
              <div className="text-xs">{row.ip_address}</div>
            </div>
          ))}
          {audit.length === 0 && <div className="text-muted-foreground">No actions</div>}
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;