import React, { useEffect, useMemo, useState } from 'react';
import { Card as UICard, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CoinBurst from '@/components/animations/CoinBurst';
import LoseBlast from '@/components/animations/LoseBlast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import PlayingCard from './blackjack/PlayingCard';
import PokerChip from './blackjack/PokerChip';
import BlackjackLeaderboard from './blackjack/BlackjackLeaderboard';
import '@/styles/blackjack-table.css';
import { triggerWinAnimation, cancelAnimations } from '@/lib/bj-effects';

export type Suit = '♠' | '♥' | '♦' | '♣';
interface PlayingCardType { suit: Suit; rank: string; value: number; }

type RoundState = 'idle' | 'player-turn' | 'dealer-turn' | 'finished';

type ResultKey =
  | 'blackjack.msg.playerBust'
  | 'blackjack.msg.dealerBust'
  | 'blackjack.msg.playerWin'
  | 'blackjack.msg.dealerWin'
  | 'blackjack.msg.push';

const CHIP_SET: Array<1 | 5 | 10 | 20 | 50 | 100 | 500 | 1000 | 5000> = [1, 5, 10, 20, 50, 100, 500, 1000, 5000];

export default function BlackjackGame(): JSX.Element {
  const { t } = useLanguage();
  const { addEntry } = useLeaderboard();

  const [deck, setDeck] = useState<PlayingCardType[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCardType[]>([]);
  const [playerHands, setPlayerHands] = useState<PlayingCardType[][]>([[]]);
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0);

  const [state, setState] = useState<RoundState>('idle');
  const [resultKey, setResultKey] = useState<ResultKey | ''>('');
  const [winFx, setWinFx] = useState(false);
  const [loseFx, setLoseFx] = useState(false);

  // Bankroll & bets
  const [balance, setBalance] = useState<number>(1000);
  const [pendingBet, setPendingBet] = useState<number>(0);
  const [betsPerHand, setBetsPerHand] = useState<number[]>([0]);

  const resetBankroll = () => {
    setBalance(1000);
    setPendingBet(0);
    setBetsPerHand([0]);
    setDeck([]);
    setDealerHand([]);
    setPlayerHands([[]]);
    setActiveHandIndex(0);
    setState('idle');
    setResultKey('');
    setWinFx(false);
    setLoseFx(false);
    cancelAnimations();
  };

  const buildDeck = (): PlayingCardType[] => {
    const suits: Suit[] = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const values: Record<string, number> = { A: 11, J: 10, Q: 10, K: 10 } as const;
    const newDeck: PlayingCardType[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        newDeck.push({ suit, rank, value: values[rank] ?? Number(rank) });
      }
    }
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  const handTotal = (hand: PlayingCardType[]): number => {
    let total = hand.reduce((sum, c) => sum + c.value, 0);
    let aces = hand.filter((c) => c.rank === 'A').length;
    while (total > 21 && aces > 0) {
      total -= 10; // Ace as 1 instead of 11
      aces -= 1;
    }
    return total;
  };

  const dealTo = (count: number, setter: React.Dispatch<React.SetStateAction<PlayingCardType[]>>): void => {
    setDeck((prev) => {
      const next = [...prev];
      const drawn = next.splice(0, count);
      setter((hand) => [...hand, ...drawn]);
      return next;
    });
  };

  const dealToPlayerHand = (handIdx: number, count: number) => {
    setDeck((prev) => {
      const next = [...prev];
      const drawn = next.splice(0, count);
      setPlayerHands((hands) => hands.map((h, i) => (i === handIdx ? [...h, ...drawn] : h)));
      return next;
    });
  };

  const canSplit = (): boolean => {
    if (state !== 'player-turn') return false;
    const hand = playerHands[activeHandIndex];
    if (!hand || hand.length !== 2) return false;
    return hand[0].rank === hand[1].rank && balance >= betsPerHand[activeHandIndex];
  };

  const canDouble = (): boolean => {
    if (state !== 'player-turn') return false;
    return balance >= betsPerHand[activeHandIndex] && playerHands[activeHandIndex].length === 2;
  };

  const startRound = () => {
    if (state !== 'idle' && state !== 'finished') return;
    if (pendingBet <= 0 || balance < pendingBet) return;

    setResultKey('');
    setWinFx(false);
    setLoseFx(false);

    // Deduct stake and lock to first hand
    setBalance((prev) => prev - pendingBet);
    setBetsPerHand([pendingBet]);
    setPendingBet(0);

    const fresh = buildDeck();
    setDeck(fresh);
    setDealerHand([]);
    setPlayerHands([[]]);
    setActiveHandIndex(0);
    setState('player-turn');

    setTimeout(() => dealToPlayerHand(0, 2), 0);
    setTimeout(() => dealTo(2, setDealerHand), 0);
  };

  const hit = () => {
    if (state !== 'player-turn') return;
    dealToPlayerHand(activeHandIndex, 1);
  };

  const stand = () => {
    if (state !== 'player-turn') return;
    const nextIdx = activeHandIndex + 1;
    if (nextIdx < playerHands.length) {
      setActiveHandIndex(nextIdx);
    } else {
      setState('dealer-turn');
    }
  };

  const doubleDown = () => {
    if (!canDouble()) return;
    const extra = betsPerHand[activeHandIndex];
    setBalance((b) => b - extra);
    setBetsPerHand((bp) => bp.map((v, i) => (i === activeHandIndex ? v + extra : v)));
    dealToPlayerHand(activeHandIndex, 1);
    // After one card, auto-stand this hand
    setTimeout(() => stand(), 300);
  };

  const split = () => {
    if (!canSplit()) return;
    setPlayerHands((hands) => {
      const target = hands[activeHandIndex];
      const second = target[1];
      const first = [target[0]];
      const newHands = hands.slice();
      newHands[activeHandIndex] = first;
      newHands.splice(activeHandIndex + 1, 0, [second]);
      return newHands;
    });
    setBetsPerHand((bp) => {
      const stake = bp[activeHandIndex];
      setBalance((b) => b - stake);
      const next = bp.slice();
      next.splice(activeHandIndex + 1, 0, stake);
      return next;
    });
    // Deal one card to each split hand
    setTimeout(() => {
      dealToPlayerHand(activeHandIndex, 1);
      dealToPlayerHand(activeHandIndex + 1, 1);
    }, 0);
  };

  // Auto-finish hand if bust
  useEffect(() => {
    if (state !== 'player-turn') return;
    const total = handTotal(playerHands[activeHandIndex]);
    if (total > 21) {
      const nextIdx = activeHandIndex + 1;
      if (nextIdx < playerHands.length) {
        setActiveHandIndex(nextIdx);
      } else {
        setResultKey('blackjack.msg.playerBust');
        setLoseFx(true);
        setState('dealer-turn');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerHands, activeHandIndex, state]);

  // Dealer play and resolve all hands
  useEffect(() => {
    if (state !== 'dealer-turn') return;

    const dealerPlay = () => {
      const total = handTotal(dealerHand);
      if (total < 17) {
        dealTo(1, setDealerHand);
        return;
      }

      // Resolve payouts per hand
      const dealerScore = handTotal(dealerHand);
      let totalPayout = 0;
      playerHands.forEach((hand, idx) => {
        const playerScore = handTotal(hand);
        const stake = betsPerHand[idx] ?? 0;
        if (playerScore > 21) {
          // lose
        } else if (dealerScore > 21 || playerScore > dealerScore) {
          // win 1:1
          totalPayout += stake * 2;
        } else if (playerScore === dealerScore) {
          // push
          totalPayout += stake;
        } else {
          // lose
        }
      });

      if (totalPayout > 0) {
        setBalance((b) => b + totalPayout);
      }

      // Leaderboard update on net winnings (payout - total stakes)
      const totalStake = betsPerHand.reduce((s, v) => s + v, 0);
      const net = totalPayout - totalStake;
      if (net > 0) {
        addEntry({ game: 'Blackjack', score: net });
        setWinFx(true);
        setResultKey('blackjack.msg.playerWin');
      } else if (net === 0) {
        setResultKey('blackjack.msg.push');
      } else {
        setLoseFx(true);
        setResultKey('blackjack.msg.dealerWin');
      }

      setState('finished');
    };

    const id = setTimeout(dealerPlay, 650);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, dealerHand]);

  // Betting helpers
  const placeChip = (denom: number) => {
    if (state !== 'idle' && state !== 'finished') return;
    if (denom <= 0) return;
    if (balance <= 0 || pendingBet + denom > balance) return;
    setPendingBet((v) => v + denom);
  };

  const clearBet = () => {
    if (state !== 'idle' && state !== 'finished') return;
    setPendingBet(0);
  };

  const chipBreakdown = useMemo(() => {
    const breakdown: { denom: number; count: number }[] = [];
    let remaining = pendingBet;
    for (const d of [...CHIP_SET].sort((a, b) => b - a)) {
      const cnt = Math.floor(remaining / d);
      if (cnt > 0) breakdown.push({ denom: d, count: cnt });
      remaining -= cnt * d;
    }
    return breakdown;
  }, [pendingBet]);

  // UI helpers
  const canDeal = state === 'idle' || state === 'finished';
  const showWinGlow = winFx && (state === 'finished' || !!resultKey);

  // trigger table win animation when we have a net win
  useEffect(() => {
    if (winFx) {
      const cancel = triggerWinAnimation();
      return () => cancel();
    }
    return () => cancelAnimations();
  }, [winFx]);

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => cancelAnimations();
  }, []);

  return (
    <div className="space-y-6">
      <CoinBurst show={winFx} onEnd={() => setWinFx(false)} />
      <LoseBlast show={loseFx} message={t('animations.lose')} onEnd={() => setLoseFx(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table */}
        <div className="lg:col-span-3 flex justify-center">
          <UICard className="glass-card p-0 overflow-hidden w-full max-w-5xl">
            <CardContent className="p-0">
              <div className="bj-table relative" id="bjTable"><div className="table-rim">
                {showWinGlow && <div className="bj-win-glow" />}
                {/* Dealer Area */}
                <div className="dealer-area">
                  <div className="deck-stack" aria-label="deck" />
                  <div className="dealer-cards hand dealer-hand" id="dealerHand" aria-live="polite" aria-atomic="true">
                    {dealerHand.map((c, idx) => (
                      <div key={idx} className="card-deal" style={{ animationDelay: `${idx * 90}ms` }}>
                        <PlayingCard rank={c.rank} suit={c.suit} faceDown={state === 'player-turn' && idx === 0} />
                      </div>
                    ))}
                  </div>
                  <div className="dealer-score" id="dealerScore">
                    {state !== 'player-turn' && dealerHand.length > 0 && (
                      <span className="badge-score">{handTotal(dealerHand)}</span>
                    )}
                  </div>
                </div>

                {/* Player Area with up to 2 hands after split */}
                <div className="player-area"><div className="pot" id="pot" aria-hidden="true"></div>
                  <div className="player-hands" id="playerHand" aria-live="polite" aria-atomic="true">
                    {playerHands.map((hand, idx) => (
                      <div key={idx} className={`player-hand ${idx === activeHandIndex && state === 'player-turn' ? 'active' : ''}`}>
                        <div className="bet-spot" />
                        <div className="hand-cards">
                          {hand.map((c, cidx) => (
                            <div key={cidx} className="card-deal" style={{ animationDelay: `${cidx * 90}ms` }}>
                              <PlayingCard rank={c.rank} suit={c.suit} />
                            </div>
                          ))}
                        </div>
                        <div className="hand-score">
                          <span className="badge-score">{handTotal(hand)}</span>
                        </div>
                        {/* Bets for this hand when locked in */}
                        {state !== 'idle' && state !== 'finished' && (betsPerHand[idx] ?? 0) > 0 && (
                          <div className="chip-stack-area">
                            {Array.from({ length: Math.min(Math.floor((betsPerHand[idx] ?? 0) / 1), 12) }).slice(0, 6).map((_, i) => (
                              <div key={i} className="chip-stack-layer" style={{ bottom: `${i * 6}px`, transform: `translateY(${(6 - i) * 0.5}px)` }} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="controls">
                    <div className="controls-row">
                      <Button onClick={hit} disabled={state !== 'player-turn'} variant="secondary">{t('blackjack.cta.hit')}</Button>
                      <Button onClick={stand} disabled={state !== 'player-turn'} variant="secondary">{t('blackjack.cta.stand')}</Button>
                      <Button onClick={doubleDown} disabled={!canDouble()} variant="secondary">{t('blackjack.cta.double')}</Button>
                      <Button onClick={split} disabled={!canSplit()} variant="secondary">{t('blackjack.cta.split')}</Button>
                    </div>

                    <div className="status-row">
                      <div className="font-semibold">{t('blackjack.balance')}: <span className="text-primary">€{balance.toLocaleString()}</span></div>
                      <div className="font-semibold">{t('blackjack.currentBet')}: <span className="text-primary">€{pendingBet.toLocaleString()}</span></div>
                      {resultKey && <div className="ml-auto text-sm">{t(resultKey)}</div>}
                    </div>

                    {/* Betting chips */}
                    <div className="chips-row" id="chipBank" role="toolbar" aria-label="Bet chips">
                      {CHIP_SET.map((d) => (
                        <PokerChip key={d} denomination={d} onClick={placeChip} />
                      ))}
                      <Button onClick={clearBet} variant="outline" size="sm">{t('blackjack.clearBet')}</Button>
                      <Button onClick={resetBankroll} variant="secondary" size="sm">{t('riskplay.reset')}</Button>
                      <Button onClick={startRound} disabled={!canDeal || pendingBet <= 0 || pendingBet > balance} className="ml-auto bg-gradient-primary">
                        {t('blackjack.placeBetAndDeal')}
                      </Button>
                    </div>

                    {/* Visual chip breakdown stack for pending bet */}
                    {pendingBet > 0 && (
                      <div className="pending-bet-stack">
                        {chipBreakdown.map(({ denom, count }) => (
                          <div key={denom} className="flex items-end gap-1">
                            {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
                              <div key={i} className={`chip-eur chip-eur-${denom}`} style={{ bottom: `${i * 6}px`, transform: `translateY(${(6 - i) * 0.5}px)` }}>
                                <span className="chip-eur-label">{denom}</span>
                                <span className="chip-eur-euro">€</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div></div>
            </CardContent>
          </UICard>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-1">
          <BlackjackLeaderboard />
        </div>
      </div>
    </div>
  );
}