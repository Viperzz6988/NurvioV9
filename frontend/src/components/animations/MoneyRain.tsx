import React, { useEffect, useMemo } from 'react';

export type MoneyRainProps = {
  show: boolean;
  amountText?: string;
  durationMs?: number;
  onEnd?: () => void;
};

const NUM_ITEMS = 28;

const MoneyRain: React.FC<MoneyRainProps> = ({ show, amountText, durationMs = 1800, onEnd }) => {
  const items = useMemo(() => Array.from({ length: NUM_ITEMS }, (_, i) => i), []);

  useEffect(() => {
    if (!show || !onEnd) return;
    const id = window.setTimeout(() => onEnd?.(), durationMs + 200);
    return () => window.clearTimeout(id);
  }, [show, durationMs, onEnd]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        {items.map((i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 0.6;
          const scale = 0.8 + Math.random() * 0.6;
          const isCoin = Math.random() > 0.45;
          return (
            <div
              key={i}
              className={`absolute top-[-10%] ${isCoin ? 'money-coin' : 'money-bill'}`}
              style={{ left: `${left}%`, animationDelay: `${delay}s`, transform: `scale(${scale})` }}
            />
          );
        })}
      </div>
      {amountText && (
        <div className="relative">
          <div className="money-amount-pop text-5xl md:text-7xl font-extrabold text-green-500 drop-shadow-lg select-none">
            {amountText}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyRain;