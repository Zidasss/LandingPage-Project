import { InfoCard } from "@/components/InfoCard";
import { Reveal } from "@/components/Reveal";
import { event, fullAddress, priceLabel } from "@/config/event";

export function InfoSection() {
  return (
    <section id="info" className="text-ink relative z-40 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        {/*
          O lema, no vermelho vazio.

          Fica aqui, e não dentro da abertura, por um motivo prático: lá ele
          caía em cima do cartaz que ainda está derretendo, e os dois textos se
          embolavam num borrão ilegível. Este é o trecho em que a luz já tomou a
          tela e não há mais nada nela — o único lugar da página onde a frase
          tem o espaço que ela pede.
        */}
        <Reveal className="mb-24 sm:mb-32">
          <p className="font-drip text-ink mx-auto max-w-3xl text-center text-[9vw] leading-[1.05] lowercase sm:text-[4.4vw]">
            seja quem você quiser
            <span className="lema-remate mt-2 block">menos você</span>
          </p>
        </Reveal>

        <Reveal>
          <p className="font-heading text-ink/70 text-[0.62rem] font-bold tracking-[0.3em] uppercase">
            você atravessou a porta
          </p>
          <h2 className="font-drip text-ink mt-3 text-4xl uppercase sm:text-6xl">
            Anota aí
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal delay={0}>
            <InfoCard
              label="Quando"
              highlight={`${event.dateLabel}, ${event.timeLabel}`}
            >
              <p>
                {event.weekdayLabel}, portões a partir das {event.timeLabel}.
                Fantasia é o traje da casa.
              </p>
            </InfoCard>
          </Reveal>

          <Reveal delay={90}>
            <InfoCard
              label="Onde"
              highlight={event.venue.name}
              footer={
                <a
                  href={event.venue.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-heading text-ink hover:text-bone inline-flex items-center gap-2 border-b border-current pb-0.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors"
                >
                  abrir no mapa ↗
                </a>
              }
            >
              <p>{fullAddress}</p>
            </InfoCard>
          </Reveal>

          <Reveal delay={180}>
            <InfoCard label="Quanto" highlight={`${priceLabel} por pessoa`}>
              <p>
                Pagamento via PIX pelo próprio site. Sua vaga só é garantida
                depois da confirmação — são {event.ticket.capacity} lugares.
              </p>
            </InfoCard>
          </Reveal>
        </div>
      </div>

      <style>{`
        /*
          "menos você" é o soco da frase, então escorre um pouco mais que o
          resto: maior, e pingando um tico além. A fonte já é escorrida — o que
          se acrescenta aqui é só a diferença entre as duas metades, que é o que
          faz a segunda soar como remate e não como continuação.
        */
        .lema-remate {
          font-size: 1.25em;
          transform: translateY(-0.06em);
        }
      `}</style>
    </section>
  );
}
