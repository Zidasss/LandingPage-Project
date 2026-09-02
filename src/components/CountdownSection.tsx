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
      /*
        A cena ocupa a tela inteira, e a arte ocupa a cena.

        Antes a arte parava em 66svh e a contagem em 47svh, então o terço de
        baixo era preto morto: rolava-se quase uma tela de nada entre o morcego
        e o ingresso. Encolher a seção resolveria o vazio e criaria outro
        problema — sem uma tela só para ela, a cena nunca fica sozinha e o
        ingresso já aparece por baixo enquanto o morcego ainda está entrando.

        Então a seção continua com a tela inteira e o que cresce é o conteúdo.
      */
      className="cena-morcego bg-blood relative z-40 min-h-svh overflow-hidden"
      style={{ "--arte-h": "min(78svh, 130vw)" } as React.CSSProperties}
    >
      {/* o bando, no fundo de tudo: voa sobre o vermelho (onde as silhuetas
          pretas aparecem) e o preto o cobre conforme ele converge e some */}
      <BatSwarm />

      {/*
        A cena do bicho, num elemento só: o preto que toma a tela, a faixa que
        continua a arte até as bordas, e a própria arte.

        Estarem juntos importa. Antes o preto era uma camada à parte e chegava
        antes da arte — dava para ver o escuro entrar sozinho, e a moldura
        retangular da arte aparecia como bloco. Numa peça só, tudo surge no mesmo
        gesto: o vermelho do bando escurece e o morcego já está ali.

        A faixa existe porque a arte tem uma tira de céu vermelho no topo que
        atravessa toda a largura dela (até ~4% da altura) e vira preto abaixo,
        onde a asa começa. Como a arte é mais estreita que a tela, essa tira
        terminava seca na borda do retângulo — era o "bloco preto na lateral". A
        faixa repete esse mesmo corte até as pontas da tela: o céu continua e a
        asa entra no preto, sem borda.
      */}
      <div className="arte-cena absolute inset-0">
        <div aria-hidden className="bg-ink absolute inset-0" />

        <div
          aria-hidden
          className="absolute inset-x-0 top-0"
          style={{
            height: "var(--arte-h)",
            background:
              "linear-gradient(to bottom, var(--color-blood) 0 3.8%, var(--color-ink) 4.2%, var(--color-ink) 100%)",
          }}
        />

        {/*
          O teto em vw evita que, num celular estreito, a largura da arte (que
          sai da altura) passe da tela e corte as pontas das asas.
        */}
        <div
          className="relative mx-auto aspect-[4/5]"
          style={{ height: "var(--arte-h)" }}
        >
          <Image
            src={event.bats.scene}
            alt="Morcego gigante recortado contra um céu vermelho"
            fill
            sizes="(min-width: 640px) 66vh, 116vw"
            quality={95}
            className="object-cover object-top"
            priority={false}
          />
        </div>
      </div>

      {/* o relógio, ancorado no corpo escuro, sempre abaixo da cara */}
      <div className="absolute inset-x-0 top-[55svh] z-10 px-6 text-center">
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

        /* A cena inteira — preto, faixa e morcego — entra como uma peça só,
           enquanto o bando converge. O vermelho segura até aqui, para os
           morcegos (silhuetas pretas) aparecerem; então tudo escurece de uma vez
           e o bicho já está no lugar deles. */
        .cena-morcego .arte-cena {
          opacity: 0;
          transform: scale(1.06);
          transform-origin: 50% 0;
          transition:
            opacity 1000ms ease-out 420ms,
            transform 1400ms cubic-bezier(0.3, 0, 0.2, 1) 420ms;
        }
        .cena-morcego[data-revelada] .arte-cena {
          opacity: 1;
          transform: scale(1);
        }

        @media (prefers-reduced-motion: reduce) {
          /* Sem bando (ele fica escondido), a cena já nasce pronta. */
          .cena-morcego .arte-cena {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
