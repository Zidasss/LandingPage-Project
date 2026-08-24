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
        A arte é dimensionada pela ALTURA da tela (svh), não por `cover` sobre a
        seção. Assim o morcego tem sempre o mesmo tamanho em relação à tela e a
        cara cai sempre na mesma faixa — em retrato ou paisagem, celular ou
        monitor. Antes, com `cover`, o recorte mudava a cada proporção e a cara
        ora batia bem em cima dos números. O relógio fica ancorado num ponto fixo
        em svh, no corpo escuro do bicho, logo abaixo dos olhos: como o corpo já é
        preto e se funde com o fundo, ele assenta ali em qualquer tela.

        O fundo começa VERMELHO, não preto: os morcegos do bando são silhuetas
        pretas e, sobre preto, sumiam — a animação parecia não existir. Sobre o
        vermelho eles aparecem, e o vermelho ainda emenda com a seção anterior. O
        preto entra por cima na revelação (a camada `.fundo`), junto com a arte,
        e é aí que a cena vira escura.
      */
      className="cena-morcego bg-blood relative z-40 min-h-svh overflow-hidden"
    >
      {/* o bando, no fundo de tudo: voa sobre o vermelho (onde as silhuetas
          pretas aparecem) e o preto o cobre conforme ele converge e some */}
      <BatSwarm />

      {/* o preto que toma a cena na revelação, cobrindo o vermelho do bando */}
      <div aria-hidden className="fundo bg-ink absolute inset-0" />

      {/*
        O teto em vw evita que, num celular estreito, a largura da arte (que sai
        da altura) passe da tela e corte as pontas das asas.
      */}
      <div
        className="absolute left-1/2 top-0 aspect-[4/5] -translate-x-1/2"
        style={{ height: "min(66svh, 116vw)" }}
      >
        <Image
          src={event.bats.scene}
          alt="Morcego gigante recortado contra um céu vermelho"
          fill
          sizes="(min-width: 640px) 66vh, 116vw"
          quality={95}
          className="arte object-cover object-top"
          priority={false}
        />
      </div>

      {/* o relógio, ancorado no corpo escuro, sempre abaixo da cara */}
      <div className="absolute inset-x-0 top-[47svh] z-10 px-6 text-center">
        <p className="chapeu font-heading text-bone/70 text-[0.62rem] font-bold tracking-[0.35em] uppercase">
          falta pouco
        </p>
        <h2 className="titulo font-drip text-blood mt-3 text-4xl uppercase sm:text-5xl">
          A espera
        </h2>
        <div className="mt-7">
          <Countdown target={event.startsAt} />
        </div>
      </div>

      <style>{`
        /* Relógio claro sobre o corpo escuro. */
        .cena-morcego .relogio dd,
        .cena-morcego .relogio dt { color: var(--color-bone); }
        .cena-morcego .relogio dt { opacity: 0.6; }
        .cena-morcego .relogio > div { border-color: color-mix(in srgb, var(--color-bone) 22%, transparent); }

        /* O preto entra depois do bando começar: o vermelho segura enquanto os
           morcegos cruzam a tela (visíveis), e escurece conforme eles convergem
           e somem na cara do bicho. */
        .cena-morcego .fundo {
          opacity: 0;
          transition: opacity 1100ms ease 350ms;
        }
        .cena-morcego[data-revelada] .fundo { opacity: 1; }

        .cena-morcego .arte {
          opacity: 0;
          transform: scale(1.06);
          /* As laterais da arte se dissolvem no preto atrás dela: sem isso o céu
             vermelho terminava numa borda reta contra o preto dos lados, e as
             pontas das asas paravam no ar. Com a máscara, a asa some no preto — o
             bicho encosta nos lados sem costura. */
          -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%);
          transition:
            opacity 900ms ease-out 200ms,
            transform 1400ms cubic-bezier(0.3, 0, 0.2, 1) 200ms;
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
          /* Sem bando (ele fica escondido), a cena já nasce escura. */
          .cena-morcego .fundo { opacity: 1; transition: none; }
        }
      `}</style>
    </section>
  );
}
