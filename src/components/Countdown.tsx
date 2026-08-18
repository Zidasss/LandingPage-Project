"use client";

import { useSyncExternalStore } from "react";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

/**
 * Relógio compartilhado: um único setInterval alimenta todos os assinantes,
 * e o valor fica em cache para que a leitura seja estável entre renders.
 */
const clock = (() => {
  let now = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<() => void>();

  const tick = () => {
    now = Date.now();
    for (const listener of listeners) listener();
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (!timer) {
        tick();
        timer = setInterval(tick, 1000);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && timer) {
          clearInterval(timer);
          timer = null;
        }
      };
    },
    /** No cliente: o instante do último tique. */
    getSnapshot: () => now,
    /** No servidor: 0, para o HTML sair com os placeholders. */
    getServerSnapshot: () => 0,
  };
})();

function remainingUntil(target: number, now: number): Remaining | null {
  if (now === 0) return null; // ainda não hidratou
  const ms = target - now;
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: false,
  };
}

/**
 * Contagem regressiva até a festa.
 * O servidor não sabe que horas são para quem acessa, então o primeiro
 * render mostra traços e os números entram assim que a página hidrata.
 */
export function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime();
  const now = useSyncExternalStore(
    clock.subscribe,
    clock.getSnapshot,
    clock.getServerSnapshot,
  );
  const left = remainingUntil(targetMs, now);

  if (left?.done) {
    return (
      <p className="font-heading glow-magenta text-magenta text-2xl tracking-[0.2em] uppercase sm:text-3xl">
        A festa começou
      </p>
    );
  }

  const units = [
    { label: "dias", value: left?.days, pad: 3 },
    { label: "horas", value: left?.hours, pad: 2 },
    { label: "min", value: left?.minutes, pad: 2 },
    { label: "seg", value: left?.seconds, pad: 2 },
  ];

  return (
    <div
      className="flex items-end justify-center gap-2 sm:gap-4"
      role="timer"
      aria-live="off"
      aria-label="Contagem regressiva para a festa"
    >
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-end gap-2 sm:gap-4">
          <div className="flex flex-col items-center">
            <span className="font-mono glow-cyan text-cyan border-cyan/30 bg-crypt/60 rounded-md border px-3 py-2 text-4xl leading-none tabular-nums backdrop-blur-sm sm:px-5 sm:py-3 sm:text-6xl">
              {unit.value === undefined
                ? "".padStart(unit.pad, "-")
                : String(unit.value).padStart(unit.pad, "0")}
            </span>
            <span className="font-heading text-ash mt-2 text-[0.6rem] tracking-[0.35em] uppercase sm:text-xs">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="text-magenta animate-pulse-glow mb-8 hidden text-3xl leading-none sm:inline sm:text-5xl">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
