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
      <p className="font-display text-blood text-3xl tracking-tight uppercase">
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
      className="relogio flex items-end justify-center gap-[3vw] sm:gap-8"
    >
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          {/*
            A largura é reservada por quantidade de dígitos, e não deixada por
            conta do texto: a fonte escorrida não tem numeral de largura fixa,
            então a cada tique dos segundos a linha inteira dançaria.
          */}
          <dd
            className="font-drip m-0 text-center leading-[0.9] text-[11vw] sm:text-[5.2vw]"
            style={{ width: `${unit.pad * 0.72 + 0.2}em` }}
          >
            {/*
              A `key` é o próprio número: quando ele muda, o React troca o nó e a
              animação recomeça. É o que faz o tique pingar. Nos dias e horas,
              que mudam de hora em hora, ela quase nunca roda — só os segundos
              pingam de verdade, que é o certo.
            */}
            <span key={unit.value ?? "-"} className="relogio-pingo">
              {unit.value === undefined
                ? "".padStart(unit.pad, "-")
                : String(unit.value).padStart(unit.pad, "0")}
            </span>
          </dd>
          <dt className="font-heading mt-2 text-[0.55rem] font-bold tracking-[0.3em] uppercase sm:text-[0.65rem]">
            {unit.label}
          </dt>
        </div>
      ))}

      <style>{`
        /*
          O número cai e assenta, como a gota da fonte escorrida. Curto e de
          amplitude pequena de propósito: isto roda a cada segundo, e o que é
          bonito uma vez vira tique nervoso se for grande demais.
        */
        .relogio-pingo {
          display: inline-block;
          animation: relogio-pingo 420ms cubic-bezier(0.2, 0.75, 0.25, 1);
        }

        @keyframes relogio-pingo {
          from { transform: translateY(-14%) scaleY(1.10); opacity: 0.25; }
          60%  { transform: translateY(2%) scaleY(0.97); opacity: 1; }
          to   { transform: none; opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .relogio-pingo { animation: none; }
        }
      `}</style>
    </dl>
  );
}
