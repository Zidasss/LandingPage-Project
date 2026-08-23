"use client";

import { useEffect, useRef } from "react";
import {
  beamGapPolygon,
  BEAM_DESKTOP,
  BEAM_MOBILE,
  DOOR_BOTTOM,
  DOOR_RATIO,
  DOOR_TOP,
} from "@/lib/beam";
import { cubicBezier } from "@/lib/easing";
import { DoorCrowd } from "@/components/DoorCrowd";
import { event } from "@/config/event";

/**
 * Abertura do site, amarrada ao scroll.
 *
 * A abóbora aparece no escuro, e conforme a página rola ela recua perdendo
 * definição até não sobrar desenho nenhum — só um círculo vermelho. É essa
 * perda que faz a virada funcionar: ninguém precisa reconhecer uma abóbora
 * minúscula, porque a essa altura ela já é forma pura, e um círculo vermelho no
 * escuro lê como maçaneta sozinho. A porta se desenha em volta dele e então a
 * folha gira, revelando a luz — e cada etapa avança com o dedo de quem rola.
 *
 * É uma seção alta com o palco preso no topo: a página rola, mas a cena
 * permanece na tela, e o quanto já se rolou dentro da seção vira o progresso da
 * abertura. Rolar para trás desfaz na mesma ordem.
 *
 * A porta usa as mesmas medidas da porta do hero, então quando a abertura
 * termina as duas estão no mesmo lugar e a passagem não tem emenda.
 */

/** Avisa o resto da página que a porta terminou de abrir. */
export const PORTA_ABERTA = "volvoween:porta-aberta";

/** Altura da seção. O que passa de 100svh é a distância de rolagem. */
const ALTURA = "300svh";

/** Fatias do progresso em que cada fase acontece. */
const RECUO = [0.05, 0.36] as const; // abóbora recua e vira maçaneta
const MACANETA = [0.3, 0.42] as const; // o círculo aparece
const PORTA = [0.38, 0.52] as const; // a porta se desenha em volta
const ABRE = [0.54, 0.98] as const; // a folha gira e a luz escapa

const suavizar = cubicBezier(0.45, 0, 0.35, 1);

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** Reposiciona `v` dentro de [a, b] e devolve de 0 a 1. */
function fatia(v: number, [a, b]: readonly [number, number]): number {
  return clamp01((v - a) / (b - a));
}

function lerp(de: number, ate: number, t: number): number {
  return de + (ate - de) * t;
}

