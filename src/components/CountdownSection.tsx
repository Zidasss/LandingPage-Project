"use client";

import { useEffect, useRef } from "react";
import { Countdown } from "@/components/Countdown";
import { event } from "@/config/event";

/**
 * A contagem regressiva, na casa que pega fogo.
 *
 * A cena era um morcego gigante com um bando convergindo. Saiu: a casa em
 * chamas conta a mesma coisa melhor — há o que **acontecer** enquanto se rola,
 * e o que acontece rima com a espera acabando. O relógio fica no céu, acima do
 * telhado, e a casa vai pegando fogo embaixo dele.
 *
 * ## O fogo é uma chama de cada vez
 *
 * A casa **nunca muda**: é sempre a `casa.png`, a de traço melhor. Por cima
 * dela vão dezoito chamas, cada uma num arquivo próprio, recortadas da arte em
 * chamas e separadas por mancha conexa.
 *
 * O recorte olha o **canal verde**, e não o calor do pixel. Pelo calor vinham
 * junto pedaços da parede: no desenho em chamas a madeira dos primeiros andares
 * está iluminada pelo fogo e é tão quente quanto ele. Só que chama é amarela
 * (verde alto) e madeira acesa é laranja-marrom (verde baixo) — medido, as duas
 * populações se separam limpas em G≈110.
 *
 * Cada chama tem a sua hora de acender — as do chão primeiro, as do torreão por
 * último — e acende com um estouro que assenta, que é como fogo pega de verdade.
 * Já foi uma imagem só revelada por uma máscara que subia, e ficava mecânico: o
 * que se via era uma linha reta de fogo atravessando a casa, e fogo não avança
 * em linha reta.
 *
 * ## O encaixe das duas artes
 *
 * As duas foram geradas separadas e não são o mesmo desenho: a casa em chamas
 * saiu num tamanho e numa posição ligeiramente diferentes da limpa, e por isso
 * as chamas caíam na parede em vez de na janela. O encaixe (escala 0,96 e um
 * deslocamento de 17 por 14 pixels) foi achado por busca — a combinação que
 * menos discorda entre as duas silhuetas na região da casa. Está anotado em
 * `docs/manutencao.md`, junto do código que gera os recortes.
 *
 * ## As camadas, de baixo para cima
 *
 * 1. **base** — a casa limpa, achatada sobre o vermelho do site.
 * 2. **calor** — o mesmo borrão em modo `hue`, que troca o matiz do que está
 *    embaixo: o vermelho cru da madeira vira âmbar onde o fogo alcança, e o
 *    preto do traço continua preto. Sem isto a chama fica boiando sobre um
 *    desenho vermelho, como adesivo colado.
 * 3. **brilho** — o borrão somado à luz, que é o clarão.
 * 4. **chamas** — os dezoito recortes, acendendo com a rolagem.
 * 5. **fagulhas** — pontos que sobem e apagam, depois que o fogo pegou.
 * 6. **relógio** — fixo no céu, porque é informação e não cena: quem abre a
 *    página para saber quanto falta não deveria ter de rolar até o incêndio
 *    terminar.
 */

/**
 * As chamas, na ordem em que pegam fogo.
 *
 * Medidas em porcentagem da arte, para acompanharem qualquer tamanho de tela:
 * `e`/`t` é o canto (esquerda e topo), `l`/`a` é a medida (largura e altura), e
 * `inicio` é em que ponto da rolagem aquela chama acende. Tudo isto sai do
 * script em `docs/manutencao.md`, que recorta as manchas e calcula a ordem pela
 * altura da base de cada uma.
 */
