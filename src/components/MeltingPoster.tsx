"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/** Deformação máxima, em pixels do espaço do filtro. */
const DERRETIMENTO = 118;
/** Desfoque máximo que alimenta a etapa de liquefação. */
const BORRAO = 9;
/**
 * O filtro é recalculado pixel a pixel a cada mudança de `scale`. Arredondar em
 * degraus corta a maior parte das recalculações sem que o olho perceba salto.
 */
const DEGRAU = 3;

/**
 * Derrete o cartaz conforme a página rola: as letras escorrem para os lados,
 * empurradas pela boca da luz que se abre, e se desfazem antes de o vermelho
 * virar fundo.
 *
 * A deformação é um `feDisplacementMap` alimentado por ruído — o efeito
 * convincente, e também o mais caro que existe para animar: filtro não roda na
 * camada de composição, é recalculado a cada quadro. Por isso ele fica restrito
 * a telas grandes; no celular o mesmo movimento acontece só com transform, que
 * desliza liso.
 */
export function MeltingPoster({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const displace = useRef<SVGFEDisplacementMapElement>(null);
  const borrao = useRef<SVGFEGaussianBlurElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const palco = node.closest("section");
    if (!palco) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // O filtro é ligado direto no nó: é um estilo, não estado de interface —
    // guardá-lo em useState só provocaria um render a mais sem nada em troca.
    const telaGrande = window.matchMedia("(min-width: 640px)").matches;
    if (telaGrande) node.style.filter = "url(#derrete)";

    let frame = 0;
    let ultimo = -1;
    const aplicar = () => {
      frame = 0;
      const rect = palco.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));

      // Abre para os lados no mesmo ritmo da luz, e some por completo antes de
      // o vermelho virar fundo. Sobrando qualquer resto, ele lê como mancha
      // esquecida — as letras precisam ter ido embora, não desbotado.
      node.style.transform = `scale3d(${(1 + p * p * 1.9).toFixed(3)}, ${(1 - p * 0.18).toFixed(3)}, 1)`;
      // dissolve devagar no fim, para a massa sumir em vez de piscar
      const desvanecer = Math.max(0, Math.min(1, (p - 0.3) / 0.32));
      node.style.opacity = (1 - desvanecer * desvanecer).toFixed(3);

      if (telaGrande && displace.current && borrao.current) {
        const escala = Math.round((p * DERRETIMENTO) / DEGRAU) * DEGRAU;
        if (escala !== ultimo) {
          displace.current.setAttribute("scale", String(escala));
          // O desfoque entra junto e alimenta a liquefação: sem ele o
          // deslocamento sozinho deixa as bordas serrilhadas, com cara de
          // ruído, em vez de massa escorrendo.
          borrao.current.setAttribute(
            "stdDeviation",
            ((escala / DERRETIMENTO) * BORRAO).toFixed(2),
          );
          ultimo = escala;
        }
      }
    };
    const aoRolar = () => {
      if (!frame) frame = requestAnimationFrame(aplicar);
    };

    aplicar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <defs>
          {/*
            A região do filtro é bem maior que o texto: sem essa folga os
            pingos são cortados na borda da caixa e o derretimento acaba num
            corte reto. O ruído é alongado na vertical — frequência baixa em Y —
            para as letras escorrerem para baixo em vez de tremerem.
          */}
          <filter
            id="derrete"
            x="-25%"
            y="-25%"
            width="150%"
            height="190%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.004 0.021"
              numOctaves="3"
              seed="11"
              result="ruido"
            />
            <feDisplacementMap
              ref={displace}
              in="SourceGraphic"
              in2="ruido"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="deslocado"
            />
            {/*
              Liquefação: desfoca e depois recupera o contraste do canal alfa.
              As bordas moles voltam a ser nítidas, mas já fundidas — é o que
              faz as letras virarem massa contínua em vez de cacos borrados.
              Sem esta dupla, o derretimento parece interferência de sinal.
            */}
            <feGaussianBlur ref={borrao} in="deslocado" stdDeviation="0" result="mole" />
            <feColorMatrix
              in="mole"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 19 -8"
            />
          </filter>
        </defs>
      </svg>

      <div
        ref={ref}
        className="w-full will-change-transform"
        style={{ transformOrigin: "50% 60%" }}
      >
        {children}
      </div>
    </>
  );
}
