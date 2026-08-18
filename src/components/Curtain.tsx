"use client";

import { useEffect, useRef } from "react";

/**
 * Cortina de preto que desce sobre a cena conforme a página rola.
 *
 * Ela cobre o chão e a porta, mas fica **por baixo** do feixe — então a luz
 * permanece enquanto o resto some, e no fim o que sobra na tela é só o vermelho,
 * que encosta na próxima seção. Nada se move de lugar: a porta fica parada e a
 * perspectiva não muda, o que importa quando a ilustração da porta entrar.
 *
 * O percurso é a própria saída do hero, que tem a altura da tela — a transição
 * não acrescenta rolagem nenhuma à página.
 */
export function Curtain() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const palco = node.parentElement;
    if (!palco) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const aplicar = () => {
      frame = 0;
      const rect = palco.getBoundingClientRect();
      const percurso = rect.height || 1;
      // Termina antes do fim da rolagem: a cortina precisa fechar enquanto o
      // hero ainda está em quadro, senão o efeito acontece fora da tela.
      const p = Math.min(1, Math.max(0, -rect.top / (percurso * 0.72)));
      node.style.height = `${(p * 100).toFixed(2)}%`;
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
    <div
      ref={ref}
      aria-hidden
      className="bg-ink absolute inset-x-0 top-0 z-20 h-0"
    />
  );
}
