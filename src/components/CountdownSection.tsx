"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { BatSwarm } from "@/components/BatSwarm";
import { Countdown } from "@/components/Countdown";
import { event } from "@/config/event";

/**
 * A contagem regressiva, na cena do morcego.
 *
 * A arte entra ancorada no topo: a cara do bicho e o céu vermelho são o que
 * precisa aparecer sempre, e são eles que o corte pelas laterais preserva. O
 * corpo preto ocupa o resto da tela — é ali, dentro dele, que os números ficam.
 *
 * A arte aparece junto com a chegada do bando, e não antes: se ela já estivesse
 * na tela, os morcegos voando seriam enfeite passando na frente de um fundo.
 *
 * O fundo começa vermelho, e não preto, por um motivo prático: os morcegos são
 * silhuetas pretas, e sobre preto eles simplesmente não existiam. O vermelho
 * ainda emenda com a seção anterior, então a cena começa como continuação dela
 * e só depois o bicho toma conta.
 */
export function CountdownSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        node.dataset.revelada = "1";
        observador.disconnect();
      },
      { threshold: 0.35 },
    );
    observador.observe(node);
    return () => observador.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="contagem"
      /*
        Mais alta que a tela de propósito: a arte é ancorada no topo, e numa
        tela baixa a cara do morcego cai no meio, bem onde o texto fica. Com
        folga extra, o corpo preto sempre sobra embaixo da cara — e é lá que os
        números moram.
      */
      className="cena-morcego bg-blood relative z-40 flex min-h-[118svh] flex-col items-center justify-end overflow-hidden px-6 pb-[12svh]"
    >
      <Image
        src={event.bats.scene}
        alt="Morcego gigante recortado contra um céu vermelho"
        fill
        sizes="100vw"
        className="arte object-cover object-top"
        priority={false}
      />

      <BatSwarm />

      <div className="relative z-10 w-full max-w-md text-center">
        <p className="chapeu font-heading text-ink/70 text-[0.62rem] font-bold tracking-[0.35em] uppercase transition-colors delay-700 duration-700">
          falta pouco
        </p>
        <h2 className="titulo font-drip text-ink mt-3 text-4xl uppercase transition-colors delay-700 duration-700 sm:text-5xl">
          A espera
        </h2>
        <div className="mt-8">
          <Countdown target={event.startsAt} />
        </div>
      </div>

      <style>{`
        /* Enquanto o fundo é vermelho o texto é preto; quando a arte chega e o
           corpo do morcego toma a tela, ele vira claro. */
        .cena-morcego[data-revelada] .titulo { color: var(--color-blood); }
        .cena-morcego[data-revelada] .chapeu { color: color-mix(in srgb, var(--color-bone) 70%, transparent); }

        /* O relógio segue o mesmo caminho: preto sobre o vermelho, claro
           depois que o corpo preto do morcego chega. */
        .cena-morcego .relogio { --tinta: var(--color-ink); }
        .cena-morcego[data-revelada] .relogio { --tinta: var(--color-bone); }
        /* A espera de 700ms casa com a entrada da arte: o texto só clareia
           quando o corpo preto do morcego já está atrás dele. Trocando junto
           com o disparo, ele ficava claro sobre o vermelho e sumia. */
        .cena-morcego .relogio dd,
        .cena-morcego .relogio dt { color: var(--tinta); transition: color 700ms ease 700ms; }
        .cena-morcego .relogio dt { opacity: 0.6; }
        .cena-morcego .relogio > div { border-color: color-mix(in srgb, var(--tinta) 25%, transparent); transition: border-color 700ms ease 700ms; }

        .cena-morcego .arte {
          opacity: 0;
          transform: scale(1.06);
          transition:
            opacity 900ms ease-out 620ms,
            transform 1400ms cubic-bezier(0.3, 0, 0.2, 1) 620ms;
        }
        .cena-morcego[data-revelada] .arte {
          opacity: 1;
          transform: scale(1);
        }

        @media (prefers-reduced-motion: reduce) {
          .cena-morcego .arte {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
