"use client";

import { useEffect, useRef } from "react";
import { event } from "@/config/event";

/**
 * A despedida — a última tela da página.
 *
 * A casa em chamas subiu para a contagem regressiva, que é onde ela tem o que
 * fazer: lá existe rolagem para o fogo pegar e a espera que ele ilustra. Aqui
 * embaixo sobrou o que vem **depois** de um incêndio: o vermelho, as brasas
 * subindo no escuro e o recado.
 *
 * Repetir a casa aqui seria contar a mesma coisa duas vezes na mesma página —
 * e a segunda vez é sempre a mais fraca. Uma tela de texto sobre brasa fecha
 * sem competir.
 *
 * O texto chega com a rolagem, e chega quente: entra na cor da brasa, com o
 * clarão em volta, e vai virando osso conforme assenta. É a mesma gramática do
 * resto do site — a coisa acontece, não aparece.
 */

/**
 * As brasas que sobem. Posições fixas, e não sorteadas: sorteio no render faria
 * servidor e navegador desenharem coisas diferentes, e a hidratação acusaria.
 *
 * São mais espalhadas do que as da casa: aqui não há fogo na tela, então elas
 * precisam vir de todo o pé da página para ler como rescaldo, e não como um
 * foco de incêndio fora de quadro.
 */
const BRASAS = [
  { x: 8, atraso: 0, dur: 7.4, desvio: 3, tam: 2 },
  { x: 17, atraso: 3.1, dur: 8.6, desvio: -4, tam: 3 },
  { x: 26, atraso: 1.4, dur: 6.9, desvio: 2, tam: 2 },
  { x: 34, atraso: 5.2, dur: 9.1, desvio: -3, tam: 2 },
  { x: 43, atraso: 2.3, dur: 7.7, desvio: 4, tam: 3 },
  { x: 51, atraso: 6.8, dur: 8.2, desvio: -2, tam: 2 },
  { x: 59, atraso: 0.9, dur: 9.4, desvio: 3, tam: 2 },
  { x: 68, atraso: 4.1, dur: 7.1, desvio: -5, tam: 3 },
  { x: 77, atraso: 2.7, dur: 8.8, desvio: 2, tam: 2 },
  { x: 88, atraso: 5.9, dur: 7.6, desvio: -3, tam: 2 },
] as const;

