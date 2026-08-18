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

/**
 * Proporção da porta: quantas vezes ela é mais alta que larga.
 *
 * A largura sai da altura, e não da largura da tela. Com as duas medidas
 * independentes — largura em vw, altura em % — a porta mudava de forma conforme
 * o formato da janela: 2,4 no celular, 1,1 num monitor largo e 0,7 numa janela
 * baixa, onde deixava de parecer porta.
 */
export const DOOR_RATIO = 2.2;

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

/**
 * Formata os vértices. As duas funções que montam polígono passam por aqui: com
 * formatações diferentes, um `polygon()` com a mesma geometria virava string
 * diferente, e a comparação entre eles falhava sem haver diferença real.
 */
function formatar(pontos: [number, number][]): string {
  return `polygon(${pontos.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(",")})`;
}

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

/**
 * Monta o polígono do clip-path.
 *
 * `topY` existe porque a luz é fixa na tela enquanto a porta rola: para as duas
 * continuarem coladas, o vértice de cima precisa acompanhar onde a porta está
 * naquele instante, e não uma altura constante.
 */
export function beamPolygon(
  { topHalf, bottomHalf }: BeamShape,
  topY: number = BEAM_TOP,
): string {
  const pontos: [number, number][] = [
    [50 - topHalf, topY],
    [50 + topHalf, topY],
    [50 + bottomHalf, 100],
    [50 - bottomHalf, 100],
  ];
  return formatar(pontos);
}

/**
 * Feixe projetado pelo vão de uma porta que está abrindo.
 *
 * O vão não nasce no meio da porta: ele começa como uma fresta na borda do lado
 * da maçaneta e vai abrindo em direção à dobradiça. O feixe tem que sair dali,
 * e não do centro — luz não atravessa a folha fechada.
 *
 * @param abertura 0 = fresta recém-aberta, 1 = porta escancarada
 */
export function beamGapPolygon(shape: BeamShape, abertura: number): string {
  const t = Math.min(1, Math.max(0, abertura));
  /** Borda do vão que não se move: o batente do lado da maçaneta. */
  const batente = 50 + shape.topHalf;
  /** A outra borda é a folha, que caminha até a dobradiça. */
  const folga = 0.8 + (2 * shape.topHalf - 0.8) * t;
  const centro = batente - folga / 2;
  const base = 3 + (shape.bottomHalf - 3) * t;

  const pontos: [number, number][] = [
    [batente - folga, BEAM_TOP],
    [batente, BEAM_TOP],
    [centro + base, 100],
    [centro - base, 100],
  ];
  return formatar(pontos);
}

/**
 * Meia-largura do feixe na altura `y` (em % da tela). Serve para conferir se o
 * texto cabe dentro da luz — fora do vermelho, o texto preto some no fundo.
 */
export function halfWidthAt(shape: BeamShape, y: number): number {
  const t = Math.min(1, Math.max(0, (y - BEAM_TOP) / (100 - BEAM_TOP)));
  return shape.topHalf + (shape.bottomHalf - shape.topHalf) * t;
}
