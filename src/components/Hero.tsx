import { Countdown } from "@/components/Countdown";
import { SynthGrid } from "@/components/SynthGrid";
import { event } from "@/config/event";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <SynthGrid />

      {/* escurece o miolo para o texto nunca competir com o sol */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 55%, rgba(5,4,10,0.82) 0%, rgba(5,4,10,0.45) 55%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-8">
        <p className="font-mono glow-cyan text-cyan/90 text-[0.65rem] tracking-[0.4em] uppercase sm:text-sm sm:tracking-[0.5em]">
          {event.dateLabel} · {event.edition} · {event.venue.city}
        </p>

        <h1 className="font-display animate-flicker glow-magenta text-magenta text-5xl leading-[1.05] sm:text-7xl lg:text-8xl">
          {event.name}
        </h1>

        <p className="font-heading text-bone/85 max-w-xl text-sm tracking-[0.18em] uppercase sm:text-base">
          {event.tagline}
        </p>

        <div className="mt-2 w-full">
          <Countdown target={event.startsAt} />
        </div>

        <a
          href="#ingresso"
          className="font-heading border-pumpkin text-pumpkin hover:bg-pumpkin hover:text-void hover:shadow-pumpkin/40 mt-4 inline-block rounded-sm border-2 px-8 py-4 text-sm tracking-[0.25em] uppercase transition-all duration-300 hover:shadow-[0_0_40px] sm:text-base"
        >
          Confirmar presença
        </a>
      </div>

      <div className="font-mono text-ash/60 absolute bottom-8 z-10 text-[0.65rem] tracking-[0.3em] uppercase">
        role para baixo ▾
      </div>
    </section>
  );
}