/** Prende um número entre 0 e 1. */
function entre0e1(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function FireSection() {
  const secao = useRef<HTMLElement>(null);

  useEffect(() => {
    const alvo = secao.current;
    if (!alvo) return;

    const acender = (v: number) => alvo.style.setProperty("--acende", v.toFixed(3));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      acender(1);
      return;
    }

    let frame = 0;
    let ultimo = -1;
    let perto = false;

    const desenhar = () => {
      frame = 0;
      const caixa = alvo.getBoundingClientRect();
      /*
        O texto assenta enquanto a seção sobe: começa a chegar quando o topo
        dela entra na tela e está inteiro quando a rolagem acaba.

        O fim da conta é o *repouso* — onde o topo desta seção para quando a
        página chegou ao fundo — e não zero. Esta é a última seção e ela é mais
        baixa que a tela: o topo dela nunca alcança o alto do viewport, para
        numa altura que depende do tamanho da janela. Medindo contra zero, a
        conta saturava em dois terços e o recado final da página ficava para
        sempre meio transparente e meio cor de brasa.

        Em degraus, porque cada mudança repinta o brilho do título.
      */
      const repouso = Math.max(
        0,
        alvo.offsetTop -
          (document.documentElement.scrollHeight - window.innerHeight),
      );
      const inicio = window.innerHeight * 0.92;
      const curso = inicio - repouso;
      const bruto = curso > 0 ? (inicio - caixa.top) / curso : 1;
      const passo = Math.round(entre0e1(bruto) * 24);
      if (passo === ultimo) return;
      ultimo = passo;
      acender(passo / 24);
    };

    const aoRolar = () => {
      if (perto && !frame) frame = requestAnimationFrame(desenhar);
    };

    const vigia = new IntersectionObserver(
      ([e]) => {
        perto = e.isIntersecting;
        if (perto) aoRolar();
      },
      { rootMargin: "40% 0px" },
    );
    vigia.observe(alvo);
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar, { passive: true });
    return () => {
      vigia.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  return (
    <section
      ref={secao}
      id="ate-la"
      aria-labelledby="ate-la-titulo"
      className="rescaldo bg-blood relative z-40 flex h-[78svh] items-center justify-center overflow-clip px-6"
    >
      {/*
        A emenda com o ingresso, que é preto: o preto vira fumaça e a fumaça
        vira céu. Sem ela, duas chapas de cor se encostavam numa linha reta
        atravessando a tela.
      */}
      <div
        aria-hidden
        className="fumaca-rescaldo pointer-events-none absolute inset-x-0 top-0"
      />

      {/* as brasas que ainda sobem do que queimou */}
      <div aria-hidden className="brasas pointer-events-none absolute inset-0">
        {BRASAS.map((b, i) => (
          <span
            key={i}
            style={
              {
                left: `${b.x}%`,
                width: `${b.tam}px`,
                height: `${b.tam}px`,
                animationDelay: `${b.atraso}s`,
                animationDuration: `${b.dur}s`,
                "--desvio": `${b.desvio}vw`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="texto-rescaldo relative z-10 text-center">
        <p className="font-heading text-[0.62rem] font-bold tracking-[0.35em] uppercase opacity-70">
          é isso
        </p>
        <h2
          id="ate-la-titulo"
          className="font-drip mt-3 text-5xl uppercase sm:text-7xl"
        >
          Até lá
        </h2>
        <p className="font-heading mt-5 text-[0.68rem] font-bold tracking-[0.26em] uppercase sm:text-xs">
          {event.dateLabel} · {event.timeLabel} às {event.endTimeLabel}
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> · </span>
          {event.venue.name}
        </p>
      </div>

      <style>{`
        .rescaldo {
          --acende: 0;
        }

        .fumaca-rescaldo {
          height: 58svh;
          background: linear-gradient(
            to bottom,
            var(--color-ink) 0%,
            color-mix(in srgb, var(--color-ink) 86%, transparent) 14%,
            color-mix(in srgb, var(--color-ink) 58%, transparent) 34%,
            color-mix(in srgb, var(--color-ink) 30%, transparent) 56%,
            color-mix(in srgb, var(--color-ink) 12%, transparent) 76%,
            transparent 100%
          );
        }

        /*
          O texto chega quente e esfria: entra na cor da brasa, com o clarão em
          volta, e vira osso conforme assenta.
        */
        .texto-rescaldo {
          opacity: var(--acende);
          transform: translateY(calc((1 - var(--acende)) * 18px));
          color: color-mix(
            in srgb,
            var(--color-bone) calc(var(--acende) * 100%),
            var(--color-ember)
          );
        }

        /*
          O clarão fica com o raio fixo e só perde força. Variar o raio obriga
          o navegador a borrar o texto de novo, do zero, a cada degrau da
          rolagem — é a mesma conta cara que já tinha sido tirada da abóbora.
          Com o raio parado, o que muda é só a cor, e o desenho borrado é
          sempre o mesmo. Na tela dá no mesmo: o brilho some do mesmo jeito.
        */
        .texto-rescaldo h2 {
          text-shadow: 0 0 22px rgb(255 145 66 / calc(1 - var(--acende)));
        }

        .brasas span {
          position: absolute;
          bottom: -4%;
          border-radius: 50%;
          background: var(--color-ember);
          box-shadow: 0 0 6px var(--color-pumpkin);
          opacity: 0;
          animation-name: brasa-sobe;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
        }

        @keyframes brasa-sobe {
          0%   { transform: translate3d(0, 0, 0) scale(0.5); opacity: 0; }
          15%  { opacity: 0.75; }
          75%  { opacity: 0.4; }
          100% { transform: translate3d(var(--desvio), -78svh, 0) scale(1); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .brasas span { animation: none; }
        }
      `}</style>
    </section>
  );
}
