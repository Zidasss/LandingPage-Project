"use client";

import { useEffect, useRef } from "react";
import { event } from "@/config/event";

/**
 * A casa pegando fogo — a última cena da página.
 *
 * Vem depois do ingresso de propósito: quem chega aqui já passou pelo
 * formulário, então a cena não disputa a atenção com a compra. E dá um fim à
 * página, que antes simplesmente acabava. A abertura começa com uma porta
 * fechada; isto fecha o arco com a casa em chamas.
 *
 * ## Por que não são duas fotos trocando de lugar
 *
 * A primeira versão empilhava as duas artes inteiras — a casa limpa embaixo, a
 * casa em chamas por cima — e revelava a de cima de baixo para cima. Dava para
 * ver a troca: as duas foram geradas separadas e cada traço saiu diferente, de
 * modo que a frente da máscara arrastava um fantasma de linhas pela tela.
 *
 * Agora a casa **nunca muda**. O que existe por cima dela é só o fogo,
 * recortado da arte em chamas pelo calor de cada pixel (`casa-chamas.webp`) e
 * guardado com o resto transparente. A casa que se vê é sempre a `casa.png`,
 * que é a de traço melhor. E, como o fogo virou uma camada própria, ele pode
 * fazer o que uma imagem não faz: tremer, respirar, acender a madeira em volta
 * e soltar fagulha.
 *
 * ## As camadas, de baixo para cima
 *
 * 1. **base** — a casa limpa, achatada sobre o vermelho do site.
 * 2. **brilho** — as mesmas chamas, borradas e somadas à luz (`plus-lighter`).
 *    É o que devolve o clarão na madeira que a arte em chamas tinha e o recorte
 *    sozinho perdia. O borrão é fixo: quem pulsa é a opacidade, que é de graça.
 * 3. **chamas** — o recorte, revelado de baixo para cima pela rolagem e tremendo
 *    sozinho em dois compassos que não fecham entre si, para o fogo nunca
 *    repetir o mesmo desenho.
 * 4. **fagulhas** — pontos que sobem e apagam, só depois que o fogo pegou.
 */

/** Altura da frente borrada do fogo, em porcentagem da altura da arte. */
const SUAVE = 22;
/**
 * Em quantos degraus a subida acontece.
 *
 * Mexer na máscara obriga o navegador a repintar a camada — é o mesmo custo do
 * borrão da abóbora na abertura, e pela mesma razão anda em degraus em vez de a
 * cada quadro. Quarenta é fino demais para o olho pegar o degrau, ainda mais
 * numa forma irregular e borrada como fogo.
 */
const DEGRAUS = 40;

/**
 * As fagulhas. Posições fixas, e não sorteadas: sorteio no render faria
 * servidor e navegador desenharem coisas diferentes, e a hidratação acusaria.
 *
 * Ficam na faixa da casa (o miolo da arte), e cada uma sobe no seu tempo — é o
 * descompasso que faz parecer brasa subindo, e não chuva ao contrário.
 */
const FAGULHAS = [
  { x: 34, atraso: 0, dur: 5.2, desvio: -3, tam: 3 },
  { x: 41, atraso: 1.7, dur: 6.4, desvio: 4, tam: 2 },
  { x: 46, atraso: 3.1, dur: 5.8, desvio: -5, tam: 4 },
  { x: 52, atraso: 0.8, dur: 7.1, desvio: 3, tam: 2 },
  { x: 55, atraso: 4.3, dur: 5.5, desvio: -2, tam: 3 },
  { x: 59, atraso: 2.2, dur: 6.8, desvio: 5, tam: 2 },
  { x: 63, atraso: 5.6, dur: 6.1, desvio: -4, tam: 3 },
  { x: 48, atraso: 6.4, dur: 7.6, desvio: 2, tam: 2 },
  { x: 38, atraso: 3.9, dur: 6.9, desvio: 6, tam: 2 },
  { x: 67, atraso: 1.2, dur: 5.9, desvio: -3, tam: 3 },
] as const;

