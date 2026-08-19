"use client";

import { useEffect, useRef } from "react";
import { event } from "@/config/event";

/**
 * O bando que vira o morcego grande.
 *
 * Os morcegos entram voando de fora da tela, convergem para o centro e, quando
 * chegam, a arte inteira já está no lugar deles. Não é enfeite passando: o
 * bicho que cruzou a tela é o bicho que ficou — a mesma gramática da abóbora
 * que vira maçaneta.
 *
 * Os sprites são recortes da própria arte, não desenhos à parte, então o bando
 * e a imagem final são literalmente o mesmo traço.
 *
 * As trajetórias são fixas, e não sorteadas: sorteio no render faria servidor e
 * navegador desenharem coisas diferentes, e a hidratação acusaria.
 */

/** De onde cada morcego vem, em vw/vh, e o atraso dele. */
const BANDO = [
  { x: -60, y: -30, giro: -18, escala: 0.9, atraso: 0, sprite: 0 },
  { x: 65, y: -38, giro: 22, escala: 0.7, atraso: 90, sprite: 1 },
  { x: -72, y: 18, giro: 12, escala: 0.55, atraso: 150, sprite: 1 },
  { x: 70, y: 12, giro: -14, escala: 0.85, atraso: 60, sprite: 0 },
  { x: -45, y: -52, giro: 26, escala: 0.5, atraso: 220, sprite: 1 },
  { x: 48, y: -55, giro: -24, escala: 0.62, atraso: 180, sprite: 0 },
  { x: -80, y: -8, giro: 8, escala: 0.75, atraso: 300, sprite: 0 },
  { x: 82, y: -4, giro: -10, escala: 0.45, atraso: 260, sprite: 1 },
  { x: -30, y: -60, giro: 16, escala: 0.4, atraso: 350, sprite: 1 },
  { x: 34, y: -62, giro: -20, escala: 0.52, atraso: 400, sprite: 0 },
];

export function BatSwarm() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Só começa quando a seção entra na tela — o bando existe para ser visto
    // chegando, e não para ter chegado antes de alguém olhar.
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        node.dataset.chegando = "1";
        observador.disconnect();
      },
      { threshold: 0.35 },
    );
    observador.observe(node);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="bando pointer-events-none absolute inset-0">
      {BANDO.map((m, i) => (
        <span
          key={i}
          className="morcego"
          style={
            {
              "--de-x": `${m.x}vw`,
              "--de-y": `${m.y}vh`,
              "--giro": `${m.giro}deg`,
              "--escala": m.escala,
              animationDelay: `${m.atraso}ms, ${m.atraso}ms`,
              backgroundImage: `url(${event.bats.sprites[m.sprite]})`,
            } as React.CSSProperties
          }
        />
      ))}

      <style>{`
        .morcego {
          position: absolute;
          left: 50%;
          top: 46%;
          width: 12vmin;
          aspect-ratio: 153 / 115;
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0;
          /* parados fora da tela até o bando ser disparado */
          transform: translate3d(var(--de-x), var(--de-y), 0) scale(var(--escala));
        }

        .bando[data-chegando] .morcego {
          animation:
            morcego-chega 1150ms cubic-bezier(0.3, 0, 0.2, 1) forwards,
            morcego-bate 260ms ease-in-out 5;
        }

        /* A vinda: de fora da tela até o centro, encolhendo — some ao chegar,
           porque quem fica no lugar dele é a arte inteira. */
        @keyframes morcego-chega {
          0% {
            opacity: 0;
            transform: translate3d(var(--de-x), var(--de-y), 0)
              rotate(var(--giro)) scale(var(--escala));
          }
          12% { opacity: 1; }
          72% { opacity: 1; }
          100% {
            opacity: 0;
            transform: translate3d(-50%, -10%, 0) rotate(0deg) scale(0.14);
          }
        }

        /* O bater de asas é escala horizontal: a silhueta encurta e alarga,
           que é o que se vê num morcego de longe. */
        @keyframes morcego-bate {
          0%, 100% { scale: 1 1; }
          50% { scale: 0.72 1.06; }
        }

        @media (prefers-reduced-motion: reduce) {
          .morcego { display: none; }
        }
      `}</style>
    </div>
  );
}
