import { CountdownSection } from "@/components/CountdownSection";
import { InfoSection } from "@/components/InfoSection";
import { Opening } from "@/components/Opening";
import { OpeningBeam } from "@/components/OpeningBeam";
import { TicketSection } from "@/components/TicketSection";

export default function Home() {
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
      <OpeningBeam />
      <Opening />
      <InfoSection />
      <CountdownSection />
      <TicketSection />
    </>
  );
}
