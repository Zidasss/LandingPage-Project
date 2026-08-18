"use client";

import { useEffect, useRef } from "react";
import { DOOR_BOTTOM, DOOR_TOP } from "@/lib/beam";
import { event } from "@/config/event";

/**
 * Abertura do site.
 *
 * A abóbora aparece no escuro, ri, e recua. Recuando, ela vai perdendo
 * definição até não sobrar desenho nenhum — só um círculo vermelho. É essa
 * perda que faz a virada funcionar: ninguém precisa reconhecer uma abóbora
 * minúscula, porque a essa altura ela já é forma pura, e um círculo vermelho no
 * escuro lê como maçaneta sozinho. A porta se desenha em volta dele e então uma
 * fresta de luz se abre e cresce até virar a porta iluminada do hero.
 *
 * A porta da intro usa as mesmas medidas da porta do hero, então quando a
 * abertura termina as duas estão exatamente no mesmo lugar e a passagem de uma
 * cena para a outra não tem emenda.
 *
 * Roda uma vez por visitante e sai fora com qualquer toque, clique, tecla ou
 * rolagem — a informação da festa não pode ficar refém de uma animação.
 */

/** Chave que marca quem já viu a abertura. */
const MARCA = "volvoween:intro";

export function Intro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const encerrar = () => {
      node.dataset.saindo = "1";
      try {
        localStorage.setItem(MARCA, "1");
      } catch {
        // navegação privada pode recusar: a abertura só roda de novo, sem erro
      }
      node.addEventListener("transitionend", () => node.remove(), { once: true });
    };

    // some sozinha ao fim da sequência, e a qualquer sinal de impaciência
    const fim = window.setTimeout(encerrar, 4050);
    const pular = () => {
      window.clearTimeout(fim);
      encerrar();
    };
    for (const evento of ["pointerdown", "keydown", "wheel", "touchstart"]) {
      window.addEventListener(evento, pular, { once: true, passive: true });
    }

    return () => window.clearTimeout(fim);
  }, []);

  return (
    <div
      ref={ref}
      className="intro bg-ink fixed inset-0 z-[100] overflow-hidden"
      aria-hidden
    >
      {/* a abóbora: aparece, ri, recua e perde a forma */}
      <div className="intro-abobora">
        {event.intro.pumpkin ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.intro.pumpkin} alt="" className="h-full w-full object-contain" />
        ) : (
          <div className="intro-marcador">abóbora</div>
        )}
      </div>

      {/* o que sobra dela: a maçaneta */}
      <div className="intro-macaneta" />

      {/* a porta, desenhada em volta da maçaneta */}
      <div className="intro-porta">
        {/* a fresta de luz, que engorda até virar a porta iluminada */}
        <div className="intro-fresta" />
      </div>

      <p className="intro-pular font-heading">toque para pular</p>

      <style>{`
        .intro {
          --porta-topo: ${DOOR_TOP}%;
          --porta-altura: ${DOOR_BOTTOM - DOOR_TOP}%;
          /* Meia altura da porta: onde a mão alcançaria a maçaneta. */
          --macaneta-y: ${(DOOR_TOP + DOOR_BOTTOM) / 2}%;
          /*
            Distância vertical que a abóbora percorre até a maçaneta, em altura
            de tela. Precisa ser vh e não %: dentro de um transform, a
            porcentagem é relativa ao próprio elemento, não à viewport — foi o
            que jogou a abóbora para fora da porta.
          */
          --macaneta-dy: ${(DOOR_TOP + DOOR_BOTTOM) / 2 - 38}vh;
          /* Deslocamento lateral até a borda oposta à fresta de luz. */
          --macaneta-x: 14.4vw;
          transition: opacity 520ms ease;
        }
        .intro[data-saindo] { opacity: 0; pointer-events: none; }

        .intro-abobora,
        .intro-macaneta {
          position: absolute;
          left: 50%;
          top: 38%;
          transform: translate(-50%, -50%);
        }

        @media (min-width: 640px) {
          .intro { --macaneta-x: 7.9vw; }
        }

        /* Fase 1 e 2: entra e ri. O riso é pulso de escala com uma leve
           inclinação alternada — ombros sacudindo, não a imagem tremendo. */
        .intro-abobora {
          width: min(52vw, 340px);
          aspect-ratio: 1;
          opacity: 0;
          /*
            Os tempos são encadeados, não escolhidos soltos: a maçaneta só pode
            entrar depois de a abóbora ter chegado ao lugar dela, senão as duas
            aparecem juntas e a troca fica visível.
              entrada  0 → 420
              risada   420 → 1460
              recuo    1460 → 2560
          */
          animation:
            intro-entra 420ms ease-out forwards,
            intro-risada 520ms 420ms ease-in-out 2,
            intro-recua 1100ms 1460ms cubic-bezier(0.55, 0, 0.7, 1) forwards;
        }

        .intro-marcador {
          display: grid;
          place-items: center;
          height: 100%;
          width: 100%;
          border: 2px dashed var(--color-pumpkin);
          border-radius: 50%;
          color: var(--color-pumpkin);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        @keyframes intro-entra {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.72); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes intro-risada {
          0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          25%      { transform: translate(-50%, -52%) scale(1.07) rotate(-3deg); }
          50%      { transform: translate(-50%, -50%) scale(0.99) rotate(0deg); }
          75%      { transform: translate(-50%, -52%) scale(1.07) rotate(3deg); }
        }

        /* Fase 3: recua perdendo definição. O desfoque e a dessaturação são o
           que apagam o desenho; a mudança de matiz leva o laranja para o
           vermelho da cena seguinte. */
        /* Recua e, no mesmo gesto, caminha até a borda da porta: maçaneta fica
           do lado, não no meio. Fazer isso depois seria um pulo. */
        @keyframes intro-recua {
          from {
            transform: translate(-50%, -50%) scale(1);
            filter: blur(0) saturate(1) hue-rotate(0deg) brightness(1);
            opacity: 1;
          }
          70% {
            filter: blur(7px) saturate(0.7) hue-rotate(-22deg) brightness(0.85);
            opacity: 1;
          }
          to {
            transform: translate(calc(-50% + var(--macaneta-x)), calc(-50% + var(--macaneta-dy))) scale(0.075);
            filter: blur(12px) saturate(0.4) hue-rotate(-30deg) brightness(0.7);
            opacity: 0;
          }
        }

        /* O círculo que sobra: entra por baixo enquanto a abóbora se apaga. */
        .intro-macaneta {
          /* Acima da porta: ela é a maçaneta dela, não algo atrás dela. */
          z-index: 2;
          left: 50%;
          top: var(--macaneta-y);
          width: min(52vw, 340px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: var(--color-blood);
          box-shadow: 0 0 2.5vw rgba(255, 26, 18, 0.45);
          opacity: 0;
          animation: intro-macaneta 620ms 2480ms ease-out forwards;
        }

        @keyframes intro-macaneta {
          from {
            opacity: 0;
            transform: translate(calc(-50% + var(--macaneta-x)), -50%) scale(0.075);
          }
          40% {
            opacity: 1;
            transform: translate(calc(-50% + var(--macaneta-x)), -50%) scale(0.075);
          }
          to {
            opacity: 1;
            transform: translate(calc(-50% + var(--macaneta-x)), -50%) scale(0.055);
          }
        }

        /* Fase 4: a porta se desenha em volta, já nas medidas do hero. */
        .intro-porta {
          position: absolute;
          left: 50%;
          top: var(--porta-topo);
          height: var(--porta-altura);
          width: 40vw;
          transform: translateX(-50%);
          z-index: 1;
          background: #120303;
          border: 1px solid rgba(255, 26, 18, 0.22);
          opacity: 0;
          animation: intro-porta 620ms 2700ms ease-out forwards;
        }

        @media (min-width: 640px) {
          .intro-porta { width: 22vw; }
        }

        @keyframes intro-porta {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Fase 5: a fresta engorda até ser a porta inteira de luz. */
        .intro-fresta {
          position: absolute;
          inset: 0 auto 0 0;
          width: 0;
          background: var(--color-blood);
          animation: intro-fresta 800ms 3150ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes intro-fresta {
          from { width: 0; }
          18%  { width: 4%; }
          to   { width: 100%; }
        }

        .intro-pular {
          position: absolute;
          bottom: 6%;
          left: 50%;
          transform: translateX(-50%);
          color: var(--color-ash);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          opacity: 0;
          animation: intro-pular 400ms 900ms ease-out forwards;
        }

        @keyframes intro-pular {
          to { opacity: 0.55; }
        }

        /* Quem já viu, e quem pediu menos movimento, não vê a abertura. */
        [data-intro-vista] .intro,
        .intro:where([data-parado]) { display: none; }

        @media (prefers-reduced-motion: reduce) {
          .intro { display: none; }
        }
      `}</style>
    </div>
  );
}
