"use client";

import { useState } from "react";
import { Field } from "@/components/Field";
import { PixPanel } from "@/components/PixPanel";
import { TicketWall } from "@/components/TicketWall";
import { brl, makeTxid, maskPhone } from "@/lib/format";
import {
  MAX_INGRESSOS,
  linkComprovante,
  linkEspera,
  validarPedido,
  type Acao,
  type ErrosPedido,
} from "@/lib/pedido";
import { recadoDeVagas, type Vagas } from "@/lib/vagas";
import { event } from "@/config/event";

type Convidado = {
  nome: string;
  email: string;
  whatsapp: string;
  ingressos: number;
};

/**
 * Avisa a planilha, sem nunca atrapalhar a venda.
 *
 * O PIX já está na tela quando isto roda. Se a planilha estiver fora do ar, o
 * pagamento continua de pé — o que se perde é o registro, e esse a organização
 * recupera pelo comprovante. Por isso a falha só é devolvida, nunca lançada.
 */
async function avisarPlanilha(
  acao: Acao,
  convidado: Convidado,
  txid: string,
): Promise<boolean> {
  try {
    const resposta = await fetch("/api/pedido", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ acao, txid, ...convidado }),
    });
    const corpo = (await resposta.json()) as { registrado?: boolean };
    return corpo.registrado === true;
  } catch {
    return false;
  }
}

/**
 * A seção do ingresso.
 *
 * Uma parede de ingressos corre atrás, escurecida por um spotlight diagonal —
 * o cenário. No centro, um único ingresso em destaque, iluminado e parado, que
 * é o próprio formulário: o cabeçalho vermelho carrega a identidade da festa e
 * o corpo escuro segura os campos, para o texto ficar legível sobre a parede.
 */