export function Intro() {
  const secao = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const abobora = useRef<HTMLDivElement>(null);
  const macaneta = useRef<HTMLDivElement>(null);
  const porta = useRef<HTMLDivElement>(null);
  const folha = useRef<HTMLDivElement>(null);
  const feixe = useRef<HTMLDivElement>(null);
  const brilho = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alvo = secao.current;
    if (!alvo) return;

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduzido.matches) {
      // Sem movimento: a seção some e a porta já conta como aberta, para o
      // cartaz do hero se formar sozinho.
      alvo.style.display = "none";
      window.dispatchEvent(new CustomEvent(PORTA_ABERTA));
      return;
    }

    let frame = 0;
    let avisado = false;
    let escondido = false;

    const desenhar = () => {
      frame = 0;
      const rect = alvo.getBoundingClientRect();
      const percurso = rect.height - window.innerHeight;
      const p = percurso > 0 ? clamp01(-rect.top / percurso) : 0;

      // A maçaneta assenta na borda da porta, do lado do vão. Como a largura da
      // porta agora vem da altura da janela, esse deslocamento é medido da
      // própria porta a cada quadro — um valor fixo em vw a jogava para fora nas
      // telas em que a porta encolhe.
      const larguraPorta = porta.current?.offsetWidth ?? 0;
      if (larguraPorta) {
        alvo.style.setProperty("--macaneta-x", `${larguraPorta / 2 - 14}px`);
      }

      // --- abóbora: recua, some, e caminha até o lugar da maçaneta ---
      const rec = suavizar(fatia(p, RECUO));
      if (abobora.current) {
        abobora.current.style.opacity = String(1 - clamp01((rec - 0.72) / 0.28));
        abobora.current.style.transform =
          `translate(calc(-50% + var(--macaneta-x) * ${rec.toFixed(3)}), ` +
          `calc(-50% + var(--macaneta-dy) * ${rec.toFixed(3)})) ` +
          `scale(${lerp(1, 0.115, rec).toFixed(3)})`;
        abobora.current.style.filter =
          `blur(${(rec * 12).toFixed(1)}px) saturate(${(1 - rec * 0.6).toFixed(2)}) ` +
          `hue-rotate(${(-rec * 30).toFixed(0)}deg) brightness(${(1 - rec * 0.3).toFixed(2)})`;
      }

      // --- abertura: a folha gira, medida pela porta a cada quadro ---
      const o = suavizar(fatia(p, ABRE));
      const largura = 1 - o * 0.95;

      // --- maçaneta: aparece e depois viaja com a borda da folha ---
      if (macaneta.current) {
        const aparece = fatia(p, MACANETA);
        const some = 1 - clamp01((o - 0.55) / 0.45);
        const lado = 2 * largura - 1;
        macaneta.current.style.opacity = String(Math.min(aparece, some));
        macaneta.current.style.transform =
          `translate(calc(-50% + var(--macaneta-x) * ${lado.toFixed(3)}), -50%) ` +
          `scale(${lerp(0.115, 0.085, aparece).toFixed(3)})`;
      }

      if (porta.current) porta.current.style.opacity = String(fatia(p, PORTA));

      if (folha.current) {
        folha.current.style.transform = `scaleX(${largura.toFixed(4)})`;
        folha.current.style.filter = `brightness(${(1 - o * 0.7).toFixed(3)})`;
      }

      if (feixe.current) {
        const el = porta.current;
        const meia = el ? (el.offsetWidth / window.innerWidth) * 50 : BEAM_DESKTOP.topHalf;
        const base = window.innerWidth >= 640 ? BEAM_DESKTOP : BEAM_MOBILE;
        feixe.current.style.clipPath = beamGapPolygon({ ...base, topHalf: meia }, o);
        feixe.current.style.opacity = o > 0 ? "1" : "0";
      }

      if (brilho.current) brilho.current.style.opacity = String(fatia(p, ABRE));

      // O palco é fixo e cobre o viewport inteiro durante a abertura. Quando ela
      // termina, ele some e deixa o hero — porta, galera e feixe no mesmo lugar —
      // tomar seu lugar sem emenda. Sticky com h-svh não servia: no iOS a barra
      // do Safari muda a altura do viewport e sobrava uma faixa embaixo onde a
      // porta do hero aparecia, duplicada.
      const fim = p >= 1;
      if (fim !== escondido) {
        palco.current!.style.opacity = fim ? "0" : "1";
        palco.current!.style.pointerEvents = fim ? "none" : "";
        escondido = fim;
      }

      // o cartaz do hero espera este aviso para se formar
      if (p > 0.99 && !avisado) {
        avisado = true;
        window.dispatchEvent(new CustomEvent(PORTA_ABERTA));
      }
    };

    const aoRolar = () => {
      if (!frame) frame = requestAnimationFrame(desenhar);
    };

    desenhar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  return (
    <section ref={secao} className="intro relative" style={{ height: ALTURA }}>
      {/*
        O palco é fixo, não sticky: um overlay fixed inset-0 cobre o viewport
        inteiro sem depender de svh nem do sticky, que no iOS deixavam uma faixa
        descoberta embaixo. A seção alta continua em fluxo só para dar a
        distância de rolagem; o script esconde o palco quando a abertura acaba.
      */}
      <div
        ref={palco}
        className="bg-ink fixed inset-0 z-[100] overflow-hidden transition-opacity duration-300"
        aria-hidden
      >
        {/* a abóbora: presente, e recua perdendo a forma conforme rola */}
        <div ref={abobora} className="intro-abobora">
          {event.intro.pumpkin ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.intro.pumpkin}
              alt=""
              className="intro-risada h-full w-full object-contain"
            />
          ) : (
            <div className="intro-marcador">abóbora</div>
          )}
        </div>

        {/* o que sobra dela: a maçaneta */}
        <div ref={macaneta} className="intro-macaneta" />

        {/* o feixe no chão, que nasce junto com a luz que escapa */}
        <div ref={feixe} className="intro-feixe" />

        {/* o brilho que escapa do batente conforme a porta abre */}
        <div ref={brilho} className="intro-brilho" />

        {/* a porta: a luz e a festa ficam atrás, a folha por cima delas */}
        <div ref={porta} className="intro-porta">
          <div className="intro-luz" />
          {/* a mesma festa do hero, para a porta aberta emendar sem pulo */}
          <DoorCrowd />
          <div ref={folha} className="intro-folha" />
        </div>

        <p className="intro-dica font-heading">role para abrir a porta ▾</p>
      </div>

      <style>{`
        .intro {
          --porta-topo: ${DOOR_TOP}%;
          --porta-altura: ${DOOR_BOTTOM - DOOR_TOP}%;
          /* Meia altura da porta: onde a mão alcançaria a maçaneta. */
          --macaneta-y: ${(DOOR_TOP + DOOR_BOTTOM) / 2}%;
          /*
            Distância vertical que a abóbora percorre até a maçaneta, em altura
            de tela. Precisa ser vh e não %: dentro de um transform, a
            porcentagem é relativa ao próprio elemento, não à viewport.
          */
          --macaneta-dy: ${(DOOR_TOP + DOOR_BOTTOM) / 2 - 38}vh;
          /* Deslocamento lateral até a borda oposta à fresta de luz. */
          --macaneta-x: 14.4vw;
        }

        @media (min-width: 640px) {
          .intro { --macaneta-x: 7.9vw; }
        }

        .intro-abobora,
        .intro-macaneta {
          position: absolute;
          left: 50%;
          top: 38%;
        }

        .intro-abobora {
          width: min(34vw, 220px);
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
        }

        /* O riso vive no próprio desenho, num ritmo independente do scroll:
           enquanto a abóbora está presente, os ombros sacodem de leve. */
        .intro-risada {
          transform-origin: 50% 60%;
          animation: intro-risada 620ms ease-in-out infinite alternate;
        }

        @keyframes intro-risada {
          from { transform: scale(1) rotate(-2deg); }
          to   { transform: scale(1.04) rotate(2deg); }
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

        .intro-macaneta {
          z-index: 2;
          top: var(--macaneta-y);
          width: min(34vw, 220px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: var(--color-blood);
          box-shadow: 0 0 2.5vw rgba(255, 26, 18, 0.45);
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.115);
        }

        .intro-porta {
          position: absolute;
          left: 50%;
          top: var(--porta-topo);
          height: var(--porta-altura);
          /* a largura sai da altura, para a porta manter proporção de porta em
             qualquer formato de janela */
          width: min(46vw, ${(DOOR_BOTTOM - DOOR_TOP) / DOOR_RATIO}svh);
          transform: translateX(-50%);
          z-index: 1;
          background: #120303;
          border: 1px solid rgba(255, 26, 18, 0.22);
          opacity: 0;
        }

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
        }

        .intro-folha {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: #120303;
          transform-origin: left center;
          transform: scaleX(1);
        }

        .intro-feixe {
          position: absolute;
          inset: 0;
          background: var(--color-blood);
          opacity: 0;
        }

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
        }

        .intro-dica {
          position: absolute;
          bottom: 6%;
          left: 50%;
          transform: translateX(-50%);
          color: var(--color-ash);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          opacity: 0.55;
        }
      `}</style>
    </section>
  );
}
