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
 * ## O fogo é uma chama de cada vez
 *
 * A casa **nunca muda**: é sempre a `casa.png`, a de traço melhor. Por cima
 * dela vão dezoito chamas, cada uma num arquivo próprio, recortadas da arte em
 * chamas e separadas por mancha conexa.
 *
 * O recorte olha o **canal verde**, e não o calor do pixel. Pelo calor vinham
 * junto pedaços da parede: no desenho em chamas a madeira dos primeiros
 * andares está iluminada pelo fogo e é tão quente quanto ele. Só que chama é
 * amarela (verde alto) e madeira acesa é laranja-marrom (verde baixo) — medido,
 * as duas populações se separam limpas em G≈110. Foi o que tirou os blocos de
 * parede que vinham grudados nas chamas de baixo.
 *
 * Já foram uma imagem só, revelada por uma máscara que subia. Ficou mecânico:
 * o que se via era uma linha reta de fogo atravessando a casa de baixo para
 * cima, e fogo não avança em linha reta. Separadas, cada chama tem a sua hora
 * de acender — as do chão primeiro, as do torreão por último — e acende com um
 * estouro que assenta, que é como fogo pega de verdade.
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
 *    preto do traço continua preto. Sem isto a chama ficava boiando sobre um
 *    desenho vermelho, como adesivo colado.
 * 3. **brilho** — o borrão somado à luz, que é o clarão. Vem de um arquivo já
 *    borrado e pequeno: borrão é justamente o que não precisa de resolução, e
 *    em CSS ele custaria caro por quadro.
 * 4. **chamas** — os dezoito recortes, acendendo com a rolagem.
 * 5. **fagulhas** — pontos que sobem e apagam, depois que o fogo pegou.
 * 6. **texto** — que só chega quando a casa já está tomada, e chega quente.
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
/** A partir de onde o texto começa a chegar — com a casa já tomada. */
const TEXTO_EM = 0.76;
/**
 * Em quantos degraus a cena anda.
 *
 * Cada degrau reescreve o estilo das dezoito chamas, então vale arredondar
 * — mas fogo acendendo não tem linha reta em que o degrau apareça, e sessenta
 * já é mais fino do que o olho separa.
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

export function FireSection() {
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
      cena.style.setProperty(
        "--acende",
        entre0e1((f - TEXTO_EM) / (1 - TEXTO_EM)).toFixed(3),
      );
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
      O laço só roda com a cena por perto. Sem isto ele acompanharia a rolagem
      da página inteira para calcular um fogo que ninguém está vendo — e a
      página tem mais de sete mil pixels de altura acima desta seção.
    */
    let perto = false;

    const desenhar = () => {
      frame = 0;
      const caixa = alvo.getBoundingClientRect();
      /*
        O fogo anda enquanto a cena está presa no topo, e não enquanto ela entra
        pela borda de baixo: como esta é a última seção da página, medindo a
        entrada a casa terminava de queimar antes de alguém poder olhar. O
        percurso é o que sobra de seção depois da tela.
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
      id="ate-la"
      aria-labelledby="ate-la-titulo"
      className="cena-fogo bg-blood relative z-40 h-[210svh] overflow-clip"
    >
      {/*
        `clip`, e não `hidden`: `overflow: hidden` transforma a seção num
        contêiner de rolagem, e aí o palco de dentro passa a grudar nela em vez
        de na tela — ou seja, para de grudar. `clip` recorta sem criar contêiner.
        É o mesmo aprendizado que já estava no `body`, no globals.css.

        O recorte mudou de lugar (era do palco, virou da seção) porque a arte
        agora passa por baixo do palco: no iOS a barra do Safari encolhe e a
        tela fica maior que `svh`, e sobrava uma faixa de vermelho embaixo do
        desenho. Descendo a arte sete telas-por-cento, não há vão possível.
      */}
      <div ref={palco} className="palco-fogo sticky top-0 h-svh">
        {/*
          A arte aparece inteira, na proporção em que foi desenhada, e quem
          preenche a tela é o vermelho da seção — que é o mesmo vermelho do
          fundo dela, então não há onde ver a emenda. Já foi cortada para cobrir
          a tela, e ficou pior: a casa vinha na cara de quem olha e o traço,
          ampliado, perdia o fio.

          As bordas se dissolvem no vermelho (veja `.arte-casa` no estilo).
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
            brigava com ela — parecia adesivo colado. Esta camada é o mesmo
            borrão do fogo em modo `hue`, que troca só o matiz do que está
            embaixo: o vermelho da madeira vira âmbar e o preto do traço fica
            preto, porque preto não tem matiz para trocar. É o que a arte em
            chamas mostra, e o que faltava aqui.

            Vem **antes** das chamas de propósito. Depois delas, aquecia as
            próprias chamas junto e o fogo perdia o contraste com a madeira.
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

          {/* o clarão do fogo na madeira */}
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
            tremida geral por cima de todas. Em bloco, dezoito chamas
            subindo e descendo no mesmo compasso lê como uma imagem pulsando,
            que é o oposto de fogo. Cada uma no seu tempo, a casa inteira
            mexe sem nunca repetir o mesmo quadro.

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
                }}
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
          A emenda com a seção do ingresso, que é preta: o preto vira fumaça e a
          fumaça vira céu. É também o palco do texto.
        */}
        <div
          aria-hidden
          className="emenda-fogo pointer-events-none absolute inset-x-0 top-0"
        />

        {/*
          O texto chega quente e esfria.

          Ele só aparece depois que a casa está tomada — antes disso a cena é
          para ser vista, não lida. E ele não surge pronto: entra na cor da
          brasa, com o clarão em volta, e vai virando osso conforme assenta. É a
          mesma ideia do resto da página: a coisa acontece, não aparece.
        */}
        <div className="texto-fogo relative z-10 px-6 text-center">
          <p className="font-heading text-[0.62rem] font-bold tracking-[0.35em] uppercase">
            é isso
          </p>
          <h2
            id="ate-la-titulo"
            className="font-drip mt-3 text-5xl uppercase sm:text-7xl"
          >
            Até lá
          </h2>
          <p className="font-heading mt-5 text-[0.68rem] font-bold tracking-[0.26em] uppercase sm:text-xs">
            {event.dateLabel} · {event.timeLabel} às {event.endTimeLabel}
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>
            {event.venue.name}
          </p>
        </div>
      </div>

      <style>{`
        .palco-fogo {
          --acesa: 0;
          --acende: 0;
        }

        /*
          As bordas do desenho somem sob o próprio vermelho da seção, pintado
          por cima — e não recortadas por máscara. Máscara é herdada pelos
          filhos, e cada nível obriga o navegador a desenhar a subárvore inteira
          num buffer à parte antes de compor. Como o fundo é uma cor chapada e
          conhecida, pintar por cima dá o mesmo resultado de graça.

          O vermelho transparente é escrito com alfa zero na mesma cor, e não
          com a palavra transparent: transparent é preto transparente, e a
          interpolação até ele passa por tons escuros — apareceria uma sombra
          suja no meio do esmaecido.

          Em cima também não: depois que as teias saíram, o alto do desenho
          é vermelho chapado — não há borda para esconder ali. O esmaecido que
          existia comia a copa das árvores das pontas, e era isso que dava a
          impressão de imagem cortada.

          Embaixo não há esmaecido: ali é o chão, e chão termina mesmo.
        */
        .arte-casa::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          background:
            linear-gradient(
              to right,
              rgb(255 26 18) 0%,
              rgb(255 26 18 / 0.72) 3%,
              rgb(255 26 18 / 0.32) 8%,
              rgb(255 26 18 / 0.1) 13%,
              rgb(255 26 18 / 0) 18%,
              rgb(255 26 18 / 0) 82%,
              rgb(255 26 18 / 0.1) 87%,
              rgb(255 26 18 / 0.32) 92%,
              rgb(255 26 18 / 0.72) 97%,
              rgb(255 26 18) 100%
            );
        }

        /*
          O clarão: as chamas borradas e somadas à luz do que está embaixo.
          plus-lighter só clareia, então ele acende a madeira sem lavar o preto
          do traço.
        */
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

        /*
          A tremida é só de luz — nada de geometria depois de acesa.

          A chama já cresce ao acender, e ali crescer é certo: o recorte é só
          chama, então esticá-lo estica fogo. Depois de acesa, quem varia é o
          brilho: fogo visto de longe não muda de lugar. (A versão anterior
          esticava a arte inteira, e com ela ia o batente da janela junto — dava
          a impressão de ter alguma coisa dançando lá dentro.)

          Os três compassos são quebrados e primos entre si. Números redondos
          fecham juntos de tempos em tempos e o fogo passa a pulsar como um
          coração, que é o que denuncia animação.
        */
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
          A chama sobe pela ponta e afina, que é como fogo se mexe: a base fica
          presa na janela (o transform-origin embaixo) e o alto é que vai e
          volta. O estreitamento junto com a subida evita o efeito de borracha —
          esticar só na vertical faz a chama parecer que engorda.
        */
        @keyframes labareda {
          0%   { transform: scaleY(1) scaleX(1); opacity: 0.9; }
          22%  { transform: scaleY(1.1) scaleX(0.94); opacity: 1; }
          45%  { transform: scaleY(0.96) scaleX(1.05); opacity: 0.92; }
          68%  { transform: scaleY(1.07) scaleX(0.96); opacity: 1; }
          85%  { transform: scaleY(0.99) scaleX(1.02); opacity: 0.94; }
          100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
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
          height: 52svh;
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

        /* --- o texto, que chega quente --- */

        .texto-fogo {
          padding-top: 6svh;
          opacity: var(--acende);
          transform: translateY(calc((1 - var(--acende)) * 18px));
          color: color-mix(
            in srgb,
            var(--color-bone) calc(var(--acende) * 100%),
            var(--color-ember)
          );
        }

        .texto-fogo h2 {
          text-shadow: 0 0 calc((1 - var(--acende)) * 26px)
            rgb(255 145 66 / calc(1 - var(--acende)));
        }

        .texto-fogo p:first-child { opacity: 0.7; }

        @media (prefers-reduced-motion: reduce) {
          .brilho-fogo,
          .labareda,
          .fagulhas span {
            animation: none;
          }
          .brilho-fogo { opacity: calc(var(--acesa) * 0.75); }
        }
      `}</style>
    </section>
  );
}
