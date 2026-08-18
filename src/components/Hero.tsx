import { Countdown } from "@/components/Countdown";
import { Barcode } from "@/components/Barcode";
import { Marquee } from "@/components/Marquee";
import { Parallax } from "@/components/Parallax";
import { PosterSubject } from "@/components/PosterSubject";
import { event } from "@/config/event";

/**
 * Hero em formato de cartaz: o nome quebrado em duas palavras gigantes,
 * o personagem entre elas e os textos de apoio nas laterais.
 * A leitura é a de um pôster impresso — por isso quase nada se move sozinho.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-between overflow-hidden py-5">
      {/* ---- topo ---- */}
      <header className="relative z-30 px-5">
        <h1 className="poster-type text-bone pt-[3vw] text-center text-[21vw] sm:text-[15vw]">
          <span className="sr-only">{event.name}</span>
          <span aria-hidden>Volvo</span>
        </h1>
        <div className="font-heading text-bone mt-2 flex items-baseline justify-between text-[3vw] font-bold tracking-tight uppercase sm:text-[1.35vw]">
          <span>Halloween</span>
          <span>{event.edition}</span>
        </div>
      </header>

      {/* ---- miolo ---- */}
      <div className="relative flex flex-1 items-center px-5 py-4">
        {/* eco vazado do nome, bem ao fundo, correndo mais devagar */}
        <Parallax
          speed={0.3}
          className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none"
        >
          <p className="poster-type outline-type text-center text-[13vw] opacity-20">
            {event.dateLabel}
          </p>
        </Parallax>

        {/* personagem, correndo mais rápido que a página */}
        <Parallax
          speed={-0.14}
          className="absolute inset-x-0 top-1/2 z-0 flex -translate-y-1/2 justify-center"
        >
          <PosterSubject src={event.hero.src || undefined} />
        </Parallax>

        {/* colunas de apoio */}
        <div className="relative z-20 grid w-full grid-cols-2 items-start gap-4">
          <Parallax speed={0.07}>
            <p className="text-bone max-w-[24ch] text-[0.72rem] leading-snug sm:text-sm">
              Uma noite na {event.venue.name}, onde as luzes apagam cedo e
              ninguém sai como entrou. Venha fantasiado. Não venha sozinho.
            </p>
          </Parallax>

          <Parallax speed={0.07} className="justify-self-end">
            <div className="w-32 sm:w-44">
              <p className="font-heading text-bone mb-2 text-[0.6rem] font-bold tracking-[0.3em] uppercase">
                Falta
              </p>
              <Countdown target={event.startsAt} />
            </div>
          </Parallax>
        </div>
      </div>

      {/* ---- base ---- */}
      <footer className="relative z-30">
        <div className="flex items-end justify-between px-5 pb-3">
          <Barcode code="016.102.026" />
          <p className="font-script text-pumpkin text-5xl leading-none sm:text-6xl">
            Boo
          </p>
        </div>

        <Marquee
          items={[
            event.dateLabel,
            event.venue.name,
            event.timeLabel,
            "fantasia obrigatória",
          ]}
          className="bg-pumpkin text-ink font-heading py-1.5 text-[0.7rem] font-bold tracking-[0.25em] uppercase"
        />

        {/* pb compensa a tinta do Anton, que desenha fora da caixa da linha */}
        <h2 className="poster-type text-pumpkin mt-1 pb-[4.5vw] text-center text-[21vw] sm:text-[15vw]">
          Ween
        </h2>
      </footer>
    </section>
  );
}
