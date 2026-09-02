import { Reveal } from "@/components/Reveal";
import { event, priceLabel } from "@/config/event";

/**
 * O cardápio: o que está incluso no ingresso.
 *
 * Ganha seção própria, e não uma linha dentro do preço, porque é a resposta
 * para "o que eu levo por esse valor" — a pergunta que decide a compra. Numa
 * lista de seis grupos, enfiada num cartão, ela viraria letra miúda.
 *
 * O desenho é de lista de bar: título curto, itens embaixo, sem caixa nem
 * ícone. O que organiza é o espaço e a régua, do mesmo jeito que o resto do
 * site — o valor aqui está na informação, e enfeitar a informação a esconde.
 */
export function MenuSection() {
  return (
    <section
      id="cardapio"
      className="text-ink relative z-40 px-6 pb-24 sm:pb-36"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-heading text-ink/60 text-[0.62rem] font-bold tracking-[0.3em] uppercase">
            tudo incluso nos {priceLabel}
          </p>
          <h2 className="font-drip text-ink mt-3 text-5xl uppercase sm:text-7xl">
            O que rola
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-14 gap-y-12 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {event.cardapio.map((grupo, i) => (
            <Reveal key={grupo.titulo} delay={i * 70}>
              <div className="border-ink/35 flex h-full flex-col border-t pt-5">
                <h3 className="font-display text-ink text-2xl leading-none sm:text-3xl">
                  {grupo.titulo}
                </h3>

                {/*
                  Os itens são uma lista de verdade, e não parágrafos: quem usa
                  leitor de tela ouve "lista de dois itens" antes de ouvi-los, e
                  é essa contagem que faz um cardápio ser lido como cardápio.

                  O marcador some porque a régua acima e o espaço já separam os
                  grupos — bolinha aqui só acrescentaria sujeira.
                */}
                <ul className="text-ink/85 mt-4 flex list-none flex-col gap-1.5 text-[0.95rem] leading-relaxed">
                  {grupo.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                {/*
                  O grupo sem nome definido diz isso na cara, em vez de fingir
                  que está pronto. Quem lê entende que falta acertar, e não que
                  o site esqueceu de escrever.
                */}
                {"aDefinir" in grupo && grupo.aDefinir ? (
                  <p className="font-heading text-ink/55 mt-auto pt-4 text-[0.55rem] font-bold tracking-[0.28em] uppercase">
                    ▶ segredo até a porta
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
