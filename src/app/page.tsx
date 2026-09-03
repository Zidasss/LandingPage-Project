import { CountdownSection } from "@/components/CountdownSection";
import { FireSection } from "@/components/FireSection";
import { InfoSection } from "@/components/InfoSection";
import { Opening } from "@/components/Opening";
import { OpeningBeam } from "@/components/OpeningBeam";
import { SoundToggle } from "@/components/SoundToggle";
import { TicketSection } from "@/components/TicketSection";
import { lerVagas, type Vagas } from "@/lib/vagas";
import { faseDaVenda } from "@/lib/venda";
import { deadlineDate, event, eventDate } from "@/config/event";

/**
 * De quanto em quanto tempo a contagem de vagas é buscada de novo.
 *
 * Um minuto: a planilha é lenta e tem cota, e ninguém precisa do número ao
 * segundo. Entre uma busca e outra a página serve o valor guardado, então a
 * visita não espera pela planilha.
 */
export const revalidate = 60;

/**
 * Quantos lugares já foram confirmados.
 *
 * A leitura acontece **no servidor**, e por dois motivos: o segredo da planilha
 * não pode chegar ao navegador, e assim o número já vem no HTML — sem número
 * piscando na tela depois que a página carrega.
 *
 * Qualquer tropeço devolve `null`, e o site simplesmente não fala de vagas. A
 * venda nunca depende disto: é enfeite informativo, não caixa.
 */
async function vagasConfirmadas(): Promise<Vagas | null> {
  const planilha = process.env.SHEETS_WEBHOOK_URL?.trim();
  if (!planilha) return null;

  const segredo = process.env.SHEETS_WEBHOOK_SECRET?.trim() ?? "";
  const endereco = `${planilha}?segredo=${encodeURIComponent(segredo)}`;

  try {
    const resposta = await fetch(endereco, { next: { revalidate } });
    if (!resposta.ok) return null;
    return lerVagas(await resposta.json(), event.ticket.capacity);
  } catch {
    return null;
  }
}

export default async function Home() {
  const vagas = await vagasConfirmadas();

  /*
    A venda fecha sozinha: no fim do prazo de pagamento, e de qualquer jeito
    quando a festa começa. A conta é feita aqui, no servidor, e não no
    navegador: relógio de visitante se adianta, se atrasa e se mexe na mão. O
    `revalidate` acima refaz a página de minuto em minuto, então o fechamento
    chega com no máximo um minuto de atraso — irrelevante para um prazo que
    termina à meia-noite.
  */
  const fase = faseDaVenda(new Date(), deadlineDate, eventDate);

  return (
    <>
      {/*
        A abertura é uma cena só: a mesma porta que se desenha, abre e mostra o
        cartaz dentro da luz. Não há um segundo bloco repetindo a porta — era
        justamente a passagem entre os dois que se via.

        A luz fica fixa atrás de tudo. As seções seguintes não pintam fundo
        nenhum: o vermelho que se vê é ela, aberta. É o que faz a passagem
        parecer a luz tomando a página, e não um bloco vermelho subindo por
        baixo.
      */}
      <SoundToggle />
      <OpeningBeam />
      <Opening />
      <InfoSection />
      <CountdownSection />
      <TicketSection vagas={vagas} fase={fase} />
      {/*
        A despedida vem depois do ingresso, e não antes: quem chega aqui já
        passou pelo formulário, então a cena não disputa atenção com a compra.
        E a página ganha um fim — antes ela simplesmente acabava no formulário.
      */}
      <FireSection />
    </>
  );
}
