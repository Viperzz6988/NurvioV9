import React from 'react';

export type Suit = '♠' | '♥' | '♦' | '♣';

export interface PlayingCardProps {
  rank: string;
  suit: Suit;
  faceDown?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ rank, suit, faceDown = false, style, className }) => {
  const isRed = suit === '♥' || suit === '♦';
  const suitClass = isRed ? 'bj-card--red' : 'bj-card--black';
  return (
    <div
      className={`bj-card ${suitClass} ${faceDown ? 'bj-card-back' : ''} ${className ?? ''}`}
      style={style}
      aria-label={faceDown ? 'Face down card' : `${rank} ${suit}`}
      aria-hidden={false}
    >
      {!faceDown && (
        <>
          <div className={`bj-card-corner`}>
            <span className="bj-card-rank">{rank}</span>
            <span className="bj-card-suit">{suit}</span>
          </div>
          <div className={`bj-card-corner bj-card-corner-bottom`}>
            <span className="bj-card-rank">{rank}</span>
            <span className="bj-card-suit">{suit}</span>
          </div>
          <div className={`bj-card-center`}>{suit}</div>
        </>
      )}
    </div>
  );
};

export default PlayingCard;