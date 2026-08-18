"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Faz a luz crescer até virar o fundo da seção seguinte.
 *
 * O feixe é aberto na horizontal com `scaleX`, com a origem na própria porta —
 * então ele continua saindo da abertura enquanto abre, e nenhum degrau aparece
 * na base dela. Como é transform, o crescimento vive na camada de composição:
 * animar o `clip-path` daria o mesmo desenho, mas repintando o polígono a cada
 * quadro.
 *
 * No fim do percurso a luz cobre toda a largura abaixo da porta e encosta na
 * seção seguinte, que já é vermelha — a passagem deixa de existir.
 */
export function GrowingBeam({
  children,
  /** Quanto a luz abre até encostar nas bordas. */
  abertura = 5.2,
  /** Altura da origem, em % — a base da porta. */
  origemY,
}: {
  children: ReactNode;
  abertura?: number;
  origemY: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const palco = node.closest("section");
    if (!palco) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const aplicar = () => {
      frame = 0;
      const rect = palco.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
      // acelera no fim: a luz demora a sair do lugar e depois toma a tela
      const k = 1 + (abertura - 1) * p * p;
      node.style.transform = `scaleX(${k.toFixed(3)})`;
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
  }, [abertura]);

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-30 will-change-transform"
      style={{ transformOrigin: `50% ${origemY}%` }}
    >
      {children}
    </div>
  );
}
