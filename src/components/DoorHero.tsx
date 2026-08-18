"use client";

import { useEffect, useRef } from "react";
import { Doorway } from "@/components/Doorway";
import { Floor } from "@/components/Floor";
import {
  beamPolygon,
  beamShape,
  clamp01,
  glowGradient,
  slice,
  DOOR_BOTTOM,
  DOOR_TOP,
} from "@/lib/beam";
import { brl } from "@/lib/format";
import { event } from "@/config/event";

/** Altura total da seção. O que passa de 100svh é a distância de rolagem. */
const ALTURA = "260svh";

/**
 * Hero da porta.
 *
 * A seção é alta e o palco fica preso no topo (`sticky`), então a página rola
 * mas a cena permanece na tela. O quanto já se rolou dentro da seção vira um
 * progresso de 0 a 1, e é ele — e não um tempo de animação — que define a
 * forma do feixe. Rolar para cima desfaz o efeito exatamente na mesma ordem.
 *
 * Ao final, o feixe cobriu a viewport inteira de vermelho e encosta na seção
 * seguinte, que já é vermelha: a luz não some, ela vira a próxima seção.
 */
export function DoorHero() {
  const secao = useRef<HTMLElement>(null);
  const feixe = useRef<HTMLDivElement>(null);
  const cena = useRef<HTMLDivElement>(null);
  const chamada = useRef<HTMLDivElement>(null);
  const porta = useRef<HTMLDivElement>(null);
  const clarao = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alvo = secao.current;
    if (!alvo) return;

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const desenhar = () => {
      frame = 0;
      const rect = alvo.getBoundingClientRect();
      const percurso = rect.height - window.innerHeight;
      const p = percurso > 0 ? clamp01(-rect.top / percurso) : 0;

      // A meia-largura da porta é medida da própria porta, não estimada: ela
      // tem mínimo e máximo em pixels, então a conta em vw erraria nas telas
      // muito estreitas ou muito largas — e qualquer erro aqui reabre o degrau.
      const larguraPorta = porta.current?.offsetWidth ?? 0;
      const meiaPorta = (larguraPorta / window.innerWidth) * 50;

      if (feixe.current) {
        feixe.current.style.clipPath = beamPolygon(beamShape(p, meiaPorta));
      }
      if (clarao.current) {
        clarao.current.style.backgroundImage = glowGradient(p);
      }
      if (cena.current) {
        // a cena avança em direção a quem olha, como se andássemos até a porta
        cena.current.style.transform = `scale(${(1 + p * 0.5).toFixed(3)})`;
      }
      if (chamada.current) {
        chamada.current.style.opacity = String(1 - slice(p, 0.12, 0.45));
      }
    };

    if (semMovimento.matches) {
      // sem animação: a cena fica no estado inicial, legível e parada
      desenhar();
      return;
    }

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
    <section ref={secao} className="relative" style={{ height: ALTURA }}>
      <div className="bg-ink sticky top-0 h-svh overflow-hidden">
        {/* ---- cena: porta e chão ---- */}
        <div ref={cena} className="absolute inset-0 will-change-transform">
          <div className="text-blood/45 absolute inset-0">
            <Floor />
          </div>

          <div
            ref={porta}
            className="absolute left-1/2 w-[20vw] max-w-[240px] min-w-[124px] -translate-x-1/2"
            style={{ top: `${DOOR_TOP}%`, height: `${DOOR_BOTTOM - DOOR_TOP}%` }}
          >
            <Doorway />
          </div>
        </div>

        {/* ---- o feixe ---- */}
        <div
          ref={feixe}
          aria-hidden
          className="bg-blood absolute inset-0 will-change-[clip-path]"
          style={{ clipPath: beamPolygon(beamShape(0, 10)) }}
        >
          {/* grão sobre o vermelho, para não ficar uma chapada digital */}
          <div
            className="absolute inset-0 opacity-25 mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='r'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23r)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        {/* ---- clarão: engole o preto sem aresta nenhuma ---- */}
        <div ref={clarao} aria-hidden className="absolute inset-0" />

        {/* ---- texto sobre o feixe ---- */}
        <div
          ref={chamada}
          className="absolute inset-x-0 bottom-0 z-10 px-5 pb-8 text-center"
        >
          <h1 className="font-display text-ink text-[13vw] leading-[0.9] sm:text-[7vw]">
            <span className="sr-only">{event.name}</span>
            <span aria-hidden>{event.name}</span>
          </h1>
          <p className="font-heading text-ink mt-2 text-xs font-bold tracking-[0.15em] uppercase sm:text-sm">
            {event.dateLabel} &middot; {event.timeLabel} &middot; {brl(event.ticket.price)}
          </p>
          <p className="font-heading text-ink/70 mt-6 text-[0.6rem] font-bold tracking-[0.3em] uppercase">
            role para entrar
          </p>
        </div>
      </div>
    </section>
  );
}
