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

/** A partir daqui a festa está acabando, e vale dizer. */
const POUCAS = 15;
/** Abaixo disto não há o que comemorar — melhor ficar calado. */
const PROVA_SOCIAL = 10;

export type Recado =
  | { tom: "lotado"; texto: string }
  | { tom: "ultimas"; texto: string }
  | { tom: "enchendo"; texto: string }
  | null;

/**
 * O que dizer — e, principalmente, quando calar.
 *
 * Um contador que fala sempre trabalha contra a festa: "3 de 80 confirmados",
 * no começo da venda, anuncia que ninguém vem. Por isso ele só abre a boca
 * quando tem o que dizer — para provar que a festa está enchendo, ou para
 * avisar que está no fim. Entre uma coisa e outra, silêncio.
 */
export function recadoDeVagas(vagas: Vagas | null): Recado {
  if (!vagas) return null;

  if (vagas.restantes === 0) {
    return { tom: "lotado", texto: "Lotado" };
  }

  if (vagas.restantes <= POUCAS) {
    const plural = vagas.restantes === 1 ? "última vaga" : "últimas vagas";
    return { tom: "ultimas", texto: `${vagas.restantes} ${plural}` };
  }

  if (vagas.confirmados >= PROVA_SOCIAL) {
    return {
      tom: "enchendo",
      texto: `${vagas.confirmados} de ${vagas.capacidade} confirmados`,
    };
  }

  return null;
}
