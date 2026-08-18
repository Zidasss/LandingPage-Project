import { DoorHero } from "@/components/DoorHero";
import { InfoSection } from "@/components/InfoSection";
import { TicketSection } from "@/components/TicketSection";

export default function Home() {
  return (
    <>
      <DoorHero />
      {/* a luz da porta continua aqui: a seção seguinte já nasce vermelha */}
      <InfoSection />
      <TicketSection />
    </>
  );
}
