import React, { useEffect } from 'react';

export type LoseBlastProps = {
  show: boolean;
  message?: string;
  onEnd?: () => void;
  durationMs?: number;
};

const LoseBlast: React.FC<LoseBlastProps> = ({ show, message = 'Verloren!', onEnd, durationMs = 1200 }) => {
  useEffect(() => {
    if (!show || !onEnd) return;
    const id = window.setTimeout(() => onEnd?.(), durationMs);
    return () => window.clearTimeout(id);
  }, [show, onEnd, durationMs]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-red-500/10 animate-blink-fade" />
      <div className="flex items-center gap-3">
        <div className="lose-x" />
        <div className="text-4xl md:text-5xl font-extrabold text-red-500 drop-shadow-lg select-none">
          {message}
        </div>
      </div>
    </div>
  );
};

export default LoseBlast;