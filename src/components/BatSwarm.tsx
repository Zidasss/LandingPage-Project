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
const QUANTIDADE = 110;

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
    // Espalhados pela tela toda, começando mais para dentro (12vw a 66vw): longe
    // demais e o bicho passava o voo fora da tela, deixando o bando ralo.
    x: (daEsquerda ? -1 : 1) * (12 + r() * 54),
    y: -58 + r() * 116, // de cima e de baixo, cobrindo a altura da tela
    giro: (r() - 0.5) * 64, // inclinação de voo
    escala: 0.3 + r() * 0.72, // profundidade: perto e longe
    atraso: Math.round(r() * 520), // stagger que vira um fluxo contínuo
    /*
      Cada um voa no seu tempo. Com duração única o bando chegava em bloco, como
      um slide passando; variando, uns cortam a tela na frente dos outros e é
      isso que faz parecer bicho, e não enfeite sincronizado.
    */
    duracao: Math.round(1250 + r() * 700),
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
              // só a vinda ganha a duração própria; o bater de asas segue no
              // ritmo dele, que é do bicho e não da travessia
              animationDuration: `${m.duracao}ms, 260ms`,
              backgroundImage: `url(${event.bats.sprites[m.sprite]})`,
            } as React.CSSProperties
          }
        />
      ))}

      <style>{`
        .morcego {
          position: absolute;
          left: 50%;
          /* Convergem para a cara do morcego grande, no alto — não para o centro
             da tela. A arte agora é dimensionada pela altura (svh) e a cara fica
             por volta de 21svh; o bando some exatamente ali, virando o bicho. */
          top: 21svh;
          width: 12vmin;
          aspect-ratio: 153 / 115;
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0;
          /* parados fora da tela até o bando ser disparado */
          transform: translate3d(var(--de-x), var(--de-y), 0) scale(var(--escala));
        }

        /*
          No celular o bando é menos denso.

          Cada morcego é uma camada composta, e cento e dez camadas animadas ao
          mesmo tempo é o tipo de conta que passa num computador e cobra caro num
          telefone. Escondendo um a cada três, o bando perde um terço das camadas
          e mantém o volume: o que dá a sensação de nuvem é a dispersão, não a
          contagem exata.
        */
        @media (max-width: 639px) {
          .morcego:nth-child(3n) {
            display: none;
          }
        }

        .bando[data-chegando] .morcego {
          animation:
            morcego-chega 1500ms cubic-bezier(0.3, 0, 0.2, 1) forwards,
            morcego-bate 260ms ease-in-out 6;
        }

        /* A vinda: de fora da tela até a cara do bicho, encolhendo — some só no
           fim, ao chegar, porque quem fica no lugar dele é a arte inteira.
           Ficam visíveis quase o voo todo, para o bando ter volume. */
        @keyframes morcego-chega {
          0% {
            opacity: 0;
            transform: translate3d(var(--de-x), var(--de-y), 0)
              rotate(var(--giro)) scale(var(--escala));
          }
          9% { opacity: 1; }
          86% { opacity: 1; }
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
