/**
 * Quantos lugares já foram confirmados, e o que dizer sobre isso.
 *
 * Uma vaga só conta quando o dinheiro entrou — quer dizer, quando a organização
 * escreveu na coluna PAGO da planilha. A linha do pedido nasce quando a pessoa
 * gera o PIX, e a maior parte dessas nunca vira pagamento: contá-las encheria a
 * festa de gente que não vem, e o site anunciaria "lotado" com a conta vazia.
 *
 * E conta ingressos, não linhas: quem levou dois ocupa dois lugares.
 */

export type Vagas = {
  /** Ingressos pagos e confirmados. */
  confirmados: number;
  /** O teto da festa. */
  capacidade: number;
  /** O que sobra. Nunca negativo, mesmo se a planilha passar do teto. */
  restantes: number;
};

/**
 * Lê o que a planilha devolveu.
 *
 * Devolve `null` em qualquer resposta que não seja um número são. É de
 * propósito: sem notícia é melhor não dizer nada do que dizer zero, que na tela
 * lê como "ninguém vem".
 */
export function lerVagas(bruto: unknown, capacidade: number): Vagas | null {
  if (typeof bruto !== "object" || bruto === null) return null;
  const valor = (bruto as Record<string, unknown>).confirmados;
  const confirmados = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(confirmados) || confirmados < 0) return null;
  if (!Number.isFinite(capacidade) || capacidade <= 0) return null;

  const inteiro = Math.floor(confirmados);
  return {
    confirmados: inteiro,
    capacidade,
    restantes: Math.max(0, capacidade - inteiro),
  };
}

/** A partir de quantas vagas restantes o selo abre a boca. */
const POUCAS = 30;

/**
 * O ponto em que "está acabando" passa a ser verdade.
 *
 * São 30 vagas, escolhidas a dedo para esta festa. A metade da lotação é um
 * teto: numa festa pequena, avisar a 30 vagas de uma casa de 40 seria avisar
 * desde o primeiro dia — o aviso perde o sentido e vira o anúncio de vazio que
 * o silêncio existe para evitar.
 */
function poucas(capacidade: number): number {
  return Math.min(POUCAS, Math.floor(capacidade / 2));
}

export type Recado =
  | { tom: "lotado"; texto: string }
  | { tom: "ultimas"; texto: string }
  | null;

/**
 * O que dizer — e, principalmente, quando calar.
 *
 * O selo fala de vaga que sobra, nunca de gente que já confirmou: quantos
 * vieram é conta da organização, e anunciar "12 de 130" no meio da venda conta
 * para todo mundo o quanto ainda está vazio.
 *
 * Mas dizer as restantes cedo demais tem o mesmo defeito ao contrário: "127
 * vagas restantes" no primeiro dia também anuncia festa vazia, só que com
 * outras palavras. Por isso o selo fica calado até a conta virar urgência de
 * verdade, e só então abre a boca.
 */
export function recadoDeVagas(vagas: Vagas | null): Recado {
  if (!vagas) return null;

  if (vagas.restantes === 0) {
    return { tom: "lotado", texto: "Lotado" };
  }

  if (vagas.restantes <= poucas(vagas.capacidade)) {
    const plural = vagas.restantes === 1 ? "última vaga" : "últimas vagas";
    return { tom: "ultimas", texto: `${vagas.restantes} ${plural}` };
  }

  return null;
}
