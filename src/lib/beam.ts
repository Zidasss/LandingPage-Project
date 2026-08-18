/**
 * Geometria da cena da porta.
 *
 * Tudo aqui é constante: a cena não reage ao scroll. O feixe é um trapézio fixo
 * que nasce exatamente na largura da porta — se a aresta de cima passar disso,
 * aparece um degrau reto contra o preto e a luz deixa de sair da abertura.
 *
 * As medidas são porcentagens da área visível, então a cena acompanha qualquer
 * proporção de tela. Há dois conjuntos porque a porta tem largura diferente no
 * celular e no desktop, e o feixe precisa sair do tamanho certo nos dois.
 */

/** Onde a base da porta encosta, em porcentagem da altura da tela. */
export const DOOR_BOTTOM = 50;
/** Onde o topo da porta começa. Porta comprida: quase metade da cena. */
export const DOOR_TOP = 6;
/**
 * Faixa preta entre a base da porta e o começo da luz no chão. É o respiro que
 * separa a abertura do reflexo — sem ela, a porta e o feixe viram uma peça só.
 */
export const DOOR_GAP = 1.6;
/** Altura em que a luz encosta no chão. */
export const BEAM_TOP = DOOR_BOTTOM + DOOR_GAP;

export type BeamShape = {
  /** Meia-largura da aresta de cima. Igual à da porta, sempre. */
  topHalf: number;
  /** Meia-largura da base, à frente de quem olha. */
  bottomHalf: number;
};

/** Celular: a porta é larga porque a tela é estreita. */
export const BEAM_MOBILE: BeamShape = { topHalf: 20, bottomHalf: 46 };
/** Desktop: a porta é uma fatia no meio de uma tela deitada. */
export const BEAM_DESKTOP: BeamShape = { topHalf: 11, bottomHalf: 44 };

/** Monta o polígono do clip-path. O topo fica colado na base da porta. */
export function beamPolygon({ topHalf, bottomHalf }: BeamShape): string {
  const pontos: [number, number][] = [
    [50 - topHalf, BEAM_TOP],
    [50 + topHalf, BEAM_TOP],
    [50 + bottomHalf, 100],
    [50 - bottomHalf, 100],
  ];
  return `polygon(${pontos.map(([x, y]) => `${x}% ${y}%`).join(",")})`;
}

/**
 * Meia-largura do feixe na altura `y` (em % da tela). Serve para conferir se o
 * texto cabe dentro da luz — fora do vermelho, o texto preto some no fundo.
 */
export function halfWidthAt(shape: BeamShape, y: number): number {
  const t = Math.min(1, Math.max(0, (y - BEAM_TOP) / (100 - BEAM_TOP)));
  return shape.topHalf + (shape.bottomHalf - shape.topHalf) * t;
}
