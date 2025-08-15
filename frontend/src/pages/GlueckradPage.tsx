import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

// Fresh wheel colors adapted for readability
const baseColors = ['#2563eb','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#eab308','#f97316','#22c55e','#3b82f6','#db2777'];

type Segment = { id: string; label: string; color: string };

const GlueckradPage: React.FC = () => {
  const { t } = useLanguage();
  const [segments, setSegments] = useState<Segment[]>([
    { id: '1', label: 'Janis', color: baseColors[0] },
    { id: '2', label: 'Max', color: baseColors[1] },
    { id: '3', label: 'Moritz', color: baseColors[2] },
    { id: '4', label: 'Anna', color: baseColors[3] },
    { id: '5', label: 'Tom', color: baseColors[4] },
    { id: '6', label: 'Lisa', color: baseColors[5] },
  ]);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<Segment | null>(null);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [newEntry, setNewEntry] = useState<string>('');
  const wheelContainerRef = useRef<HTMLDivElement | null>(null);
  const [wheelSize, setWheelSize] = useState<number>(420);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (!wheelContainerRef.current) return;
      const width = wheelContainerRef.current.clientWidth;
      const size = Math.max(260, Math.min(width, 560));
      setWheelSize(size);
    });
    if (wheelContainerRef.current) ro.observe(wheelContainerRef.current);
    return () => ro.disconnect();
  }, []);

  const spin = () => {
    if (segments.length < 2 || isSpinning) return;
    setIsSpinning(true);
    setWinner(null);
    setWinningIndex(null);

    const total = segments.length;
    const segmentSize = 360 / total;

    const start = rotation;
    const normalizedStart = ((start % 360) + 360) % 360;

    const winnerIndex = Math.floor(Math.random() * total);
    const winnerCenterAngle = winnerIndex * segmentSize + segmentSize / 2;
    // Pointer at right, pointing left (0deg axis)
    const alignment = 0 - winnerCenterAngle; // align winner center to 0deg (rightmost)

    const extraSpins = 360 * (4 + Math.floor(Math.random() * 3));
    const deltaToAlign = ((alignment - normalizedStart) % 360 + 360) % 360;
    const target = start + extraSpins + deltaToAlign;

    const duration = 3600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * ease;
      setRotation(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const selected = segments[winnerIndex];
        setWinner(selected);
        setWinningIndex(winnerIndex);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const addSegment = () => {
    if (!newEntry.trim()) return;
    const next: Segment = { id: String(Date.now()), label: newEntry.trim(), color: baseColors[segments.length % baseColors.length] };
    setSegments((prev) => [...prev, next]);
    setNewEntry('');
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 2) return;
    setSegments((prev) => prev.filter((s) => s.id !== id));
  };

  const reset = () => {
    setSegments([
      { id: '1', label: 'Janis', color: baseColors[0] },
      { id: '2', label: 'Max', color: baseColors[1] },
      { id: '3', label: 'Moritz', color: baseColors[2] },
      { id: '4', label: 'Anna', color: baseColors[3] },
      { id: '5', label: 'Tom', color: baseColors[4] },
      { id: '6', label: 'Lisa', color: baseColors[5] },
    ]);
    setRotation(0);
    setWinner(null);
    setWinningIndex(null);
  };

  const renderWheel = () => {
    const size = wheelSize;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.4;
    const radPerSeg = (2 * Math.PI) / segments.length;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl">
        <defs>
          <filter id="shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.2"/></filter>
        </defs>
        <g transform={`rotate(${rotation} ${cx} ${cy})`} filter="url(#shadow)">
          {segments.map((seg, i) => {
            const a1 = i * radPerSeg;
            const a2 = a1 + radPerSeg;
            const x1 = cx + radius * Math.cos(a1);
            const y1 = cy + radius * Math.sin(a1);
            const x2 = cx + radius * Math.cos(a2);
            const y2 = cy + radius * Math.sin(a2);
            const largeArc = radPerSeg > Math.PI ? 1 : 0;
            const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            const mid = a1 + radPerSeg / 2;
            const lx = cx + (radius * 0.65) * Math.cos(mid);
            const ly = cy + (radius * 0.65) * Math.sin(mid);
            const fontSize = Math.max(11, Math.min(16, size * 0.035));
            return (
              <g key={seg.id}>
                <path d={d} fill={seg.color} stroke="#fff" strokeWidth={2} />
                {winningIndex === i && (
                  <path d={d} fill="none" stroke="#fff" strokeWidth={4} className="wheel-segment-highlight" />
                )}
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fontWeight="bold" fill="#fff">
                  {seg.label}
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={size * 0.042} fill="#fff" stroke="#333" strokeWidth={2} />
        </g>
      </svg>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">{t('random.wheel.title')}</h1>
          <p className="text-muted-foreground">{t('random.wheel.description')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader className="text-center">
                <CardTitle>{t('random.wheel.title')}</CardTitle>
                <CardDescription>{t('random.wheel.instructions')}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <div className="relative w-full" ref={wheelContainerRef}>
                  {/* Right-side pointer replaced with left-pointing arrow */}
                  <div className="absolute inset-0 flex items-center justify-end pointer-events-none" style={{ height: wheelSize }}>
                    <svg width="36" height="36" className="-mr-3">
                      <path d="M28 18 H8 L14 12 M8 18 L14 24" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-center" style={{ height: wheelSize }}>
                    {renderWheel()}
                    {/* Winner flash pulse */}
                    {winner && <div className="wheel-win-flash" />}
                    {/* Subtle sparkles near the pointer */}
                    {winner && <div className="wheel-sparkles" aria-hidden />}
                  </div>
                </div>
                <Button onClick={spin} disabled={isSpinning || segments.length < 2} className="bg-gradient-primary px-8 py-5">
                  {isSpinning ? t('random.wheel.spinning') : t('random.wheel.spin')}
                </Button>
                {winner && (
                  <div className="glass-card p-5 text-center">
                    <div className="text-sm text-muted-foreground mb-1">{t('random.wheel.result')}</div>
                    <div className="text-2xl font-bold">{winner.label}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('random.wheel.add')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={newEntry} onChange={(e) => setNewEntry(e.target.value)} placeholder={t('random.wheel.addPlaceholder')} onKeyDown={(e) => e.key === 'Enter' && addSegment()} maxLength={28} />
                  <Button onClick={addSegment} disabled={!newEntry.trim()}>+</Button>
                </div>
                <div className="text-xs text-muted-foreground">{segments.length} {t('random.wheel.optionsCount')}</div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('random.wheel.currentOptions')}</CardTitle>
                <CardDescription>{t('random.wheel.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {segments.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded bg-muted/40">
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full" style={{ background: s.color }} />
                        <span className="truncate">{s.label}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeSegment(s.id)} disabled={segments.length <= 2}>×</Button>
                    </div>
                  ))}
                </div>
                <Button onClick={reset} variant="outline" size="sm" className="mt-3">{t('random.wheel.reset')}</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlueckradPage;