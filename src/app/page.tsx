import { DoorHero } from "@/components/DoorHero";
import { InfoSection } from "@/components/InfoSection";
import { OpeningBeam } from "@/components/OpeningBeam";
import { TicketSection } from "@/components/TicketSection";

export default function Home() {
  return (
    <>
      {/*
        A luz fica fixa atrás de tudo. As seções que vêm depois do hero não
        pintam fundo nenhum: o vermelho que se vê é ela, aberta. É o que faz a
        passagem parecer a luz tomando a página, e não um bloco vermelho subindo
        por baixo.
      */}
      <OpeningBeam />
      <DoorHero />
      <InfoSection />
      <TicketSection />
    </>
  );
}
