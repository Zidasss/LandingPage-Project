import { InfoCard } from "@/components/InfoCard";
import { Reveal } from "@/components/Reveal";
import { event, priceLabel } from "@/config/event";

export function InfoSection() {
  return (
    <section id="info" className="text-ink relative z-40 px-6 py-24 sm:py-36">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-heading text-ink/70 text-[0.62rem] font-bold tracking-[0.3em] uppercase">
            você atravessou a porta
          </p>
          <h2 className="font-drip text-ink mt-3 text-5xl uppercase sm:text-7xl">
            Anota aí
          </h2>
        </Reveal>

        {/*
          Três colunas no computador, e não duas.

          Com duas, "Quando" e "Onde" formavam uma linha e "Quanto" ficava
          sozinho na esquerda com metade da tela vazia ao lado — um buraco no
          meio da seção, logo antes do bloco largo do "Incluso". Em três, os
          três dados da festa viram uma faixa só, alinhada pelo topo, e o
          "Incluso" ocupa a linha inteira embaixo, como um rodapé de cardápio.

          Entre 640 e 1024 a grade volta a duas colunas, mas aí o "Quanto"
          atravessa as duas: é o mesmo buraco de antes, resolvido pela largura
          em vez do vazio.
        */}
        <div className="mt-16 grid gap-x-10 gap-y-14 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14">
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
              {/*
                Endereço em linhas, e não num parágrafo corrido: em parágrafo a
                medida quebrava o CEP no meio ("81290-" numa linha, "000" na
                outra). Endereço se escreve em linhas mesmo — assim ele nunca
                parte no lugar errado, seja qual for a largura.
              */}
              <p className="not-italic">
                {event.venue.street}
                <br />
                {event.venue.district}
                <br />
                {event.venue.city}/{event.venue.state} · {event.venue.zip}
              </p>
            </InfoCard>
          </Reveal>

          <Reveal delay={180} className="sm:col-span-2 lg:col-span-1">
            {/*
              O destaque é só o número. "por pessoa" desceu para o corpo porque,
              numa coluna de três, a frase inteira quebrava em duas linhas e o
              cartão do preço ficava mais alto que os dois vizinhos — a faixa
              perdia o alinhamento justamente no dado que mais importa.
            */}
            <InfoCard label="Quanto" highlight={priceLabel}>
              <p>
                Por pessoa, no PIX pelo próprio site. Sua vaga só é garantida
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
          {/*
            O que está incluso ocupa a linha inteira, e não meia coluna como os
            outros: são seis grupos, e espremidos num cartão comum eles voltam a
            ser a letra miúda que a lista veio justamente evitar. Uma seção
            separada seria demais para seis linhas curtas — largura basta.
          */}
          <Reveal delay={270} className="sm:col-span-2 lg:col-span-3">
            <InfoCard
              label="Incluso"
              highlight="Comida e bebida à vontade"
              /*
                O cardápio vai no rodapé do cartão, e não no corpo, por um
                motivo de medida: o corpo é limitado a 34 caracteres de largura,
                que é o certo para texto corrido e o errado para uma grade de
                três colunas — espremida ali, cada item quebrava em cinco linhas
                de duas palavras.

                Já foram os dois lado a lado, quando o texto tinha quatro
                linhas: empilhados, sobravam dois terços de linha vazios à
                direita dele. Com uma frase só o problema deixou de existir —
                ela lê como legenda do destaque, e a lista fica com a largura
                inteira de novo.
              */
              footer={
                <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {event.cardapio.map((grupo) => (
                    <div key={grupo.titulo}>
                      <dt className="font-heading text-ink text-[0.6rem] font-bold tracking-[0.28em] uppercase">
                        {grupo.titulo}
                        {"aDefinir" in grupo && grupo.aDefinir ? (
                          <span className="text-ink/50"> · segredo</span>
                        ) : null}
                      </dt>
                      <dd className="text-ink/75 mt-1.5 text-[0.9rem] leading-relaxed">
                        {grupo.itens.join(" · ")}
                      </dd>
                    </div>
                  ))}
                </dl>
              }
            >
              <p>Tudo dentro do valor do ingresso.</p>
            </InfoCard>
          </Reveal>
        </div>
      </div>

    </section>
  );
}
