/**
 * Geometria do feixe de luz que sai da porta.
 *
 * Duas regras sustentam o efeito:
 *
 * 1. A aresta de cima do feixe tem exatamente a largura da porta. Se ela passa
 *    disso, aparece um degrau reto contra o preto — a luz deixa de sair da
 *    porta e vira um bloco colado nela. Por isso o feixe abre por ângulo: só a
 *    base se afasta, e o topo continua encaixado na abertura.
 *
 * 2. O feixe nunca toma a tela inteira. Ele só abre, do começo ao fim do
 *    percurso, e os cantos de cima continuam pretos: é o que mantém a leitura
 *    de luz saindo de uma porta num quarto escuro, e não de troca de fundo.
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

/** Sai rápido e desacelera: o crescimento se mantém visível o percurso todo. */
export function easeOut(t: number): number {
  return 1 - (1 - clamp01(t)) ** 2;
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Onde a base da porta encosta, em porcentagem da altura da tela. */
export const DOOR_BOTTOM = 50;
/** Onde o topo da porta começa. Porta comprida: ocupa quase metade da cena. */
export const DOOR_TOP = 6;

export type BeamShape = {
  /** Meia-largura da aresta de cima. Igual à da porta, sempre. */
  topHalf: number;
  /** Meia-largura da base, à frente de quem olha. */
  bottomHalf: number;
};

/**
 * @param progress  posição do scroll dentro da seção, de 0 a 1
 * @param doorHalf  meia-largura da porta, em porcentagem da largura da tela
 */
export function beamShape(progress: number, doorHalf: number): BeamShape {
  const p = clamp01(progress);
  return {
    topHalf: doorHalf,
    // A base já nasce larga o bastante para caber o texto do cartaz, e abre de
    // forma contínua durante todo o percurso — sem etapas, sem parar no meio.
    bottomHalf: lerp(doorHalf * 4.0, 175, easeOut(p)),
  };
}

/**
 * Meia-largura do feixe na altura `y` (em % da tela). Serve para conferir se
 * uma linha de texto cabe dentro da luz naquele ponto — fora do vermelho, o
 * texto preto simplesmente desaparece no fundo.
 */
export function halfWidthAt(shape: BeamShape, y: number): number {
  const t = clamp01((y - DOOR_BOTTOM) / (100 - DOOR_BOTTOM));
  return shape.topHalf + (shape.bottomHalf - shape.topHalf) * t;
}

/** Monta o polígono do clip-path. O topo fica colado na base da porta. */
export function beamPolygon({ topHalf, bottomHalf }: BeamShape): string {
  const pontos: [number, number][] = [
    [50 - topHalf, DOOR_BOTTOM],
    [50 + topHalf, DOOR_BOTTOM],
    [50 + bottomHalf, 100],
    [50 - bottomHalf, 100],
  ];
  return `polygon(${pontos.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(", ")})`;
}
