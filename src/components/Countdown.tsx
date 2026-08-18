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
      <p className="font-display text-pumpkin text-3xl tracking-tight uppercase">
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
    <dl
      role="timer"
      aria-live="off"
      aria-label="Contagem regressiva para a festa"
      className="flex flex-col gap-1"
    >
      {units.map((unit) => (
        <div
          key={unit.label}
          className="border-bone/15 flex items-baseline justify-between gap-4 border-b pb-1"
        >
          <dt className="font-heading text-ash text-[0.6rem] font-semibold tracking-[0.3em] uppercase">
            {unit.label}
          </dt>
          <dd className="font-mono text-pumpkin text-2xl leading-none tabular-nums">
            {unit.value === undefined
              ? "".padStart(unit.pad, "-")
              : String(unit.value).padStart(unit.pad, "0")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
