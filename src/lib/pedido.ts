/**
 * O pedido de ingresso: o que vai para a planilha.
 *
 * As regras moram aqui, e não no formulário, porque o servidor precisa das
 * mesmas: o que chega na rota vem da rede, e nada garante que passou pelo
 * formulário. Com as duas pontas lendo daqui, o que o campo recusa é
 * exatamente o que a rota recusa.
 *
 * Não há banco. Cada pedido é uma linha numa planilha, e é só disso que a festa
 * precisa: saber quem vem e quem pagou.
 */

/** Teto de ingressos por pedido. */
export const MAX_INGRESSOS = 5;

/** O código que identifica o pedido, como `VWX7K2M9`. */
export const FORMATO_TXID = /^VW[A-HJ-NP-Z2-9]{6}$/;

export type Pedido = {
  txid: string;
  nome: string;
  email: string;
  whatsapp: string;
  ingressos: number;
  valor: number;
};

/**
 * O que se está dizendo sobre o pedido.
 *
 * `novo`: acabou de gerar o PIX — entra na planilha como aguardando.
 * `pagou`: a pessoa diz que pagou. Não é confirmação: é o aviso de que há um
 * comprovante para conferir. Quem confirma é quem olha o extrato.
 */
export type Acao = "novo" | "pagou";

export type ErrosPedido = Partial<Record<keyof Pedido, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Só dígitos, para o WhatsApp caber na planilha sem máscara. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/**
 * Um link que abre o WhatsApp com o recado já escrito.
 *
 * A máscara sai aqui: `wa.me` só aceita dígitos, e com `+`, parênteses ou traço
 * ele abre o aplicativo sem a conversa — falha silenciosa, que é a pior.
 */
export function linkWhatsApp(numero: string, recado: string): string {
  return `https://wa.me/${apenasDigitos(numero)}?text=${encodeURIComponent(recado)}`;
}

/**
 * O link que abre o WhatsApp da organização com o recado já escrito.
 *
 * É o que fecha o ciclo do pagamento. O PIX cai na conta como um valor solto —
 * pode haver dois Gustavos, ou a conta estar no nome de outra pessoa. O código
 * do pedido vai no recado, e é por ele que o dinheiro encontra a linha da
 * planilha.
 *
 * Sem isto o site pedia o comprovante sem dizer para quem nem como, e a pessoa
 * ficava com o print na mão sem destino.
 */
export function linkComprovante(dados: {
  numero: string;
  festa: string;
  txid: string;
  nome: string;
  ingressos: number;
  valor: string;
}): string {
  const plural = dados.ingressos === 1 ? "ingresso" : "ingressos";
  const recado =
    `Oi! Fiz o PIX da ${dados.festa}. ` +
    `Pedido ${dados.txid} — ${dados.nome}, ` +
    `${dados.ingressos} ${plural}, ${dados.valor}. ` +
    `Segue o comprovante:`;
  return linkWhatsApp(dados.numero, recado);
}

/** O link de quem chegou com a casa cheia e quer entrar na espera. */
export function linkEspera(numero: string, festa: string): string {
  return linkWhatsApp(
    numero,
    `Oi! Vi que a ${festa} está lotada. Consigo entrar na lista de espera?`,
  );
}

export function validarPedido(pedido: Partial<Pedido>): ErrosPedido {
  const erros: ErrosPedido = {};

  if (!pedido.nome || pedido.nome.trim().length < 3)
    erros.nome = "Escreva seu nome completo.";
  else if (pedido.nome.length > 120) erros.nome = "Nome longo demais.";

  const email = pedido.email?.trim() ?? "";
  if (!EMAIL.test(email) || email.length > 160)
    erros.email = "E-mail inválido — é nele que chega a confirmação.";

  const fone = apenasDigitos(pedido.whatsapp ?? "");
  if (fone.length < 10 || fone.length > 13)
    erros.whatsapp = "Informe o WhatsApp com DDD.";

  const n = pedido.ingressos;
  if (!Number.isInteger(n) || n === undefined || n < 1 || n > MAX_INGRESSOS)
    erros.ingressos = `Entre 1 e ${MAX_INGRESSOS} ingressos.`;

  return erros;
}
