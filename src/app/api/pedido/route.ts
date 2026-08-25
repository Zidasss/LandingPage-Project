import {
  FORMATO_TXID,
  MAX_INGRESSOS,
  apenasDigitos,
  validarPedido,
  type Acao,
  type Pedido,
} from "@/lib/pedido";
import { event } from "@/config/event";

/**
 * A rota que leva o pedido até a planilha.
 *
 * Não há banco: a planilha é o registro. Esta rota existe por duas razões, e
 * não para guardar nada. Primeira, o endereço da planilha fica no servidor — no
 * navegador, qualquer um o leria e poderia escrever linhas na mão. Segunda, é
 * onde os dados são conferidos: o que chega aqui vem da rede, e o formulário do
 * site é só um dos caminhos possíveis até aqui.
 *
 * O valor é recalculado a partir do preço do evento, e nunca aceito do cliente:
 * senão bastaria mandar outro número para o pedido entrar na planilha por um
 * preço que ninguém combinou.
 *
 * Sem `SHEETS_WEBHOOK_URL` configurado, a rota responde que não registrou. O
 * site continua funcionando e mostrando o PIX — deixar o pagamento de pé sem
 * planilha é melhor do que derrubar a venda porque o registro falhou.
 */

/** Corpo maior que isto não é pedido, é abuso. */
const LIMITE_BYTES = 4 * 1024;

type Resposta = { registrado: boolean; motivo?: string };

function responder(corpo: Resposta, status: number): Response {
  return Response.json(corpo, { status });
}

export async function POST(req: Request): Promise<Response> {
  const tamanho = Number(req.headers.get("content-length") ?? 0);
  if (tamanho > LIMITE_BYTES)
    return responder({ registrado: false, motivo: "corpo grande demais" }, 413);

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return responder({ registrado: false, motivo: "json inválido" }, 400);
  }

  if (typeof corpo !== "object" || corpo === null)
    return responder({ registrado: false, motivo: "json inválido" }, 400);

  const dados = corpo as Record<string, unknown>;

  const acao: Acao = dados.acao === "pagou" ? "pagou" : "novo";
  const txid = String(dados.txid ?? "");
  if (!FORMATO_TXID.test(txid))
    return responder({ registrado: false, motivo: "código inválido" }, 400);

  const ingressos = Number(dados.ingressos);
  const pedido: Pedido = {
    txid,
    nome: String(dados.nome ?? "").trim(),
    email: String(dados.email ?? "")
      .trim()
      .toLowerCase(),
    whatsapp: apenasDigitos(String(dados.whatsapp ?? "")),
    ingressos: Number.isFinite(ingressos) ? ingressos : 0,
    // Recalculado aqui: o preço é do evento, não do que o cliente mandou.
    valor: 0,
  };

  const erros = validarPedido(pedido);
  if (Object.keys(erros).length > 0)
    return responder({ registrado: false, motivo: "dados inválidos" }, 400);

  pedido.ingressos = Math.min(pedido.ingressos, MAX_INGRESSOS);
  pedido.valor = event.ticket.price * pedido.ingressos;

  // Aparado: variável criada em branco no painel chega como texto vazio ou com
  // espaço, e um endereço de um espaço só passaria por "configurado".
  const destino = process.env.SHEETS_WEBHOOK_URL?.trim();
  if (!destino)
    return responder({ registrado: false, motivo: "planilha não configurada" }, 200);

  try {
    const resposta = await fetch(destino, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        acao,
        segredo: process.env.SHEETS_WEBHOOK_SECRET?.trim() ?? "",
        quando: new Date().toISOString(),
        evento: event.name,
        ...pedido,
      }),
      // A planilha não pode segurar a venda: se demorar, desiste e segue.
      signal: AbortSignal.timeout(8000),
    });
    if (!resposta.ok)
      return responder({ registrado: false, motivo: "planilha recusou" }, 200);
  } catch {
    return responder({ registrado: false, motivo: "planilha fora do ar" }, 200);
  }

  return responder({ registrado: true }, 200);
}
