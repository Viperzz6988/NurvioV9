import React, { useEffect } from 'react';

export type CoinBurstProps = {
  show: boolean;
  onEnd?: () => void;
  durationMs?: number;
};

const CoinBurst: React.FC<CoinBurstProps> = ({ show, onEnd, durationMs = 1000 }) => {
  useEffect(() => {
    if (!show || !onEnd) return;
    const id = window.setTimeout(() => onEnd?.(), durationMs);
    return () => window.clearTimeout(id);
  }, [show, onEnd, durationMs]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
      <div className="coin-burst" />
    </div>
  );
};

export default CoinBurst;