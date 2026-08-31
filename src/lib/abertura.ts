/**
 * A linha do tempo da abertura.
 *
 * Existe uma cena só — porta, galera, luz e cartaz — e um progresso só, que vem
 * de quanto já se rolou dentro da seção da abertura. Todas as fases são fatias
 * desse mesmo progresso, e é isso que faz a sequência inteira parecer um
 * movimento contínuo em vez de animações emendadas.
 *
 * As constantes moram aqui porque quem desenha a luz (um elemento fixo, fora da
 * cena) precisa das mesmas marcas de quem desenha a porta. Com cada um usando a
 * sua própria conta, a luz e a porta saíam de fase.
 */

import { cubicBezier } from "@/lib/easing";

/**
 * Altura da seção. O que passa de 100svh é a distância de rolagem.
 *
 * Ela é longa por causa de quem rola rápido, que é a maioria. Medindo um flick
 * de celular (2200px em 380ms, com a desaceleração do momentum) contra a
 * abertura de 240svh, a pessoa via **6 quadros** de animação e, pior, o gesto
 * terminava com a cena já fora da tela: ela era cuspida direto na seção
 * seguinte sem ter visto porta nenhuma.
 *
 * O que resolve não é a animação ser mais lenta, é a seção ser mais alta que o
 * flick. Passando de ~280svh o gesto **termina dentro** da seção: o palco
 * continua preso na tela e a pessoa fica estacionada na animação, em vez de
 * além dela. Em 360svh o mesmo flick mostra 20 quadros dos 24.
 *
 * O preço disso seria o cartaz ficar quase o dobro mais longe de quem rola
 * devagar. Por isso as fases abaixo foram comprimidas junto: elas terminam mais
 * cedo dentro do percurso, e a folga toda vai para a cauda — a luz abrindo, que
 * é onde ninguém tem pressa porque a seção seguinte já está chegando.
 */
export const ALTURA_ABERTURA = "360svh";

/* Fases, em fatias do progresso. Elas se sobrepõem de propósito: cada uma
   começa antes de a anterior terminar, para não haver degrau entre elas. */

/** A abóbora recua e perde a forma até virar um círculo. */
export const RECUO = [0.02, 0.18] as const;
/** O círculo assenta como maçaneta. */
export const MACANETA = [0.155, 0.225] as const;
/** A porta se desenha em volta da maçaneta. */
export const PORTA = [0.2, 0.285] as const;
/** A folha gira e a luz escapa pelo vão. */
export const ABRE = [0.3, 0.47] as const;
/** O cartaz se forma dentro da luz, a partir das gotas. */
export const CARTAZ = [0.42, 0.55] as const;
/** A luz toma a tela e o cartaz escorre para os lados. */
export const ALARGA = [0.55, 1] as const;

/**
 * A curva de todo movimento da abertura: sai devagar, ganha corpo no meio e
 * assenta no fim.
 */
export const suavizar = cubicBezier(0.45, 0, 0.35, 1);

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** Reposiciona `v` dentro de [a, b] e devolve de 0 a 1. */
export function fatia(v: number, [a, b]: readonly [number, number]): number {
  return clamp01((v - a) / (b - a));
}

/**
 * Quanto já se rolou dentro da seção da abertura, de 0 a 1.
 *
 * O percurso desconta uma tela: o palco fica preso no topo enquanto a seção
 * passa, então a rolagem útil é o que sobra da altura dela.
 */
export function progresso(secao: HTMLElement): number {
  const rect = secao.getBoundingClientRect();
  const percurso = rect.height - window.innerHeight;
  return percurso > 0 ? clamp01(-rect.top / percurso) : 0;
}

/**
 * O quanto a folha já girou, de 0 a 1, já suavizado.
 *
 * A porta e a luz precisam ler o mesmo número: a luz é o vão da porta, e no
 * começo da rolagem a curva anda bem devagar. Lendo a fatia crua, a luz abria
 * mais que a fresta — via-se um feixe largo saindo de uma nesga fina.
 */
export function aberturaDaFolha(p: number): number {
  return suavizar(fatia(p, ABRE));
}
