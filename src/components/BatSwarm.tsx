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

/** Quantos morcegos cruzam a tela. */
const QUANTIDADE = 28;

/**
 * Gerador pseudoaleatório com semente fixa (mulberry32).
 *
 * O bando precisa parecer disperso, mas sorteio de verdade no render faria
 * servidor e cliente desenharem posições diferentes e a hidratação acusaria.
 * Uma semente fixa dá a mesma sequência nos dois lados: aleatório aos olhos,
 * determinístico na prática.
 */
function semeado(semente: number): () => number {
  return () => {
    semente |= 0;
    semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cada morcego entra de fora da tela e converge para o centro. Metade vem da
 * esquerda, metade da direita, alternadas, para o bando não pesar de um lado só.
 */
const BANDO = Array.from({ length: QUANTIDADE }, (_, i) => {
  const r = semeado(i * 97 + 13);
  const daEsquerda = i % 2 === 0;
  return {
    x: (daEsquerda ? -1 : 1) * (42 + r() * 48), // 42vw a 90vw de distância
    y: -68 + r() * 78, // espalhado no eixo vertical
    giro: (r() - 0.5) * 64, // inclinação de voo
    escala: 0.32 + r() * 0.7, // profundidade: perto e longe
    atraso: Math.round(r() * 620), // ninguém chega no mesmo instante
    sprite: i % 2, // alterna os dois recortes
  };
});

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