export function TicketSection({ vagas = null }: { vagas?: Vagas | null }) {
  const recado = recadoDeVagas(vagas);
  const lotado = recado?.tom === "lotado";

  const [convidado, setConvidado] = useState<Convidado>({
    nome: "",
    email: "",
    whatsapp: "",
    ingressos: 1,
  });
  const [erros, setErros] = useState<ErrosPedido>({});
  const [txid, setTxid] = useState<string | null>(null);
  /** null = ainda não avisou que pagou; depois, se o aviso entrou na planilha. */
  const [avisouPagamento, setAvisouPagamento] = useState<boolean | null>(null);
  const [avisando, setAvisando] = useState(false);

  const total = event.ticket.price * convidado.ingressos;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const achados = validarPedido(convidado);
    setErros(achados);
    if (Object.keys(achados).length > 0) return;
    const codigo = makeTxid();
    setTxid(codigo);
    // O pedido entra na planilha como aguardando. A pessoa não espera por isso:
    // o PIX aparece na mesma hora.
    void avisarPlanilha("novo", convidado, codigo);
  }

  /**
   * O aviso sai enquanto o WhatsApp abre.
   *
   * Não se espera a planilha responder para deixar o link seguir: navegador
   * bloqueia janela aberta depois de um `await`, e o comprovante — que é o que
   * garante a vaga — é mais importante que o registro. Por isso o botão é um
   * link de verdade, e isto só corre ao lado.
   */
  function registrarEnvio() {
    if (!txid || avisando) return;
    setAvisando(true);
    void avisarPlanilha("pagou", convidado, txid).then((ok) => {
      setAvisouPagamento(ok);
      setAvisando(false);
    });
  }

  function update<K extends keyof Convidado>(campo: K, valor: Convidado[K]) {
    setConvidado((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  return (
    <section
      id="ingresso"
      className="bg-ink relative z-40 overflow-hidden px-6 pt-[42vh] pb-20 sm:py-32"
    >
      {/* cenário: a parede de ingressos correndo */}
      <TicketWall />

      {/*
        No celular a parede não cabe atrás do cartão — ele toma a tela toda. Por
        isso ela vira um cabeçalho visível no topo: um degradê deixa o alto claro
        (parede à mostra) e escurece onde o formulário começa. No desktop sobra
        espaço nas laterais, então o spotlight volta a concentrar a luz no centro.
      */}
      <div
        aria-hidden
        className="absolute inset-0 sm:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.15) 26%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.94) 52%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden sm:block"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 45%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.82) 55%, rgba(0,0,0,0.96) 100%)",
        }}
      />

      {/* o ingresso de destaque: é o formulário */}
      <div className="relative mx-auto max-w-md">
        <div className="border-blood/40 bg-ink/95 border shadow-[0_0_80px_rgba(255,26,18,0.25)] backdrop-blur-sm">
          {/* cabeçalho: a identidade do ingresso */}
          <div className="bg-blood text-ink relative px-6 pt-5 pb-7">
            <div className="flex items-start justify-between gap-3">
              <p className="font-heading text-[0.6rem] font-bold tracking-[0.35em] uppercase opacity-80">
                ▶ {lotado ? "casa cheia" : "garanta seu lugar"}
              </p>
              {/*
                O selo só existe quando há o que dizer: prova de que a festa está
                enchendo, ou aviso de que está no fim. No começo da venda ele não
                aparece — "3 de 80" é propaganda de festa vazia.
              */}
              {recado && (
                <span className="font-heading bg-ink/85 text-bone shrink-0 px-2 py-1 text-[0.55rem] font-bold tracking-[0.2em] uppercase">
                  {recado.texto}
                </span>
              )}
            </div>
            <p className="font-display mt-1 text-4xl leading-none uppercase sm:text-5xl">
              {event.name}
            </p>
            <p className="font-heading mt-2 text-[0.62rem] font-bold tracking-[0.25em] uppercase opacity-80">
              {event.dateLabel} · {event.timeLabel} · {brl(event.ticket.price)}
            </p>

            {/* picote entre o cabeçalho e o corpo */}
            <div
              className="absolute inset-x-4 bottom-0 h-px translate-y-1/2"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, currentColor 0 5px, transparent 5px 11px)",
              }}
            />
            <span className="bg-ink absolute bottom-0 left-0 h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full" />
            <span className="bg-ink absolute right-0 bottom-0 h-5 w-5 translate-x-1/2 translate-y-1/2 rounded-full" />
          </div>

          {/* corpo: o formulário */}
          <div className="px-6 pt-8 pb-7">
            {lotado ? (
              /*
                Com a casa cheia o formulário sai da frente: deixar alguém pagar
                por um lugar que não existe é pior do que dizer não. Mas a porta
                não fecha — quem chegou tarde vai para a espera, e desistência
                acontece.
              */
              <div className="flex flex-col gap-6 text-left">
                <div>
                  <p className="font-heading text-blood text-sm font-bold tracking-[0.2em] uppercase">
                    Os {event.ticket.capacity} lugares acabaram
                  </p>
                  <p className="text-bone/70 mt-3 text-sm leading-relaxed">
                    Ainda dá para entrar na lista de espera: sempre aparece
                    desistência, e a organização chama pela ordem.
                  </p>
                </div>
                <a
                  href={linkEspera(event.organizacao.whatsapp, event.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-heading bg-blood text-ink hover:bg-ember block w-full px-6 py-4 text-center text-xs font-bold tracking-[0.25em] uppercase transition-colors"
                >
                  entrar na lista de espera
                </a>
              </div>
            ) : txid === null ? (
              <form onSubmit={submit} noValidate className="flex flex-col gap-5">
                <Field
                  id="nome"
                  label="Nome completo"
                  type="text"
                  autoComplete="name"
                  placeholder="Como está no seu documento"
                  value={convidado.nome}
                  error={erros.nome}
                  onChange={(e) => update("nome", e.target.value)}
                />
                <Field
                  id="email"
                  label="E-mail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  hint="A confirmação e o comprovante chegam aqui."
                  value={convidado.email}
                  error={erros.email}
                  onChange={(e) => update("email", e.target.value)}
                />
                <Field
                  id="whatsapp"
                  label="WhatsApp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(41) 99999-9999"
                  value={convidado.whatsapp}
                  error={erros.whatsapp}
                  onChange={(e) => update("whatsapp", maskPhone(e.target.value))}
                />
                <Field
                  id="quantidade"
                  label="Quantos ingressos"
                  type="number"
                  min={1}
                  max={MAX_INGRESSOS}
                  inputMode="numeric"
                  value={convidado.ingressos}
                  error={erros.ingressos}
                  onChange={(e) => update("ingressos", Number(e.target.value))}
                />

                <div className="border-bone/15 text-bone flex items-center justify-between border-t pt-5">
                  <span className="font-heading text-ash text-xs font-bold tracking-[0.2em] uppercase">
                    Total
                  </span>
                  <span className="font-display text-blood text-3xl">
                    {brl(total)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="font-heading bg-blood text-ink hover:bg-ember px-8 py-4 text-sm font-bold tracking-[0.25em] uppercase transition-colors"
                >
                  gerar pix
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-8">
                <PixPanel amount={total} txid={txid} guestName={convidado.nome} />

                <div className="border-bone/15 border-t pt-6 text-left">
                  <p className="font-heading text-blood text-sm font-bold tracking-[0.2em] uppercase">
                    Próximo passo
                  </p>
                  <p className="text-bone/70 mt-3 text-sm leading-relaxed">
                    Faça o PIX e mande o comprovante no WhatsApp — é o
                    comprovante que garante sua vaga. O botão abaixo já abre a
                    conversa com a mensagem escrita; é só anexar o print.
                  </p>

                  {/*
                    Link de verdade, e não botão com window.open: aberto depois
                    de esperar a planilha, o navegador bloquearia a janela. Aqui
                    o WhatsApp abre no gesto da pessoa e o registro corre ao lado.
                  */}
                  <a
                    href={linkComprovante({
                      numero: event.organizacao.whatsapp,
                      festa: event.name,
                      txid,
                      nome: convidado.nome,
                      ingressos: convidado.ingressos,
                      valor: brl(total),
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={registrarEnvio}
                    className="font-heading bg-blood text-ink hover:bg-ember mt-5 block w-full px-6 py-4 text-center text-xs font-bold tracking-[0.25em] uppercase transition-colors"
                  >
                    enviar comprovante no whatsapp
                  </a>

                  {avisouPagamento !== null && (
                    <p className="text-ash mt-4 text-xs leading-relaxed">
                      {avisouPagamento
                        ? "Avisamos a organização que você pagou."
                        : "Não conseguimos avisar a organização automaticamente — o comprovante no WhatsApp resolve do mesmo jeito."}
                    </p>
                  )}

                  <p className="text-ash mt-4 text-xs leading-relaxed">
                    Guarde o código <strong className="text-bone">{txid}</strong>
                    : é por ele que seu pagamento é encontrado.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTxid(null);
                    setAvisouPagamento(null);
                  }}
                  className="font-heading text-ash hover:text-bone text-xs font-bold tracking-[0.25em] uppercase transition-colors"
                >
                  ← corrigir meus dados
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
