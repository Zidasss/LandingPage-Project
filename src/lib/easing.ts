/**
 * Amostragem de curvas de suavização.
 *
 * Existe por um detalhe do CSS que morde: a função de suavização de uma
 * animação é aplicada **entre cada par de keyframes**, e não ao longo da
 * animação inteira. Uma animação com seis passos e `cubic-bezier` acelera e
 * freia seis vezes — o que se vê como engasgo.
 *
 * A saída daqui é usada para gerar keyframes já com a curva embutida nos
 * valores, e aí a animação roda em tempo linear. Como duas animações diferentes
 * podem ser geradas da mesma amostragem, elas ficam sincronizadas quadro a
 * quadro — que é o que faz a ponta do feixe acompanhar o canto da porta.
 */

/** Resolve o y de uma curva cúbica de Bézier para um dado x, por bisseção. */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (x: number) => number {
  const curva = (t: number, a: number, b: number) => {
    const u = 1 - t;
    return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
  };

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let baixo = 0;
    let alto = 1;
    let t = x;
    // 24 passos levam o erro para baixo do que um pixel consegue mostrar
    for (let i = 0; i < 24; i++) {
      const atual = curva(t, x1, x2);
      if (Math.abs(atual - x) < 1e-5) break;
      if (atual < x) baixo = t;
      else alto = t;
      t = (baixo + alto) / 2;
    }
    return curva(t, y1, y2);
  };
}

/**
 * Devolve `passos + 1` pares (tempo, valor) ao longo da curva, do início ao
 * fim. O tempo é linear; o valor já vem suavizado.
 */
export function amostrar(
  suavizacao: (x: number) => number,
  passos: number,
): { tempo: number; valor: number }[] {
  return Array.from({ length: passos + 1 }, (_, i) => {
    const tempo = i / passos;
    return { tempo, valor: suavizacao(tempo) };
  });
}
