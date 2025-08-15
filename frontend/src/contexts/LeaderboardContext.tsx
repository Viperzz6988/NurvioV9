import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export type LeaderboardEntry = {
  id: string;
  userId?: string;
  name: string;
  game: 'RiskPlay' | 'HighRiskClicker' | 'Blackjack' | 'Wheel' | 'Tetris' | 'Snake';
  score: number; // amount or clicks
  date: string; // ISO
};

export type LeaderboardContextValue = {
  entries: LeaderboardEntry[];
  addEntry: (entry: Omit<LeaderboardEntry, 'id' | 'date' | 'name' | 'userId'>) => void;
  clearAll: () => void;
  refresh: () => Promise<void>;
};

const LeaderboardContext = createContext<LeaderboardContextValue | undefined>(undefined);

export const useLeaderboard = (): LeaderboardContextValue => {
  const ctx = useContext(LeaderboardContext);
  if (!ctx) throw new Error('useLeaderboard must be used within LeaderboardProvider');
  return ctx;
};

const GUEST_SCORES_KEY = 'guest_scores_v1';

export const LeaderboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const readGuest = (): LeaderboardEntry[] => {
    try {
      const raw = sessionStorage.getItem(GUEST_SCORES_KEY);
      const list = raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  };

  const writeGuest = (list: LeaderboardEntry[]) => {
    try { sessionStorage.setItem(GUEST_SCORES_KEY, JSON.stringify(list)); } catch { /* ignore */ }
  };

  const refresh = async () => {
    const { data } = await api<LeaderboardEntry[]>(`/leaderboard`);
    const serverEntries = Array.isArray(data) ? data : [];
    const guestEntries = readGuest();
    setEntries([...guestEntries, ...serverEntries]);
  };

  useEffect(() => {
    refresh();
  }, [user?.id]);

  const addEntry: LeaderboardContextValue['addEntry'] = async (entry) => {
    if (!user || user.isGuest) {
      const newEntry: LeaderboardEntry = {
        id: `${Date.now()}-${entry.game}`,
        name: 'Guest',
        game: entry.game,
        score: entry.score,
        date: new Date().toISOString(),
      };
      const current = readGuest();
      const updated = [newEntry, ...current].slice(0, 100);
      writeGuest(updated);
      setEntries((prev) => [newEntry, ...prev]);
      return;
    }
    await api(`/leaderboard`, { method: 'POST', body: JSON.stringify({ game: entry.game, score: entry.score }) });
    await refresh();
  };

  const clearAll = () => {
    if (!user || user.isGuest) {
      sessionStorage.removeItem(GUEST_SCORES_KEY);
    }
    setEntries([]);
  };

  const value = useMemo<LeaderboardContextValue>(() => ({ entries, addEntry, clearAll, refresh }), [entries]);

  return <LeaderboardContext.Provider value={value}>{children}</LeaderboardContext.Provider>;
};