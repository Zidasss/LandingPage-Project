import { InfoCard } from "@/components/InfoCard";
import { Reveal } from "@/components/Reveal";
import { event, fullAddress, priceLabel } from "@/config/event";

export function InfoSection() {
  return (
    <section id="info" className="text-ink relative z-40 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-heading text-ink/70 text-[0.62rem] font-bold tracking-[0.3em] uppercase">
            você atravessou a porta
          </p>
          <h2 className="font-drip text-ink mt-3 text-4xl uppercase sm:text-6xl">
            Anota aí
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                depois da confirmação — vagas limitadas.
              </p>
            </InfoCard>
          </Reveal>

          {/*
            O que está incluso ganha cartão próprio, e não uma linha dentro do
            preço: é o que responde "o que eu levo por esse valor", e essa é a
            pergunta que decide a compra. Enfiada no meio do parágrafo do PIX,
            a informação viraria letra miúda.
          */}
          <Reveal delay={270}>
            <InfoCard label="Incluso" highlight="Comida e bebida à vontade">
              <p>
                Tudo dentro do valor do ingresso. Não precisa levar nada nem
                pagar mais nada na hora.
              </p>
            </InfoCard>
          </Reveal>
        </div>
      </div>

    </section>
  );
}
