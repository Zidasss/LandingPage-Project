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

/**
 * Quando o último morcego já pousou, em milissegundos contados do disparo.
 *
 * Sai do próprio bando em vez de ser um número escrito à mão: mexer no atraso
 * ou na duração de voo lá em cima passaria a apagar o bando cedo demais, e o
 * bicho sumiria no ar no meio da travessia.
 */
const FIM_DO_BANDO =
  Math.max(...BANDO.map((m) => m.atraso + m.duracao)) + 200;

export function BatSwarm() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let saida: ReturnType<typeof setTimeout> | undefined;

    // Só começa quando a seção entra na tela — o bando existe para ser visto
    // chegando, e não para ter chegado antes de alguém olhar.
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        node.dataset.chegando = "1";
        observador.disconnect();

        /*
          Depois de pousar, o bando sai do documento.

          A animação termina em opacidade zero, e invisível parecia suficiente —
          não é. Cada morcego continua sendo uma camada que o navegador compõe a
          cada quadro, e são dezenas delas paradas em cima da cena pelo resto da
          visita, num trecho onde ainda se rola bastante. `display: none` tira
          todas de uma vez.

          O prazo é o do morcego mais lento: o maior atraso somado à maior
          duração, com folga. Ele voa uma vez só, então não há volta a esperar.
        */
        saida = setTimeout(() => {
          node.dataset.chegou = "1";
        }, FIM_DO_BANDO);
      },
      { threshold: 0.35 },
    );
    observador.observe(node);
    return () => {
      observador.disconnect();
      clearTimeout(saida);
    };
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
          No celular o bando fica em um terço.

          Cada morcego é uma camada que o navegador compõe a cada quadro, e é a
          contagem de camadas que pesa, não o tamanho delas. Medido: com o bando
          inteiro a travessia da seção da contagem roda a 21,6ms de mediana e
          quatro quadros ruins; sem bando nenhum, 16,7ms e nenhum. Ele era o
          custo da seção inteira, sozinho.

          Um terço porque o que dá sensação de nuvem é a dispersão, não a
          contagem — e trinta e sete bichos espalhados por uma tela de celular
          continuam sendo nuvem.

          O corte é em grupos de seis, e não "um sim, um não", por causa de quem
          vem de onde: os pares entram pela esquerda e os ímpares pela direita,
          então qualquer regra de período par deixaria o bando inteiro entrando
          por um lado só. Em seis sobram os dois primeiros — um de cada lado.
        */
        @media (max-width: 639px) {
          .morcego:nth-child(6n),
          .morcego:nth-child(6n - 1),
          .morcego:nth-child(6n - 2),
          .morcego:nth-child(6n - 3) {
            display: none;
          }
        }

        /* Pousou: sai do documento, e com ele todas as camadas. */
        .bando[data-chegou] {
          display: none;
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
