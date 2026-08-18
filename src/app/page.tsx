import { Hero } from "@/components/Hero";
import { InfoSection } from "@/components/InfoSection";
import { event } from "@/config/event";

export default function Home() {
  return (
    <>
      <Hero />
      <InfoSection />

      <section
        id="ingresso"
        className="border-crypt flex min-h-[60vh] items-center justify-center border-t px-6 py-24"
      >
        <div className="max-w-lg text-center">
          <h2 className="font-heading glow-cyan text-cyan text-2xl tracking-[0.2em] uppercase sm:text-3xl">
            Ingresso
          </h2>
          <p className="font-mono text-ash mt-6 text-sm leading-relaxed">
            Em breve: QR Code do PIX, confirmação de presença e envio do
            comprovante por e-mail.
          </p>
          <p className="font-mono text-ash/60 mt-4 text-xs">
            {event.dateLabel}, {event.weekdayLabel}, a partir das{" "}
            {event.timeLabel}.
          </p>
        </div>
      </section>
    </>
  );
}
