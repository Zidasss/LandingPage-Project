"use client";

import { useEffect, useState } from "react";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function diff(target: number): Remaining {
  const ms = target - Date.now();
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
 * O cálculo só roda no cliente (o servidor não sabe o fuso de quem acessa),
 * então o primeiro render mostra placeholders para não quebrar a hidratação.
 */
export function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime();
  const [left, setLeft] = useState<Remaining | null>(null);

  useEffect(() => {
    setLeft(diff(targetMs));
    const id = setInterval(() => setLeft(diff(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

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
            <span
              className="font-mono glow-cyan text-cyan border-cyan/30 bg-crypt/60 rounded-md border px-3 py-2 text-4xl leading-none tabular-nums backdrop-blur-sm sm:px-5 sm:py-3 sm:text-6xl"
              suppressHydrationWarning
            >
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
