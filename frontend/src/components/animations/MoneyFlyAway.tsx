import React, { useEffect } from 'react';

export type MoneyFlyAwayProps = {
  show: boolean;
  onEnd?: () => void;
  durationMs?: number;
};

const MoneyFlyAway: React.FC<MoneyFlyAwayProps> = ({ show, onEnd, durationMs = 1100 }) => {
  useEffect(() => {
    if (!show || !onEnd) return;
    const id = window.setTimeout(() => onEnd?.(), durationMs);
    return () => window.clearTimeout(id);
  }, [show, onEnd, durationMs]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <div className="money-fly-away" />
    </div>
  );
};

export default MoneyFlyAway;