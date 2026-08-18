/**
 * Geometria do feixe de luz que sai da porta.
 *
 * O feixe é um trapézio: estreito encostado na porta, largo em direção a quem
 * olha. O crescimento acontece em duas etapas encadeadas ao scroll, e não ao
 * mesmo tempo — é isso que dá a sensação de atravessar a porta em vez de um
 * fade:
 *
 *   1. a base abre para os lados até passar das bordas da tela;
 *   2. só então a aresta de cima sobe e o vermelho toma a viewport inteira.
 *
 * Todas as medidas são porcentagens da área visível, então o feixe acompanha
 * qualquer proporção de tela sem cálculo extra.
 */

/** Prende um número ao intervalo [0, 1]. */
export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Reposiciona `value` dentro da faixa [start, end] e devolve de 0 a 1. */
export function slice(value: number, start: number, end: number): number {
  return clamp01((value - start) / (end - start));
}

/** Suaviza as pontas: começa e termina devagar. */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Onde a base da porta encosta, em porcentagem da altura da tela. */
export const DOOR_BOTTOM = 52;

export type BeamShape = {
  /** Meia-largura da aresta de cima, colada na porta. */
  topHalf: number;
  /** Meia-largura da base, à frente de quem olha. */
  bottomHalf: number;
  /** Altura em que a aresta de cima está. */
  topY: number;
};

export function beamShape(progress: number): BeamShape {
  const p = clamp01(progress);

  // A aresta de cima precisa continuar mais estreita que a tela durante quase
  // todo o percurso: é o que mantém as diagonais visíveis e faz aquilo parecer
  // um feixe. Se ela passa das bordas cedo, o trapézio vira um bloco chapado
  // com corte reto no meio da tela.
  const abertura = lerp(11, 46, easeInOut(slice(p, 0.1, 0.78)));
  const estouro = lerp(0, 99, easeInOut(slice(p, 0.78, 1)));

  return {
    // a boca do feixe abre primeiro, e é a etapa mais longa
    bottomHalf: lerp(34, 120, easeInOut(slice(p, 0, 0.5))),
    topHalf: abertura + estouro,
    // por último a aresta de cima sobe e o vermelho cobre tudo
    topY: lerp(DOOR_BOTTOM, 0, easeInOut(slice(p, 0.78, 1))),
  };
}

/** Monta o polígono do clip-path a partir da forma. */
export function beamPolygon({ topHalf, bottomHalf, topY }: BeamShape): string {
  const pontos: [number, number][] = [
    [50 - topHalf, topY],
    [50 + topHalf, topY],
    [50 + bottomHalf, 100],
    [50 - bottomHalf, 100],
  ];
  return `polygon(${pontos.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(", ")})`;
}
