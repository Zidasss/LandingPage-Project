import { DoorHero } from "@/components/DoorHero";
import { InfoSection } from "@/components/InfoSection";
import { TicketSection } from "@/components/TicketSection";

export default function Home() {
  return (
    <>
      <DoorHero />
      {/* o feixe termina cobrindo a tela de vermelho e encosta aqui: a luz
          não some, ela vira a próxima seção */}
      <div className="bg-blood text-ink">
        <InfoSection />
      </div>
      <TicketSection />
    </>
  );
}
