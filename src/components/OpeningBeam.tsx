"use client";

import { useEffect, useRef } from "react";
import { beamPolygon, BEAM_DESKTOP, BEAM_MOBILE } from "@/lib/beam";

/**
 * Abre a boca da luz conforme a página rola, até ela virar o fundo da seção
 * seguinte.
 *
 * Só a base se afasta: a aresta de cima continua com a largura da porta, então
 * a luz nunca deixa de sair da abertura. Um `scaleX` no elemento inteiro seria
 * mais barato, mas alargaria o topo na mesma proporção — a luz descolaria da
 * porta e viraria um bloco crescendo sozinho.
 *
 * Por isso o que anda aqui é o `clip-path`, e não um transform. Para não
 * repintar o polígono a cada pixel de rolagem, a largura anda em degraus.
 */

/** Meia-largura final da base, em % da tela. Passa das bordas com folga. */
const ABERTURA_FINAL = 190;
/** Degrau da largura, em % da tela. */
const DEGRAU = 2;

export function OpeningBeam() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const palco = node.closest("section");
    if (!palco) return;

    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    let ultima = -1;
    const aplicar = () => {
      frame = 0;
      // A porta define a largura do topo. Ela tem mínimo e máximo em pixels,
      // então medir o elemento é mais confiável do que escolher pela largura da
      // tela — e qualquer erro aqui descola a luz da abertura.
      const porta = palco.querySelector<HTMLElement>("[data-porta]");
      const base = porta
        ? { ...BEAM_DESKTOP, topHalf: (porta.offsetWidth / window.innerWidth) * 50 }
        : window.innerWidth >= 640
          ? BEAM_DESKTOP
          : BEAM_MOBILE;

      const rect = palco.getBoundingClientRect();
      const p = parado ? 0 : Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
      // acelera no fim: a luz demora a sair do lugar e depois toma a tela
      const alvo = base.bottomHalf + (ABERTURA_FINAL - base.bottomHalf) * p * p;
      const bottomHalf = Math.round(alvo / DEGRAU) * DEGRAU;

      if (bottomHalf !== ultima) {
        node.style.clipPath = beamPolygon({ ...base, bottomHalf });
        ultima = bottomHalf;
      }
    };
    const aoRolar = () => {
      if (!frame) frame = requestAnimationFrame(aplicar);
    };

    aplicar();
    if (parado) return;
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="feixe bg-blood absolute inset-0 z-30"
    />
  );
}
