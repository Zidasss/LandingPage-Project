"use client";

import { useEffect, useRef } from "react";
import { beamPolygon, BEAM_DESKTOP, BEAM_MOBILE, DOOR_GAP } from "@/lib/beam";

/**
 * A luz da porta, que abre a boca conforme a página rola até virar o fundo da
 * seção seguinte.
 *
 * Ela é **fixa na tela** e mora fora do hero, atrás do conteúdo da página. Sem
 * isso, a seção seguinte precisaria pintar o próprio vermelho — e aí o que
 * sobe durante a rolagem é outro bloco vermelho, não a luz. Fixa, ela abre e
 * simplesmente continua ali: o vermelho que se vê é o mesmo o tempo todo.
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
    // O progresso vem do hero, não do próprio elemento: fixo na tela, ele não
    // rola e não teria posição para medir.
    const palco = document.querySelector<HTMLElement>("[data-hero]");
    if (!palco) return;

    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    let anterior = "";
    const aplicar = () => {
      frame = 0;
      const porta = palco.querySelector<HTMLElement>("[data-porta]");
      const tela = window.innerHeight;

      // A porta define a largura e a altura do vértice de cima. Medir o próprio
      // elemento é o que mantém a luz colada na abertura: ela tem mínimo e
      // máximo em pixels, e — por a luz ser fixa e a porta rolar — a altura só
      // pode vir de onde a porta está agora.
      const larguraPorta = porta?.offsetWidth ?? 0;
      const base = larguraPorta
        ? { ...BEAM_DESKTOP, topHalf: (larguraPorta / window.innerWidth) * 50 }
        : window.innerWidth >= 640
          ? BEAM_DESKTOP
          : BEAM_MOBILE;
      const topY = porta
        ? (porta.getBoundingClientRect().bottom / tela) * 100 + DOOR_GAP
        : undefined;

      const rect = palco.getBoundingClientRect();
      const p = parado ? 0 : Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
      // acelera no fim: a luz demora a sair do lugar e depois toma a tela
      const alvo = base.bottomHalf + (ABERTURA_FINAL - base.bottomHalf) * p * p;
      const bottomHalf = Math.round(alvo / DEGRAU) * DEGRAU;

      const forma = beamPolygon({ ...base, bottomHalf }, topY);
      if (forma !== anterior) {
        node.style.clipPath = forma;
        anterior = forma;
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
      className="feixe bg-blood fixed inset-0 z-20"
    />
  );
}
