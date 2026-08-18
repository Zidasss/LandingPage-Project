import { Countdown } from "@/components/Countdown";
import { Barcode } from "@/components/Barcode";
import { Marquee } from "@/components/Marquee";
import { Parallax } from "@/components/Parallax";
import { PosterSubject } from "@/components/PosterSubject";
import { PosterWord } from "@/components/PosterWord";
import { event } from "@/config/event";

/**
 * Hero em formato de cartaz: o nome quebrado em duas palavras que sangram de
 * margem a margem, o personagem entre elas e os textos de apoio nas laterais.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-between overflow-hidden px-5 pt-5 pb-8">
      {/* ---- topo ---- */}
      <header className="relative z-30">
        <h1 className="text-pumpkin">
          <span className="sr-only">{event.name}</span>
          <PosterWord>Volvo</PosterWord>
        </h1>
        <div className="font-heading text-bone -mt-1 flex items-baseline justify-between text-[3vw] font-bold tracking-tight uppercase sm:text-[1.15vw]">
          <span>Halloween</span>
          <span>{event.edition}</span>
        </div>
      </header>

      {/* ---- miolo ---- */}
      {/*
        Três colunas: texto | personagem | contagem. O personagem tem coluna
        própria, então nunca cobre os textos — e transborda na vertical de
        propósito, passando por trás das duas palavras.
      */}
      <div className="relative grid flex-1 grid-cols-[auto_1fr] items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        {/* No celular não cabem três colunas: o parágrafo sai do cartaz. */}
        <Parallax speed={0.06} className="hidden sm:block">
          <p className="text-bone max-w-[21ch] text-[0.82rem] leading-snug">
            Uma noite na {event.venue.name}, onde as luzes apagam cedo e
            ninguém sai como entrou. Venha fantasiado. Não venha sozinho.
          </p>
        </Parallax>

        <Parallax speed={-0.12} className="relative z-0">
          <PosterSubject src={event.hero.src || undefined} />
        </Parallax>

        <Parallax speed={0.06} className="justify-self-end">
          <div className="w-24 sm:w-36">
            <Countdown target={event.startsAt} />
          </div>
        </Parallax>
      </div>

      {/* ---- base ---- */}
      <footer className="relative z-30">
        <div className="mb-2 flex items-end justify-between">
          <Barcode code="016.102.026" />
          <p className="font-drip text-bone text-3xl leading-none sm:text-4xl">
            Boo
          </p>
        </div>

        <h2 className="text-pumpkin">
          <PosterWord>Ween</PosterWord>
        </h2>
      </footer>

      {/* faixa correndo, rente à borda de baixo */}
      <Marquee
        items={[
          event.dateLabel,
          event.venue.name,
          event.timeLabel,
          "fantasia obrigatória",
        ]}
        className="bg-pumpkin text-ink font-heading absolute inset-x-0 bottom-0 z-30 py-1 text-[0.6rem] font-bold tracking-[0.25em] uppercase"
      />
    </section>
  );
}