const CHAMAS = [
  { src: "/chamas/00.webp", e: 10.37, t: 82.353, l: 3.704, a: 12.549, inicio: 0.0 },
  { src: "/chamas/01.webp", e: 45.185, t: 86.176, l: 7.5, a: 4.706, inicio: 0.046 },
  { src: "/chamas/02.webp", e: 47.037, t: 82.941, l: 7.963, a: 5.0, inicio: 0.079 },
  { src: "/chamas/03.webp", e: 48.519, t: 81.176, l: 7.87, a: 5.49, inicio: 0.093 },
  { src: "/chamas/04.webp", e: 69.815, t: 81.471, l: 6.759, a: 5.196, inicio: 0.093 },
  { src: "/chamas/05.webp", e: 30.0, t: 55.294, l: 7.685, a: 23.333, inicio: 0.184 },
  { src: "/chamas/06.webp", e: 67.13, t: 67.843, l: 7.593, a: 10.49, inicio: 0.188 },
  { src: "/chamas/07.webp", e: 55.37, t: 68.431, l: 6.204, a: 9.706, inicio: 0.19 },
  { src: "/chamas/08.webp", e: 35.463, t: 63.824, l: 6.111, a: 13.725, inicio: 0.197 },
  { src: "/chamas/09.webp", e: 44.074, t: 63.431, l: 6.204, a: 14.02, inicio: 0.198 },
  { src: "/chamas/10.webp", e: 67.963, t: 51.275, l: 7.778, a: 13.137, inicio: 0.346 },
  { src: "/chamas/11.webp", e: 56.296, t: 50.882, l: 8.333, a: 12.157, inicio: 0.361 },
  { src: "/chamas/12.webp", e: 34.352, t: 52.157, l: 7.315, a: 10.784, inicio: 0.362 },
  { src: "/chamas/13.webp", e: 44.907, t: 50.686, l: 7.222, a: 11.961, inicio: 0.366 },
  { src: "/chamas/14.webp", e: 57.13, t: 42.647, l: 6.852, a: 9.608, inicio: 0.483 },
  { src: "/chamas/15.webp", e: 34.815, t: 31.961, l: 6.944, a: 11.863, inicio: 0.579 },
  { src: "/chamas/16.webp", e: 44.074, t: 25.294, l: 4.352, a: 4.902, inicio: 0.733 },
  { src: "/chamas/17.webp", e: 37.407, t: 23.627, l: 4.63, a: 5.98, inicio: 0.74 },
] as const;

/** Quanto de rolagem cada chama leva para acender por inteiro. */
const ACENDER = 0.15;
/**
 * Em quantos degraus a cena anda.
 *
 * Cada degrau reescreve o estilo das dezoito chamas, então vale arredondar —
 * mas fogo acendendo não tem linha reta em que o degrau apareça, e sessenta já
 * é mais fino do que o olho separa.
 */
const DEGRAUS = 60;

