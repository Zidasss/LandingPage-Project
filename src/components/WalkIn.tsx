"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Aproxima a cena conforme a página rola, como se a pessoa desse alguns passos
 * em direção à porta.
 *
 * Nada muda de forma: é só escala, com a origem na própria porta, então porta,
 * feixe e chão crescem juntos e a perspectiva continua coerente. Como a seção
 * tem a altura da tela, o percurso é a própria saída do hero — o efeito não
 * acrescenta rolagem nenhuma à página.
 */
export function WalkIn({
  children,
  /** Quanto a cena cresce até o hero sair de quadro. */
  aproximacao = 0.42,
  /** Altura da origem, em % — o ponto para onde a câmera caminha. */
  alvoY = 30,
}: {
  children: ReactNode;
  aproximacao?: number;
  alvoY?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const aplicar = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const percurso = rect.height || 1;
      const p = Math.min(1, Math.max(0, -rect.top / percurso));
      node.style.transform = `scale(${(1 + p * aproximacao).toFixed(4)})`;
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
  }, [aproximacao]);

  return (
    <div
      ref={ref}
      className="h-full w-full will-change-transform"
      style={{ transformOrigin: `50% ${alvoY}%` }}
    >
      {children}
    </div>
  );
}
