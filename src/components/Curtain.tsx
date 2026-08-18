"use client";

import { useEffect, useRef } from "react";

/**
 * Escuridão que desce sobre a cena conforme a página rola.
 *
 * Ela cobre o chão e a porta, mas fica **por baixo** do feixe — então a luz
 * permanece enquanto o resto some, e no fim o que sobra na tela é só o vermelho,
 * que encosta na próxima seção. Nada se move de lugar: a porta fica parada e a
 * perspectiva não muda.
 *
 * Duas decisões vieram de o efeito ter ficado truncado na primeira versão:
 *
 * 1. O movimento é `transform`, não `height`. Mudar altura a cada quadro obriga
 *    o navegador a refazer o layout; transform vive na composição e desliza.
 * 2. A borda de baixo é um degradê, não um corte. Uma aresta reta descendo lê
 *    como cortina de teatro caindo; o degradê lê como a luz se apagando.
 */
/**
 * Posição de repouso, em % da altura do palco. A faixa difusa termina em 68% da
 * altura do elemento (136% do palco), então o elemento precisa nascer 136% acima
 * para que nada seja escurecido antes da primeira rolagem.
 */
const REPOUSO = -136;
/**
 * Deslocamento até o preto cobrir o palco inteiro, em % da altura do elemento.
 * translateY em porcentagem é relativo à própria altura — 1% aqui vale 2% do
 * palco, porque o elemento tem o dobro da altura dele.
 */
const PERCURSO = 76;

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
      const p = Math.min(1, Math.max(0, -rect.top / percurso));
      node.style.transform = `translate3d(0, ${(p * PERCURSO).toFixed(2)}%, 0)`;
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
      className="absolute inset-x-0 z-20 will-change-transform"
      style={{
        top: `${REPOUSO}%`,
        height: "200%",
        // O preto ocupa a metade de cima e se dissolve ao longo de um quarto da
        // altura: é essa faixa difusa que atravessa a cena, não uma borda.
        background:
          "linear-gradient(to bottom, #000 0%, #000 42%, rgba(0,0,0,0.86) 52%, rgba(0,0,0,0) 68%)",
      }}
    />
  );
}
