"use client";

import { useState } from "react";
import { Barcode } from "@/components/Barcode";
import { Field } from "@/components/Field";
import { PixPanel } from "@/components/PixPanel";
import { TicketWall } from "@/components/TicketWall";
import { brl, makeTxid, maskPhone } from "@/lib/format";
import {
  MAX_INGRESSOS,
  linkAtrasado,
  linkComprovante,
  linkEspera,
  validarPedido,
  type Acao,
  type ErrosPedido,
} from "@/lib/pedido";
import { recadoDeVagas, type Vagas } from "@/lib/vagas";
import { vendaEncerrada, type FaseDaVenda } from "@/lib/venda";
import { deadlineLabel, event } from "@/config/event";

type Convidado = {
  nome: string;
  email: string;
  whatsapp: string;
  ingressos: number;
};

/**
 * A linha de picote: o tracejado e as duas mordidas nas bordas.
 *
 * Fica numa caixa de altura zero, para poder ser posta *entre* dois blocos sem
 * empurrar nada — o tracejado nasce exatamente na emenda, que é onde o papel se
 * rasgaria.
 *
 * As mordidas são círculos centrados na borda do cartão. Metade de cada um cai
 * para fora e é o `overflow-hidden` do cartão que a corta; sem esse corte elas
 * viram bolas pretas boiando sobre a parede.
 */
function Picote({ cor }: { cor: string }) {
  return (
    <div aria-hidden className={`relative h-0 ${cor}`}>
      <div
        className="absolute inset-x-4 top-0 h-px -translate-y-1/2"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, currentColor 0 5px, transparent 5px 11px)",
        }}
      />
      <span className="bg-ink absolute top-0 left-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <span className="bg-ink absolute top-0 right-0 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full" />
    </div>
  );
}

/**
 * Os dados impressos do ingresso: onde é a festa.
 *
 * Um ingresso de verdade carrega o endereço, porque é o papel que a pessoa tem
 * na mão na hora de sair de casa. Aqui ele também é o que faz o corpo do cartão
 * parecer ingresso, e não formulário: sem isto o picote separava o canhoto
 * vermelho de uma caixa de campos qualquer.
 */
function DadosImpressos({ mostrarPrazo }: { mostrarPrazo: boolean }) {
  return (
    <div className="border-bone/10 border-b">
      <dl className="divide-bone/10 grid grid-cols-2 divide-x text-left">
        <div className="px-5 py-4">
          <dt className="font-heading text-ash text-[0.55rem] font-bold tracking-[0.28em] uppercase">
            Local
          </dt>
          <dd className="text-bone/85 mt-1.5 text-[0.72rem] leading-snug">
            {event.venue.name}
          </dd>
        </div>
        <div className="px-5 py-4">
          <dt className="font-heading text-ash text-[0.55rem] font-bold tracking-[0.28em] uppercase">
            Endereço
          </dt>
          <dd className="text-bone/85 mt-1.5 text-[0.72rem] leading-snug">
            {event.venue.street}
          </dd>
        </div>
      </dl>

      {/*
        A linha de validade do ingresso. Fica logo abaixo do endereço, e não
        perto do botão, porque é informação do papel e não do formulário: vale
        antes de a pessoa decidir preencher qualquer coisa.

        Some quando o prazo passa — prazo vencido em vermelho, ao lado de uma
        tela que já diz que acabou, só repete a má notícia.
      */}
      {mostrarPrazo && (
        <p className="font-heading bg-blood text-ink px-5 py-2.5 text-center text-[0.68rem] font-bold tracking-[0.22em] uppercase">
          Pague até {deadlineLabel}
        </p>
      )}
    </div>
  );
}

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
 * O pé do ingresso: o código de barras e o número do pedido.
 *
 * Antes de existir pedido ele mostra a edição da festa — o ingresso já está
 * impresso, só não foi emitido para ninguém ainda. Quando o código sai, o
 * desenho das barras muda junto: o papel em branco vira o *seu* ingresso, e
 * essa troca acontece na mesma tela em que o PIX aparece.
 */
function RodapeCodigo({ codigo }: { codigo: string | null }) {
  return (
    /*
      A lavagem clara é o que faz o pé virar canhoto: sem ela o rodapé é a mesma
      chapa preta do corpo, e as mordidas do picote — que são pretas — ficam
      invisíveis. Com meio tom de diferença elas voltam a morder alguma coisa.
    */
    <div className="bg-bone/[0.03] flex items-end justify-between gap-4 px-6 pt-6 pb-6">
      <div className="text-left">
        <p className="font-heading text-ash text-[0.55rem] font-bold tracking-[0.28em] uppercase">
          {codigo ? "Código do pedido" : "Edição"}
        </p>
        <p className="font-mono text-bone mt-1.5 text-sm tracking-[0.25em]">
          {codigo ?? event.edition}
        </p>
      </div>
      <Barcode valor={codigo ?? `${event.name}${event.edition}`} />
    </div>
  );
}