/** Prende um número entre 0 e 1. */
function entre0e1(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function FireSection() {
  const secao = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alvo = secao.current;
    const cena = palco.current;
    if (!alvo || !cena) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cena.style.setProperty("--corte", `${-SUAVE}%`);
      cena.dataset.pegou = "1";
      return;
    }

    let frame = 0;
    let ultimo = -1;
    /*
      O laço só roda com a cena por perto. Sem isto ele acompanharia a rolagem
      da página inteira para calcular um fogo que ninguém está vendo — e a
      página tem quase sete mil pixels de altura acima desta seção.
    */
    let perto = false;

    const desenhar = () => {
      frame = 0;
      const caixa = alvo.getBoundingClientRect();

      /*
        O fogo anda enquanto a cena está presa no topo, e não enquanto ela entra
        pela borda de baixo.

        A primeira versão media a entrada da seção na tela, e com isso a casa já
        chegava em brasa: como a seção tinha uma tela de altura e é a última da
        página, quando ela terminava de entrar não sobrava rolagem nenhuma. Agora
        a seção é mais alta que a tela e o palco gruda: o percurso é o que sobra
        de seção depois da tela, e é ele que o dedo percorre com a cena parada.
      */
      const curso = caixa.height - window.innerHeight;
      const passo = Math.round(
        entre0e1(curso > 0 ? -caixa.top / curso : 1) * DEGRAUS,
      );
      if (passo === ultimo) return;
      ultimo = passo;

      const f = passo / DEGRAUS;
      cena.style.setProperty(
        "--corte",
        `${(100 + SUAVE - f * (100 + SUAVE * 2)).toFixed(2)}%`,
      );
      // O brilho entra junto com o fogo, e não antes: clarão sem chama é vulto.
      cena.style.setProperty("--acesa", f.toFixed(3));
      // As fagulhas só existem depois que a casa já está pegando de verdade.
      if (f > 0.45) cena.dataset.pegou = "1";
      else delete cena.dataset.pegou;
    };

    const aoRolar = () => {
      if (perto && !frame) frame = requestAnimationFrame(desenhar);
    };

    const vigia = new IntersectionObserver(
      ([e]) => {
        perto = e.isIntersecting;
        if (perto) aoRolar();
      },
      { rootMargin: "50% 0px" },
    );
    vigia.observe(alvo);

    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar, { passive: true });
    return () => {
      vigia.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  return (
    <section
      ref={secao}
      id="ate-la"
      aria-labelledby="ate-la-titulo"
      className="cena-fogo bg-blood relative z-40 h-[190svh]"
    >
      <div
        ref={palco}
        className="palco-fogo sticky top-0 h-svh overflow-hidden"
      >
        {/*
          A arte aparece inteira, na proporção em que foi desenhada, e quem
          preenche a tela é o vermelho da seção — que é o mesmo vermelho do
          fundo dela, então não há onde ver a emenda.

          Já foi cortada para cobrir a tela, e ficou pior: a casa vinha na cara
          de quem olha e o traço, ampliado, perdia o fio. O desenho tem um
          enquadramento — árvores nas beiradas, casa ao centro, céu em cima — e
          cortar isso é jogar fora a composição.

          As laterais se dissolvem no vermelho (veja `.arte-casa` no estilo):
          sem isso as árvores das pontas terminavam numa borda reta no meio da
          tela, que é justamente o que denuncia "tem uma imagem colada aqui".
        */}
        {/*
          `<img>` cru, e não `next/image`: os arquivos já são `.webp` no
          tamanho certo, e passá-los pelo otimizador só os reencodaria de
          `.webp` para `.webp` sem ganho — a conta de bytes está no comentário
          do topo do arquivo.
        */}
        {/* eslint-disable @next/next/no-img-element */}
        <div
          className="arte-casa absolute bottom-0 left-1/2 -translate-x-1/2"
          style={
            {
              "--arte-h": "min(94svh, 152vw)",
              height: "var(--arte-h)",
              // a proporção do desenho, 4:5 — a largura sai da altura
              width: "calc(var(--arte-h) * 0.8)",
            } as React.CSSProperties
          }
        >
          {/*
            A caixa tem exatamente a largura do desenho — altura mandada, largura
            saindo da proporção dele. Ela precisa ser justa porque é nela que a
            máscara das laterais se apoia: numa caixa do tamanho da tela, o
            esmaecido cairia na borda da tela e as árvores continuariam
            terminando em linha reta no meio do vermelho.
          */}
          <img
            src="/casa.webp"
            alt="Casarão mal-assombrado entre árvores secas"
            width={1080}
            height={1350}
            loading="lazy"
            decoding="async"
            className="block h-full w-full"
          />

          {/*
            O clarão do fogo na madeira. A imagem já vem borrada e pequena
            (320px, 11KB): borrão é justamente o que não precisa de resolução, e
            assado no arquivo ele sai de graça — em CSS, `filter: blur()` sobre
            uma camada do tamanho da arte é das coisas mais caras que existem
            para o navegador desenhar.
          */}
          <div aria-hidden className="brilho-fogo absolute inset-0">
            <img
              src="/casa-brilho.webp"
              alt=""
              width={320}
              height={400}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full"
            />
          </div>

          {/* as chamas em si */}
          <div aria-hidden className="chamas absolute inset-0">
            <img
              src="/casa-chamas.webp"
              alt=""
              width={1080}
              height={1350}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
        {/* eslint-enable @next/next/no-img-element */}

        {/* as fagulhas que sobem da casa */}
        <div
          aria-hidden
          className="fagulhas pointer-events-none absolute inset-0"
        >
          {FAGULHAS.map((g, i) => (
            <span
              key={i}
              style={
                {
                  left: `${g.x}%`,
                  width: `${g.tam}px`,
                  height: `${g.tam}px`,
                  animationDelay: `${g.atraso}s`,
                  animationDuration: `${g.dur}s`,
                  "--desvio": `${g.desvio}vw`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/*
          A emenda com a seção do ingresso, que é preta.

          Sem ela o preto virava vermelho numa linha reta atravessando a tela —
          e a linha aparecia justamente no meio da rolagem, onde o olho está.
          A faixa faz o preto virar fumaça e a fumaça virar céu.
        */}
        <div
          aria-hidden
          className="emenda-fogo pointer-events-none absolute inset-x-0 top-0"
        />

        <div className="relative z-10 px-6 pt-[6svh] text-center">
          <p className="font-heading text-bone/60 text-[0.62rem] font-bold tracking-[0.35em] uppercase">
            é isso
          </p>
          <h2
            id="ate-la-titulo"
            className="font-drip text-bone mt-3 text-5xl uppercase sm:text-7xl"
          >
            Até lá
          </h2>
          <p className="font-heading text-bone/85 mt-5 text-[0.68rem] font-bold tracking-[0.26em] uppercase sm:text-xs">
            {event.dateLabel} · {event.timeLabel} às {event.endTimeLabel}
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>
            {event.venue.name}
          </p>
        </div>
      </div>

      <style>{`
        .palco-fogo {
          --corte: ${100 + SUAVE}%;
          --acesa: 0;
        }

        /*
          As laterais e o topo da arte se dissolvem no vermelho da seção.

          O desenho é um retângulo, e retângulo tem borda: sem isto as árvores
          das pontas e o céu do alto terminavam numa linha reta no meio da tela,
          que é exatamente o que faz uma cena parecer figura colada. Esmaecendo,
          a arte não acaba — ela some no fundo, que é da mesma cor.

          Embaixo não há esmaecido: ali é o chão, e chão termina mesmo.
        */
        /*
          As bordas do desenho somem sob o próprio vermelho da seção, pintado
          por cima — e não recortadas por máscara.

          Máscara aqui saía cara: ela é herdada pelos filhos, e os filhos já são
          duas camadas mascaradas, uma delas borrada e misturada à luz. Cada
          nível obriga o navegador a desenhar a subárvore inteira num buffer à
          parte antes de compor. Como o fundo é uma cor chapada e conhecida,
          pintar por cima dá exatamente o mesmo resultado e não custa nada.

          O vermelho transparente é escrito com alfa zero na mesma cor, e não
          com a palavra a palavra transparent: a palavra transparent é preto transparente, e a
          interpolação até ele passa por tons escuros — apareceria uma sombra
          suja no meio do esmaecido.

          Embaixo não há esmaecido: ali é o chão, e chão termina mesmo.
        */
        .arte-casa::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(
              to right,
              rgb(255 26 18) 0%,
              rgb(255 26 18 / 0.55) 4%,
              rgb(255 26 18 / 0) 11%,
              rgb(255 26 18 / 0) 89%,
              rgb(255 26 18 / 0.55) 96%,
              rgb(255 26 18) 100%
            ),
            linear-gradient(
              to bottom,
              rgb(255 26 18) 0%,
              rgb(255 26 18 / 0.62) 8%,
              rgb(255 26 18 / 0.22) 15%,
              rgb(255 26 18 / 0) 24%
            );
        }

        /*
          A mesma máscara nas duas camadas de fogo: o clarão não pode aparecer
          onde a chama ainda não chegou, senão a madeira acende sozinha.
        */
        .chamas,
        .brilho-fogo {
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent var(--corte),
            #000 calc(var(--corte) + ${SUAVE}%)
          );
          mask-image: linear-gradient(
            to bottom,
            transparent var(--corte),
            #000 calc(var(--corte) + ${SUAVE}%)
          );
        }

        /*
          O clarão: as chamas borradas e somadas à luz do que está embaixo.
          plus-lighter só clareia, então ele acende a madeira sem lavar o
          preto do traço. O borrão é estático de propósito — filtro animado
          repinta a cada quadro, e aqui quem se mexe é só a opacidade.
        */
        .brilho-fogo {
          filter: saturate(1.4);
          mix-blend-mode: plus-lighter;
          opacity: calc(var(--acesa) * 0.75);
          animation: fogo-respira 3.7s ease-in-out infinite;
        }

        /*
          A tremida das chamas: opacidade e altura em compassos diferentes e
          primos entre si. Fechando junto, o fogo pulsaria como um coração — o
          que denuncia animação. Em 1,9s e 2,6s eles quase nunca se encontram, e
          o desenho do fogo nunca se repete igual.

          As duas são propriedades que a placa de vídeo resolve sozinha: nada
          aqui obriga o navegador a redesenhar a arte.
        */
        .chamas {
          transform-origin: 50% 100%;
          animation:
            chama-treme 1.9s ease-in-out infinite,
            chama-lambe 2.6s ease-in-out infinite;
          will-change: opacity, transform;
        }

        @keyframes chama-treme {
          0%, 100% { opacity: 0.86; }
          40%      { opacity: 1; }
          70%      { opacity: 0.93; }
        }

        @keyframes chama-lambe {
          0%, 100% { transform: scaleY(1); }
          50%      { transform: scaleY(1.035); }
        }

        @keyframes fogo-respira {
          0%, 100% { opacity: calc(var(--acesa) * 0.6); }
          50%      { opacity: calc(var(--acesa) * 0.95); }
        }

        /* --- as fagulhas --- */

        .fagulhas span {
          position: absolute;
          bottom: 18%;
          border-radius: 50%;
          background: var(--color-ember);
          box-shadow: 0 0 6px var(--color-pumpkin);
          opacity: 0;
        }

        .palco-fogo[data-pegou] .fagulhas span {
          animation-name: fagulha-sobe;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
        }

        @keyframes fagulha-sobe {
          0%   { transform: translate3d(0, 0, 0) scale(0.6); opacity: 0; }
          12%  { opacity: 0.9; }
          70%  { opacity: 0.55; }
          100% { transform: translate3d(var(--desvio), -46svh, 0) scale(1); opacity: 0; }
        }

        /* --- a emenda com o preto do ingresso --- */

        .emenda-fogo {
          height: 44svh;
          background: linear-gradient(
            to bottom,
            var(--color-ink) 0%,
            color-mix(in srgb, var(--color-ink) 86%, transparent) 14%,
            color-mix(in srgb, var(--color-ink) 60%, transparent) 32%,
            color-mix(in srgb, var(--color-ink) 34%, transparent) 52%,
            color-mix(in srgb, var(--color-ink) 14%, transparent) 74%,
            transparent 100%
          );
        }

        @media (prefers-reduced-motion: reduce) {
          .chamas,
          .brilho-fogo,
          .fagulhas span {
            animation: none;
          }
          .brilho-fogo { opacity: calc(var(--acesa) * 0.75); }
        }
      `}</style>
    </section>
  );
}
