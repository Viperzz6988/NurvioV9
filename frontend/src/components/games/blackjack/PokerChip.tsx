import React from 'react';

export interface PokerChipProps {
  denomination: 1 | 5 | 10 | 20 | 50 | 100 | 500 | 1000 | 5000;
  onClick?: (value: number) => void;
  className?: string;
  title?: string;
}

import { animateChipToPotFromElement } from '@/lib/bj-effects';

const PokerChip: React.FC<PokerChipProps> = ({ denomination, onClick, className, title }) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    const el = e.currentTarget;
    // start animation to pot in parallel with placing bet
    animateChipToPotFromElement(el).catch(() => {});
    onClick?.(denomination);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      title={title ?? `${denomination}€`}
      aria-label={`${denomination}€`}
      className={`chip-eur chip-eur-${denomination} ${onClick ? 'hover:scale-105 active:scale-95' : ''} transition-transform ${className ?? ''}`}
    >
      <span className="chip-eur-label">{denomination}</span>
      <span className="chip-eur-euro">€</span>
    </button>
  );
};

export default PokerChip;