/**
 * A seção do ingresso.
 *
 * Uma parede de ingressos corre atrás, escurecida por um spotlight diagonal —
 * o cenário. No centro, um único ingresso em destaque, iluminado e parado, que
 * é o próprio formulário: o cabeçalho vermelho carrega a identidade da festa e
 * o corpo escuro segura os campos, para o texto ficar legível sobre a parede.
 */
export function TicketSection({
  vagas = null,
  fase = "aberta",
}: {
  vagas?: Vagas | null;
  fase?: FaseDaVenda;
}) {
  const encerrada = vendaEncerrada(fase);
  const recado = encerrada ? null : recadoDeVagas(vagas);
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
        {/*
          `overflow-hidden` aqui é o que faz os picotes serem picotes. Eles são
          círculos centrados na borda: sem o corte, metade de cada um sobra para
          fora e vira uma bola preta em cima da parede. Cortados, sobra a metade
          de dentro — que é a mordida no papel.
        */}
        <div className="border-blood/40 bg-ink/95 overflow-hidden border shadow-[0_0_80px_rgba(255,26,18,0.25)] backdrop-blur-sm">
          {/* cabeçalho: a identidade do ingresso */}
          <div className="bg-blood text-ink relative px-6 pt-5 pb-7">
            <div className="flex items-start justify-between gap-3">
              <p className="font-heading text-[0.6rem] font-bold tracking-[0.35em] uppercase opacity-80">
                ▶{" "}
                {fase === "festa-passou"
                  ? "a festa já foi"
                  : fase === "prazo-encerrado"
                    ? "fora do prazo"
                    : lotado
                      ? "casa cheia"
                      : "garanta seu lugar"}
              </p>
              {/*
                O selo só existe quando há o que dizer, e só fala de vaga que
                sobra — nunca de quantos já confirmaram. Enquanto houver folga
                ele não aparece: "127 vagas restantes" é propaganda de festa
                vazia com outras palavras.
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

          </div>

          {/* o canhoto se separa aqui */}
          <Picote cor="text-ink" />
          <DadosImpressos mostrarPrazo={!encerrada} />

          {/* corpo: o formulário */}
          <div className="px-6 pt-7 pb-7">
            {encerrada ? (
              /*
                Passada a hora da festa, o formulário some. Ele não tem como
                saber que a festa acabou, e continuaria cobrando por um ingresso
                que não existe mais — quem pagasse só descobriria depois.

                Some o formulário, fica o telefone: quem pagou e não conseguiu
                avisar, e quem quer entrar na última hora, ainda precisam de
                alguém do outro lado.
              */
              <div className="flex flex-col gap-6 text-left">
                <div>
                  <p className="font-heading text-blood text-sm font-bold tracking-[0.2em] uppercase">
                    {fase === "festa-passou"
                      ? "A festa acabou"
                      : "O prazo encerrou"}
                  </p>
                  {/*
                    As duas situações não são a mesma, e dizer a errada é pior
                    do que não dizer nada: quem chega no dia 26 de setembro não
                    perdeu a festa — ela ainda vai acontecer —, perdeu o prazo, e
                    ainda tem o que conversar com a organização.
                  */}
                  <p className="text-bone/70 mt-3 text-sm leading-relaxed">
                    {fase === "festa-passou" ? (
                      <>
                        A {event.name} foi em {event.dateLabel}, às{" "}
                        {event.timeLabel}. Se você pagou e não chegou a mandar o
                        comprovante, fale com a organização — dá para resolver.
                      </>
                    ) : (
                      <>
                        Os pagamentos iam até {deadlineLabel} e a lista já foi
                        fechada para a organização se planejar. Se você ainda
                        quer ir, fale com a gente: às vezes sobra lugar.
                      </>
                    )}
                  </p>
                </div>
                <a
                  href={linkAtrasado(event.organizacao.whatsapp, event.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-heading border-blood text-blood hover:bg-blood hover:text-ink block w-full border px-6 py-4 text-center text-xs font-bold tracking-[0.25em] uppercase transition-colors"
                >
                  falar com a organização
                </a>
              </div>
            ) : lotado ? (
              /*
                Com a casa cheia o formulário sai da frente: deixar alguém pagar
                por um lugar que não existe é pior do que dizer não. Mas a porta
                não fecha — quem chegou tarde vai para a espera, e desistência
                acontece.
              */
              <div className="flex flex-col gap-6 text-left">
                <div>
                  <p className="font-heading text-blood text-sm font-bold tracking-[0.2em] uppercase">
                    As vagas acabaram
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

                {/*
                  Tracejado, e não linha cheia: linha cheia aqui virava só mais
                  uma pauta de campo logo abaixo da última: o mesmo desenho para
                  duas coisas diferentes. O picote diz que daqui para baixo é
                  outra parte do ingresso.
                */}
                <div className="border-bone/25 text-bone flex items-center justify-between border-t border-dashed pt-5">
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

          {/* o pé do ingresso, destacável como o canhoto de cima */}
          <Picote cor="text-bone/25" />
          <RodapeCodigo codigo={txid} />
        </div>
      </div>
    </section>
  );
}
