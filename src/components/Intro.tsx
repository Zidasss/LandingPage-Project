"use client";

import { useEffect, useRef } from "react";
import {
  beamGapPolygon,
  BEAM_DESKTOP,
  BEAM_MOBILE,
  DOOR_BOTTOM,
  DOOR_TOP,
} from "@/lib/beam";
import { amostrar, cubicBezier } from "@/lib/easing";
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
/** Avisa o resto da página que a porta terminou de abrir. */
export const PORTA_ABERTA = "volvoween:porta-aberta";

/**
 * A folha e o feixe são gerados desta mesma amostragem, e as duas animações
 * rodam em tempo linear. É o que mantém a ponta do feixe grudada no canto da
 * porta: com curvas ou durações diferentes, uma sempre adianta a outra.
 */
const ABERTURA = amostrar(cubicBezier(0.45, 0, 0.35, 1), 14);
/** Quando a folha começa a girar, e quanto tempo leva. */
const ABRE_EM = 3750;
const ABRE_POR = 1700;

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
      // O cartaz espera este aviso para se formar: as letras aparecem pelo
      // caminho inverso do derretimento, e não faria sentido começarem antes de
      // a porta ter aberto.
      window.dispatchEvent(new CustomEvent(PORTA_ABERTA));
      node.addEventListener("transitionend", () => node.remove(), { once: true });
    };

    // some sozinha ao fim da sequência, e a qualquer sinal de impaciência
    const fim = window.setTimeout(encerrar, 5750);
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

      {/* o que sobra dela: a maçaneta, que viaja junto com a folha */}
      <div className="intro-macaneta" />

      {/* o feixe no chão, que nasce junto com a luz que escapa */}
      <div className="intro-feixe" />

      {/* o brilho que escapa do batente conforme a porta abre */}
      <div className="intro-brilho" />

      {/* a porta: a luz fica atrás, a folha por cima dela */}
      <div className="intro-porta">
        <div className="intro-luz" />
        <div className="intro-folha" />
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
          width: min(34vw, 220px);
          aspect-ratio: 1;
          opacity: 0;
          /*
            Os tempos são encadeados, não escolhidos soltos: a maçaneta só pode
            entrar depois de a abóbora ter chegado ao lugar dela, senão as duas
            aparecem juntas e a troca fica visível.
              entrada  0 → 380
              risada   380 → 1300
              recuo    1300 → 3200
          */
          animation:
            intro-entra 380ms ease-out forwards,
            intro-risada 460ms 380ms ease-in-out 2,
            intro-recua 1900ms 1300ms cubic-bezier(0.42, 0, 0.6, 1) forwards;
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
            transform: translate(calc(-50% + var(--macaneta-x)), calc(-50% + var(--macaneta-dy))) scale(0.115);
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
          /*
            Mesma largura de base da abóbora: é dela que a maçaneta nasce. As
            escalas abaixo compensam, para o círculo final ter o tamanho de uma
            maçaneta e não acompanhar o tamanho do desenho.
          */
          width: min(34vw, 220px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: var(--color-blood);
          box-shadow: 0 0 2.5vw rgba(255, 26, 18, 0.45);
          opacity: 0;
          animation: intro-macaneta 400ms 3100ms ease-out forwards,
            intro-macaneta-viaja ${ABRE_POR}ms ${ABRE_EM}ms linear forwards;
        }

        @keyframes intro-macaneta {
          from {
            opacity: 0;
            transform: translate(calc(-50% + var(--macaneta-x)), -50%) scale(0.115);
          }
          40% {
            opacity: 1;
            transform: translate(calc(-50% + var(--macaneta-x)), -50%) scale(0.115);
          }
          to {
            opacity: 1;
            transform: translate(calc(-50% + var(--macaneta-x)), -50%) scale(0.085);
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
          animation: intro-porta 500ms 3300ms ease-out forwards;
        }

        @media (min-width: 640px) {
          .intro-porta { width: 22vw; }
        }

        @keyframes intro-porta {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /*
          Fase 5: a porta abre da direita para a esquerda.

          A luz não é pintada por cima da porta: ela já está atrás, e quem se
          move é a folha. A folha encolhe na horizontal a partir da dobradiça,
          na esquerda — que é o que uma porta girando para longe faz na tela — e
          vai escurecendo, porque de perfil ela recebe cada vez menos luz.

          Este tratamento de luz vive só aqui, na abertura. Depois dela, quem
          manda é o feixe chapado do hero.
        */
        .intro-luz {
          position: absolute;
          inset: 0;
          /* mais quente junto ao vão, como luz que vem de dentro */
          background: linear-gradient(
            to left,
            #ff6a3a 0%,
            var(--color-blood) 24%,
            #c8110c 100%
          );
          /*
            No fim assenta no vermelho chapado do hero: terminar em gradiente
            daria um pulo de tom quando a abertura sai e a cena entra.
          */
          animation: intro-luz-assenta 500ms 5150ms ease-out forwards;
        }

        @keyframes intro-luz-assenta {
          to { background: var(--color-blood); }
        }

        .intro-folha {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: #120303;
          transform-origin: left center;
          animation: intro-folha ${ABRE_POR}ms ${ABRE_EM}ms linear forwards;
        }

        @keyframes intro-folha {
          ${ABERTURA.map(
            ({ tempo, valor }) =>
              `${(tempo * 100).toFixed(2)}% { transform: scaleX(${(1 - valor * 0.95).toFixed(4)}); filter: brightness(${(1 - valor * 0.7).toFixed(3)}); }`,
          ).join("\n          ")}
        }

        /*
          O feixe no chão acompanha o vão, e não a porta.

          O vão começa como uma fresta na borda da maçaneta e vai abrindo em
          direção à dobradiça — luz não atravessa a folha fechada, então o feixe
          não pode nascer no meio da porta.

          Os passos vêm da mesma amostragem da folha, e a animação roda em tempo
          linear: em CSS a suavização é aplicada entre cada par de keyframes, e
          uma curva declarada aqui faria o feixe acelerar e frear a cada passo.
          Era isso que se via como engasgo — e o que fazia a ponta do feixe
          descolar do canto da porta.
        */
        .intro-feixe {
          position: absolute;
          inset: 0;
          background: var(--color-blood);
          opacity: 0;
          animation: intro-feixe-mobile ${ABRE_POR}ms ${ABRE_EM}ms linear forwards;
        }

        @keyframes intro-feixe-mobile {
          ${ABERTURA.map(
            ({ tempo, valor }, i) =>
              `${(tempo * 100).toFixed(2)}% { opacity: ${i === 0 ? 0 : 1}; clip-path: ${beamGapPolygon(BEAM_MOBILE, valor)}; }`,
          ).join("\n          ")}
        }

        @media (min-width: 640px) {
          .intro-feixe { animation-name: intro-feixe-desktop; }

          @keyframes intro-feixe-desktop {
            ${ABERTURA.map(
              ({ tempo, valor }, i) =>
                `${(tempo * 100).toFixed(2)}% { opacity: ${i === 0 ? 0 : 1}; clip-path: ${beamGapPolygon(BEAM_DESKTOP, valor)}; }`,
            ).join("\n            ")}
          }
        }

        /* A luz não fica presa no batente: ela vaza para o escuro em volta. */
        .intro-brilho {
          position: absolute;
          left: 50%;
          top: var(--macaneta-y);
          width: 120vw;
          height: 96vh;
          transform: translate(-50%, -50%);
          opacity: 0;
          background: radial-gradient(
            ellipse 20% 44% at 50% 50%,
            rgba(255, 80, 40, 0.45) 0%,
            rgba(255, 26, 18, 0.18) 42%,
            transparent 74%
          );
          animation: intro-brilho ${ABRE_POR}ms ${ABRE_EM}ms linear forwards;
        }

        @keyframes intro-brilho {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /*
          A maçaneta acompanha a borda da folha até a dobradiça e se apaga com
          ela. O deslocamento sai da mesma amostragem, então ela não desliza
          por conta própria enquanto a porta gira.
        */
        @keyframes intro-macaneta-viaja {
          ${ABERTURA.map(({ tempo, valor }) => {
            const folha = 1 - valor * 0.95;
            const lado = (2 * folha - 1).toFixed(3);
            const opacidade = Math.max(0, 1 - Math.max(0, (valor - 0.55) / 0.45)).toFixed(2);
            return `${(tempo * 100).toFixed(2)}% { transform: translate(calc(-50% + var(--macaneta-x) * ${lado}), -50%) scale(0.085); opacity: ${opacidade}; }`;
          }).join("\n          ")}
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
          animation: intro-pular 400ms 800ms ease-out forwards;
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
