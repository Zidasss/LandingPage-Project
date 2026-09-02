/**
 * As barras do código de barras do ingresso.
 *
 * É enfeite: não codifica nada e ninguém lê com leitor. Quem identifica o
 * pedido é o código escrito embaixo dele, que vai para a planilha. O que as
 * barras fazem é dizer "isto é um ingresso" antes de qualquer texto ser lido.
 *
 * Sendo enfeite, ainda assim precisa ser **determinístico**: o mesmo código
 * gera sempre o mesmo desenho. Sem isso o servidor desenharia um conjunto de
 * barras, o navegador desenharia outro, e o React reclamaria da diferença na
 * hidratação. Nada de `Math.random()` aqui.
 */

/** Quantas barras tem o código. Cheio o bastante para parecer um, sem virar borrão. */
const QUANTIDADE = 44;

/** Larguras possíveis, em pixels. A variação é o que dá o ritmo de código de barras. */
const LARGURAS = [1, 1, 2, 3] as const;

/**
 * FNV-1a: espalha bem, cabe em duas linhas e não depende de biblioteca.
 * Só precisa ser estável, não seguro.
 */
function semente(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Desenha as barras de um código: uma lista de larguras, em pixels.
 *
 * O mesmo texto devolve sempre a mesma lista — é o que faz o ingresso ter um
 * desenho próprio, e o que mantém servidor e navegador desenhando igual.
 */
export function barrasDoCodigo(texto: string): number[] {
  let estado = semente(texto) || 1;
  const larguras: number[] = [];

  for (let i = 0; i < QUANTIDADE; i++) {
    // xorshift32: o passo seguinte a partir do anterior, sempre o mesmo.
    estado ^= estado << 13;
    estado ^= estado >>> 17;
    estado ^= estado << 5;
    estado >>>= 0;
    larguras.push(LARGURAS[estado % LARGURAS.length]);
  }

  return larguras;
}
