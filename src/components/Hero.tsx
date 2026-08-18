import Image from "next/image";
import { Parallax } from "@/components/Parallax";
import { PosterWord } from "@/components/PosterWord";
import { brl } from "@/lib/format";
import { event } from "@/config/event";

/**
 * Hero em formato de cartaz: a foto ocupa a tela inteira, o nome vem por cima
 * dela em vermelho, e a chamada de pagamento fecha embaixo.
 *
 * A foto é de estúdio, com fundo cinza claro. As camadas escuras por cima
 * puxam esse cinza para o clima noturno do cartaz e garantem contraste para
 * o texto branco, que de outro modo sumiria no lençol.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-between overflow-hidden px-5 py-6">
      {/* foto, correndo mais devagar que a página */}
      <Parallax speed={0.18} className="absolute inset-0 -z-20">
        <Image
          src={event.hero.src}
          alt="Fantasma de lençol com óculos escuros redondos"
          fill
          priority
          sizes="100vw"
          /*
            A foto é retrato (1080x1350) e a tela do desktop é deitada: o corte
            por altura joga o fantasma para fora. 22% sobe o enquadramento até
            a cabeça ficar no terço central em qualquer proporção de tela.
          */
          className="scale-110 object-cover object-[center_22%]"
        />
      </Parallax>

      {/* escurecimento: puxa o cinza de estúdio para a noite */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,8,6,.72) 0%, rgba(10,8,6,.34) 32%, rgba(10,8,6,.5) 62%, rgba(10,8,6,.94) 100%)",
        }}
      />

      {/* ---- topo: endereço e nome, como no cartaz ---- */}
      <div className="relative z-10">
        <p className="font-heading text-bone text-center text-xs font-bold tracking-[0.12em] uppercase sm:text-sm">
          {event.site}
        </p>
        <Parallax speed={-0.05} className="mt-3">
          <h1 className="text-blood">
            <span className="sr-only">{event.name}</span>
            <PosterWord>{event.name}</PosterWord>
          </h1>
        </Parallax>
      </div>

      {/* ---- chamada ---- */}
      <div className="relative z-10 text-center">
        <p className="font-heading text-bone text-2xl font-bold tracking-tight uppercase sm:text-4xl">
          Confirme sua presença
        </p>
        <p className="font-heading text-bone/90 mt-1 text-[0.7rem] font-semibold tracking-[0.08em] uppercase sm:text-base">
          Festa de Halloween — {event.dateLabel}
        </p>
        <a
          href="#ingresso"
          className="font-heading text-bone hover:text-blood mt-4 inline-block text-lg font-bold tracking-tight uppercase transition-colors sm:text-2xl"
        >
          {brl(event.ticket.price)} | Pagar e confirmar &rarr;
        </a>
      </div>
    </section>
  );
}
