/**
 * Em que pé está a venda.
 *
 * São três momentos, e cada um pede uma tela diferente:
 *
 * - `aberta` — dá para pagar, o formulário aparece.
 * - `prazo-encerrado` — passou a data limite, mas a festa ainda vai acontecer.
 *   Quem chega aqui não perdeu a festa, perdeu o prazo: ainda pode negociar com
 *   a organização.
 * - `festa-passou` — não há mais o que negociar.
 *
 * Sem essa distinção o site diria "a festa já foi" em 26 de setembro, três
 * semanas antes dela acontecer.
 */
export type FaseDaVenda = "aberta" | "prazo-encerrado" | "festa-passou";

/** Uma data que dá para usar em conta, ou nada. */
function instante(d: Date): number | null {
  const t = d.getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * A fase da venda num instante.
 *
 * A festa é o teto absoluto: mesmo que o prazo esteja quebrado ou distante, a
 * venda nunca sobrevive à festa — cobrar por um ingresso de uma festa que já
 * aconteceu é tirar dinheiro de alguém por engano.
 *
 * Já o prazo quebrado sozinho não fecha nada. Entre vender demais e apagar o
 * formulário do site por causa de um typo na configuração, o segundo é pior:
 * a festa fica sem inscrição nenhuma e ninguém entende o motivo.
 */
export function faseDaVenda(
  agora: Date,
  limite: Date,
  comeco: Date,
): FaseDaVenda {
  const t = agora.getTime();

  const festa = instante(comeco);
  if (festa !== null && t >= festa) return "festa-passou";

  const prazo = instante(limite);
  if (prazo !== null && t >= prazo) return "prazo-encerrado";

  return "aberta";
}

/** Atalho para quem só precisa saber se o formulário sai ou fica. */
export function vendaEncerrada(fase: FaseDaVenda): boolean {
  return fase !== "aberta";
}