/**
 * As fagulhas. Posições fixas, e não sorteadas: sorteio no render faria
 * servidor e navegador desenharem coisas diferentes, e a hidratação acusaria.
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

export function CountdownSection() {
  const secao = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alvo = secao.current;
    const cena = palco.current;
    if (!alvo || !cena) return;

    const chamas = [...cena.querySelectorAll<HTMLElement>(".chama")];

    /** Escreve a cena inteira para um dado ponto da rolagem (0 a 1). */
    const pintar = (f: number) => {
      for (const el of chamas) {
        const inicio = Number(el.dataset.inicio);
        const p = entre0e1((f - inicio) / ACENDER);
        /*
          A chama não aparece: ela acende. Sobe rápido e assenta (o cubo), e no
          meio do caminho dá um estouro de tamanho — é o sopro do fogo pegando.
          Sem o estouro, acender vira só um fade, que é o que fazia a cena
          parecer imagem trocando de opacidade em vez de fogo nascendo.
        */
        const suave = 1 - Math.pow(1 - p, 3);
        const estouro = Math.sin(Math.PI * p) * 0.12;
        el.style.opacity = suave.toFixed(3);
        el.style.transform =
          `scaleY(${(0.45 + 0.55 * suave + estouro).toFixed(3)}) ` +
          `scaleX(${(0.82 + 0.18 * suave).toFixed(3)})`;
      }
      cena.style.setProperty("--acesa", f.toFixed(3));
      // As fagulhas só existem depois que a casa já está pegando de verdade.
      if (f > 0.5) cena.dataset.pegou = "1";
      else delete cena.dataset.pegou;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pintar(1);
      return;
    }

    let frame = 0;
    let ultimo = -1;
    /*
      O laço só roda com a cena por perto: sem isto ele acompanharia a rolagem
      da página inteira para calcular um fogo que ninguém está vendo.
    */
    let perto = false;

    const desenhar = () => {
      frame = 0;
      const caixa = alvo.getBoundingClientRect();
      /*
        O fogo anda enquanto a cena está presa no topo, e não enquanto ela entra
        pela borda de baixo: medindo a entrada, a casa terminava de queimar antes
        de alguém poder olhar. O percurso é o que sobra de seção depois da tela.
      */
      const curso = caixa.height - window.innerHeight;
      const passo = Math.round(
        entre0e1(curso > 0 ? -caixa.top / curso : 1) * DEGRAUS,
      );
      if (passo === ultimo) return;
      ultimo = passo;
      pintar(passo / DEGRAUS);
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
      id="contagem"
      /*
        `clip`, e não `hidden`: `overflow: hidden` transforma a seção num
        contêiner de rolagem, e aí o palco de dentro passa a grudar nela em vez
        de na tela — ou seja, para de grudar. `clip` recorta sem criar contêiner.
        É o mesmo aprendizado que já estava no `body`, no globals.css.
      */
      className="cena-fogo bg-blood relative z-40 h-[210svh] overflow-clip"
    >
      <div ref={palco} className="palco-fogo sticky top-0 h-svh">
        {/*
          A arte aparece inteira, na proporção em que foi desenhada, e quem
          preenche a tela é o vermelho da seção — que é o mesmo vermelho do fundo
          dela, então não há onde ver a emenda. Já foi cortada para cobrir a
          tela, e ficou pior: a casa vinha na cara de quem olha e o traço,
          ampliado, perdia o fio.

          Ela desce sete telas-por-cento além do palco porque no iOS a barra do
          Safari encolhe, a tela fica maior que `svh` e sobrava uma faixa de
          vermelho embaixo do desenho. Descendo, não há vão possível.
        */}
        {/*
          `<img>` cru, e não `next/image`: os arquivos já são `.webp` no tamanho
          certo, e passá-los pelo otimizador só os reencodaria sem ganho.
        */}
        {/* eslint-disable @next/next/no-img-element */}
        <div
          className="arte-casa absolute bottom-[-7svh] left-1/2 -translate-x-1/2"
          style={
            {
              "--arte-h": "min(83svh, 138vw)",
              height: "var(--arte-h)",
              // a proporção do desenho (1080x1020) — a largura sai da altura
              width: "calc(var(--arte-h) * 1.0588)",
            } as React.CSSProperties
          }
        >
          <img
            src="/casa.webp"
            alt="Casarão mal-assombrado entre árvores secas"
            width={1080}
            height={1020}
            loading="lazy"
            decoding="async"
            className="block h-full w-full"
          />

          {/*
            O fogo **acende a madeira**, e não só ilumina: no desenho limpo a
            casa é preto sobre vermelho cru, e com a chama por cima o vermelho
            brigava com ela. Esta camada é o borrão do fogo em modo `hue`, que
            troca só o matiz do que está embaixo — o vermelho da madeira vira
            âmbar e o preto do traço fica preto, porque preto não tem matiz para
            trocar. Vem **antes** das chamas: depois delas, aquecia as próprias
            chamas junto e o fogo perdia o contraste com a madeira.
          */}
          <div aria-hidden className="calor-madeira absolute inset-0">
            <img
              src="/casa-brilho.webp"
              alt=""
              width={320}
              height={302}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full"
            />
          </div>

          {/*
            O clarão na madeira. A imagem já vem borrada e pequena (320px):
            borrão é justamente o que não precisa de resolução, e assado no
            arquivo ele sai de graça — em CSS, `filter: blur()` sobre uma camada
            do tamanho da arte é das coisas mais caras de desenhar.
          */}
          <div aria-hidden className="brilho-fogo absolute inset-0">
            <img
              src="/casa-brilho.webp"
              alt=""
              width={320}
              height={302}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full"
            />
          </div>

          {/*
            As chamas. Cada uma tem duas camadas, e por um motivo:

            - o **invólucro** é o que acende, e quem escreve nele é a rolagem;
            - a **imagem** é o que lamba, e quem escreve nela é uma animação.

            Separados porque animação de CSS ganha de estilo em linha: numa
            camada só, a lambida apagaria o acender a cada quadro.

            A lambida é de cada chama, com duração e fase próprias — não uma
            tremida geral por cima de todas. Em bloco, dezoito chamas subindo e
            descendo no mesmo compasso lê como uma imagem pulsando, que é o
            oposto de fogo.

            Esticar aqui é seguro: o recorte é só chama, então o que estica é
            fogo. (Já foi a arte inteira, e junto ia o batente da janela — dava
            a impressão de ter algo dançando lá dentro.)
          */}
          {CHAMAS.map((c, i) => (
            <span
              key={c.src}
              aria-hidden
              className="chama absolute"
              data-inicio={c.inicio}
              style={{
                left: `${c.e}%`,
                top: `${c.t}%`,
                width: `${c.l}%`,
                height: `${c.a}%`,
              }}
            >
              <img
                src={c.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="labareda h-full w-full"
                style={{
                  // tempos quebrados e fora de fase: nenhuma chama acompanha a
                  // vizinha, e o conjunto nunca fecha num pulso só
                  animationDuration: `${(1.15 + (i % 7) * 0.17).toFixed(2)}s`,
                  animationDelay: `${(-(i * 0.41) % 1.9).toFixed(2)}s`,
                  // as ímpares lambem para o outro lado
                  "--lado": i % 2 ? -1 : 1,
                } as React.CSSProperties}
              />
            </span>
          ))}
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
          O relógio, no céu acima do telhado. Ele não depende da rolagem: é
          informação, e quem abre a página para saber quanto falta não deveria
          ter de esperar o incêndio terminar para ler.
        */}
        <div className="relative z-10 px-6 pt-[7svh] text-center">
          <p className="chapeu font-heading text-bone/70 text-[0.62rem] font-bold tracking-[0.35em] uppercase">
            falta pouco
          </p>
          <h2 className="titulo font-drip text-bone mt-3 text-4xl uppercase sm:text-5xl">
            A espera
          </h2>
          <div className="mt-6">
            <Countdown target={event.startsAt} />
          </div>
        </div>
      </div>

      {/*
        O pé da seção apaga no preto do ingresso, que vem logo abaixo.

        Fica na seção e não no palco de propósito: o desenho passa por baixo do
        palco, e um apagamento preso a ele deixaria essa sobra de arte
        aparecendo crua na virada. Aqui ele cobre tudo o que sai por baixo.
      */}
      <div
        aria-hidden
        className="fim-da-casa pointer-events-none absolute inset-x-0 bottom-0"
      />

      <style>{`
        .palco-fogo {
          --acesa: 0;
        }

        /* O relógio, claro sobre a cena. */
        .cena-fogo .relogio dd,
        .cena-fogo .relogio dt { color: var(--color-bone); }
        .cena-fogo .relogio dt { opacity: 0.6; }

        /*
          As bordas do desenho somem sob o próprio vermelho da seção, pintado
          por cima — e não recortadas por máscara. Máscara é herdada pelos
          filhos, e cada nível obriga o navegador a desenhar a subárvore inteira
          num buffer à parte antes de compor. Como o fundo é uma cor chapada e
          conhecida, pintar por cima dá o mesmo resultado de graça.

          O vermelho transparente é escrito com alfa zero na mesma cor, e não com
          a palavra transparent: transparent é preto transparente, e a
          interpolação até ele passa por tons escuros — apareceria uma sombra
          suja no meio do esmaecido.

          O esmaecido é **curto** (nove por cento da largura). Já foi o dobro, e
          numa tela larga o meio do degradê caía bem em cima do tronco da árvore
          da ponta: em vez de a árvore sair de quadro, ela ficava meio apagada,
          que lê como borrão. Curto, ela some na beirada e ninguém repara.

          Em cima não há esmaecido: depois que as teias saíram, o alto do desenho
          é vermelho chapado e não há borda para esconder. O que existia comia a
          copa das árvores das pontas, e era isso que dava a impressão de imagem
          cortada. Embaixo também não: ali é o chão, e chão termina mesmo.
        */
        .arte-casa::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          background: linear-gradient(
            to right,
            rgb(255 26 18) 0%,
            rgb(255 26 18 / 0.5) 2.5%,
            rgb(255 26 18 / 0.14) 5.5%,
            rgb(255 26 18 / 0) 9%,
            rgb(255 26 18 / 0) 91%,
            rgb(255 26 18 / 0.14) 94.5%,
            rgb(255 26 18 / 0.5) 97.5%,
            rgb(255 26 18) 100%
          );
        }

        .calor-madeira {
          mix-blend-mode: hue;
          opacity: calc(var(--acesa) * 1);
        }

        .brilho-fogo {
          filter: saturate(1.4);
          mix-blend-mode: plus-lighter;
          transform-origin: 50% 88%;
          animation: fogo-respira 3.7s ease-in-out infinite;
        }

        @keyframes fogo-respira {
          0%, 100% {
            opacity: calc(var(--acesa) * 0.78);
            transform: scale(1);
          }
          50% {
            opacity: calc(var(--acesa) * 1);
            transform: scale(1.04);
          }
        }

        .chama {
          display: block;
          opacity: 0;
          transform-origin: 50% 100%;
          will-change: opacity, transform;
        }

        .labareda {
          display: block;
          transform-origin: 50% 100%;
          animation-name: labareda;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        /*
          A chama sobe pela ponta, afina e pende para um lado: a base fica presa
          na janela (o transform-origin embaixo) e o alto é que vai e volta.

          O estreitamento junto com a subida evita o efeito de borracha —
          esticar só na vertical faz a chama parecer que engorda. E a inclinação,
          alternada por chama (a variável --lado), é o que tira o resto de cara
          de imagem: fogo pende, não fica em pé.

          A amplitude é generosa (um quarto de altura, dois graus) porque numa
          chama de trinta pixels na tela o sutil simplesmente não se vê. Foi
          medido no olho: com metade disso a casa parecia parada.
        */
        @keyframes labareda {
          0% {
            transform: scaleY(0.94) scaleX(1.04) rotate(0deg);
            opacity: 0.82;
          }
          20% {
            transform: scaleY(1.24) scaleX(0.87) rotate(calc(var(--lado) * 2.2deg));
            opacity: 1;
          }
          42% {
            transform: scaleY(1.02) scaleX(1.02) rotate(calc(var(--lado) * -1.4deg));
            opacity: 0.88;
          }
          63% {
            transform: scaleY(1.19) scaleX(0.9) rotate(calc(var(--lado) * 1.6deg));
            opacity: 1;
          }
          82% {
            transform: scaleY(1.05) scaleX(0.99) rotate(calc(var(--lado) * -0.8deg));
            opacity: 0.9;
          }
          100% {
            transform: scaleY(0.94) scaleX(1.04) rotate(0deg);
            opacity: 0.82;
          }
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

        /* --- o pé da seção, que vira o preto do ingresso --- */

        .fim-da-casa {
          height: 46svh;
          background: linear-gradient(
            to top,
            var(--color-ink) 0%,
            color-mix(in srgb, var(--color-ink) 88%, transparent) 16%,
            color-mix(in srgb, var(--color-ink) 62%, transparent) 36%,
            color-mix(in srgb, var(--color-ink) 32%, transparent) 58%,
            color-mix(in srgb, var(--color-ink) 12%, transparent) 78%,
            transparent 100%
          );
        }

        @media (prefers-reduced-motion: reduce) {
          .brilho-fogo,
          .labareda,
          .fagulhas span {
            animation: none;
          }
          .brilho-fogo { opacity: calc(var(--acesa) * 0.85); }
        }
      `}</style>
    </section>
  );
}
