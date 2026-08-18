"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Move o conteúdo em ritmo diferente do scroll, criando profundidade.
 *
 * speed positivo = a camada sobe mais devagar que a página (parece ao fundo);
 * speed negativo = sobe mais rápido (parece à frente).
 *
 * A posição é escrita direto no transform dentro de requestAnimationFrame,
 * fora do ciclo de render do React — o scroll não dispara re-render nenhum.
 */
export function Parallax({
  speed = 0.2,
  className = "",
  children,
}: {
  speed?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let frame = 0;
    const apply = () => {
      frame = 0;
      // Distância do centro do elemento até o centro da tela.
      const rect = node.getBoundingClientRect();
      const fromCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
      node.style.transform = `translate3d(0, ${(-fromCenter * speed).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
