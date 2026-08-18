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
 * 2. O preenchimento final não é o trapézio crescendo até cobrir tudo, e sim
 *    um clarão radial nascendo da porta. Polígono tem aresta; clarão não tem.
 *    É o que faz a virada terminar sem canto vivo em lugar nenhum.
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
export const DOOR_BOTTOM = 56;
/** Onde o topo da porta começa. Porta comprida: ocupa quase metade da cena. */
export const DOOR_TOP = 7;

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
    // a base abre em ângulo, partindo de pouco mais que a própria porta
    bottomHalf: lerp(doorHalf * 2.6, 145, easeInOut(slice(p, 0, 0.72))),
  };
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

/**
 * O clarão que engole o preto no fim. Entra só depois que a base do feixe já
 * passou das bordas, para as duas etapas serem lidas na ordem certa.
 *
 * O raio é porcentagem do círculo que alcança o canto mais distante, então
 * 100 já cobre a tela inteira — passar muito disso só faz o clarão terminar
 * antes da hora e comer o feixe no meio do caminho.
 */
export function glowRadius(progress: number): number {
  return lerp(0, 104, easeInOut(slice(clamp01(progress), 0.62, 1)));
}

/** Gradiente radial do clarão, centrado na porta. */
export function glowGradient(progress: number): string {
  const raio = glowRadius(progress);
  if (raio <= 0) return "none";
  // a borda difusa é o que substitui a aresta do polígono
  const difusa = raio + 26;
  return `radial-gradient(circle at 50% ${DOOR_BOTTOM}%, var(--color-blood) 0%, var(--color-blood) ${raio.toFixed(1)}%, transparent ${difusa.toFixed(1)}%)`;
}
