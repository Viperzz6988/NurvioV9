// UI-only visuals for Blackjack table. No game logic modifications.
// Provides: triggerWinAnimation() and cancelAnimations()

const activeAnimations = new Set<Animation>();
const timeouts = new Set<number>();

export async function animateChipToPotFromElement(sourceEl: HTMLElement): Promise<void> {
  const pot = document.getElementById('pot');
  if (!pot) return;
  const chipRect = sourceEl.getBoundingClientRect();
  const potRect = pot.getBoundingClientRect();
  const dx = potRect.left + potRect.width / 2 - (chipRect.left + chipRect.width / 2);
  const dy = potRect.top + potRect.height / 2 - (chipRect.top + chipRect.height / 2);

  const clone = sourceEl.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: 'fixed',
    left: `${chipRect.left}px`,
    top: `${chipRect.top}px`,
    margin: '0',
    zIndex: '9999',
  } as CSSStyleDeclaration);
  clone.classList.add('fly');
  clone.classList.add('bj-temp');
  clone.style.setProperty('--tx', `${dx}px`);
  clone.style.setProperty('--ty', `${dy}px`);
  document.body.appendChild(clone);

  await new Promise<void>((resolve) => {
    const onEnd = () => { clone.removeEventListener('animationend', onEnd); clone.remove(); resolve(); };
    clone.addEventListener('animationend', onEnd);
  });
}

export function triggerWinAnimation(): () => void {
  const table = document.getElementById('bjTable');
  if (!table) return () => {};

  table.classList.add('win');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Confetti
  const pieceCount = reduce ? 0 : 28;
  for (let i = 0; i < pieceCount; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.classList.add('bj-temp');
    c.style.left = `${20 + Math.random() * 60}%`;
    c.style.top = `${-5 - Math.random() * 10}%`;
    c.style.background = `hsl(${Math.floor(Math.random() * 360)} 70% 58%)`;
    c.style.setProperty('--cx', `${((Math.random() - 0.5) * 40).toFixed(0)}px`);
    document.body.appendChild(c);
    const t = window.setTimeout(() => c.remove(), 1400);
    timeouts.add(t);
  }

  // Toss a few chips upward for celebration
  const chipBank = document.getElementById('chipBank');
  if (chipBank && !reduce) {
    const sample = chipBank.querySelector('.chip-eur') as HTMLElement | null;
    if (sample) {
      for (let i = 0; i < 6; i++) {
        const clone = sample.cloneNode(true) as HTMLElement;
        clone.style.position = 'fixed';
        const rect = sample.getBoundingClientRect();
        clone.style.left = `${rect.left + Math.random() * 50}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.zIndex = '9999';
        clone.classList.add('bj-temp');
        document.body.appendChild(clone);

        const dx = (Math.random() * 200 - 100) | 0;
        const dy = (-300 - Math.random() * 120) | 0;
        const rot = (Math.random() * 720 - 360) | 0;

        const anim = clone.animate(
          [
            { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.5)`, opacity: 0.9 },
          ],
          { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(.2,.9,.3,1)' }
        );
        anim.onfinish = () => clone.remove();
        activeAnimations.add(anim);
        anim.finished.finally(() => activeAnimations.delete(anim));
      }
    }
  }

  const t2 = window.setTimeout(() => table.classList.remove('win'), 1200);
  timeouts.add(t2);

  return cancelAnimations;
}

export function cancelAnimations(): void {
  for (const a of activeAnimations) {
    try { a.cancel(); } catch { /* noop */ }
  }
  activeAnimations.clear();

  for (const id of timeouts) window.clearTimeout(id);
  timeouts.clear();

  document.querySelectorAll('.confetti').forEach((n) => n.remove());
  document.getElementById('bjTable')?.classList.remove('win');
  // Remove any stray temp elements (chips/confetti)
  document.querySelectorAll('.bj-temp, .chip-eur.fly').forEach((n) => n.remove());
}