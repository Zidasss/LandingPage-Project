"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ALARGA,
  ALTURA_ABERTURA,
  CARTAZ,
  MACANETA,
  PORTA,
  RECUO,
  aberturaDaFolha,
  fatia,
  progresso,
  suavizar,
} from "@/lib/abertura";
import { DOOR_BOTTOM, DOOR_RATIO, DOOR_TOP } from "@/lib/beam";
import { abriuDeVez, abrindoPorta, fechouPorta } from "@/lib/som";
import { DoorCrowd } from "@/components/DoorCrowd";
import { MeltingPoster } from "@/components/MeltingPoster";
import { PosterLines } from "@/components/PosterLines";
import { event } from "@/config/event";

/**
 * A abertura inteira, numa cena só.
 *
 * A abóbora aparece no escuro e, conforme a página rola, recua perdendo
 * definição até não sobrar desenho nenhum — só um círculo vermelho, que lê como
 * maçaneta. A porta se desenha em volta dele, a folha gira, a luz escapa pelo
 * vão, e é dentro dessa luz que o cartaz se forma a partir das gotas. Tudo com o
 * dedo de quem rola, e tudo na **mesma porta**.
 *
 * Antes isto eram dois componentes: uma abertura que desenhava a porta e um hero
 * que desenhava outra porta igual, com o cartaz. Por mais alinhadas que as duas
 * ficassem, a passagem de uma para a outra sempre aparecia — via-se o efeito
 * sumir de uma porta e nascer na outra. Não havia alinhamento que resolvesse:
 * duas portas são duas portas. Agora existe uma só, do começo ao fim.
 *
 * O palco é `sticky`: fica preso no topo enquanto a seção passa e, quando ela
 * acaba, sai rolando junto com a página — sem troca, sem elemento que apaga.
 */
export function Opening() {
  const secao = useRef<HTMLElement>(null);
  const abobora = useRef<HTMLDivElement>(null);
  const macaneta = useRef<HTMLDivElement>(null);
  const porta = useRef<HTMLDivElement>(null);
  const folha = useRef<HTMLDivElement>(null);
  const quina = useRef<HTMLDivElement>(null);
  const galera = useRef<HTMLDivElement>(null);
  const brilho = useRef<HTMLDivElement>(null);
  const cartaz = useRef<HTMLDivElement>(null);
  const dica = useRef<HTMLParagraphElement>(null);

  /**
   * Estado do cartaz, lido pelo derretimento a cada quadro.
   *
   * `derretido`: 1 = gotas soltas, 0 = palavra formada. Sobe de novo no fim,
   * quando a luz alarga e as letras escorrem.
   * `espalha`: o quanto elas abrem para os lados — só na fase final, porque é a
   * boca da luz que abre espaço para isso.
   */
  const estadoCartaz = useCallback(() => {
    const alvo = secao.current;
    if (!alvo) return { derretido: 1, espalha: 0 };
    const p = progresso(alvo);
    const forma = fatia(p, CARTAZ);
    const espalha = fatia(p, ALARGA);
    return { derretido: Math.max(1 - forma, espalha), espalha };
  }, []);

  /*
    Recarregar volta para a abóbora.

    O navegador guarda a posição da rolagem e devolve a página onde ela estava —
    o que numa página comum é gentileza e aqui é defeito: a abertura é uma cena
    que se atravessa do começo, e voltar no meio dela entrega a porta já aberta,
    sem porta nenhuma tendo se aberto.

    O endereço com âncora é a exceção: quem chega em `#ingresso` pediu para
    chegar ali, e mandá-lo para o topo seria desfazer o que ele pediu.
  */
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const alvo = secao.current;
    if (!alvo) return;

    const lerp = (de: number, ate: number, t: number) => de + (ate - de) * t;

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduzido.matches) {
      // Sem movimento a cena não se monta sozinha: ela já nasce montada, com a
      // porta aberta e o cartaz legível.
      alvo.dataset.parado = "1";
      return;
    }

    let frame = 0;

    /** Abaixo disto a folha está encostada no batente. */
    const LIMIAR = 0.03;
    /** Passado isto ela já está no fim do curso, e não anda mais. */
    const ABERTA = 0.97;
    let aberta = false;

    /*
      O som acompanha a folha, quadro a quadro.

      A abertura é passada crua para o módulo de som, que percorre a gravação
      junto com ela: a posição no áudio é a posição da porta. Não há cronômetro
      aqui, e não deve haver — som de porta tem que durar o que a porta durar, e
      quem decide isso é o dedo de quem rola.

      Toda passagem soa, e não só a primeira: a animação se refaz a cada
      rolagem, e uma porta que se move em silêncio na segunda vez parece
      quebrada. Quem cuida de as batidas não se empilharem é o módulo de som.

      Fechar exige ter aberto antes. Sem isso, uma página aberta já rolada para
      baixo bateria a porta assim que alguém subisse um pixel.
    */
    const soar = (o: number) => {
      if (o > LIMIAR && o < ABERTA) {
        aberta = true;
        abrindoPorta(o);
      } else if (o >= ABERTA) {
        abriuDeVez();
      } else if (aberta) {
        aberta = false;
        fechouPorta();
      }
    };

    const desenhar = () => {
      frame = 0;
      const p = progresso(alvo);

      // A maçaneta assenta na borda da porta, do lado do vão. Como a largura da
      // porta vem da altura da janela, esse deslocamento é medido da própria
      // porta a cada quadro — um valor fixo em vw a jogava para fora nas telas
      // em que a porta encolhe.
      const larguraPorta = porta.current?.offsetWidth ?? 0;
      if (larguraPorta) {
        alvo.style.setProperty("--macaneta-x", `${larguraPorta / 2 - 14}px`);
      }

      // --- abóbora: recua, some, e caminha até o lugar da maçaneta ---
      const rec = suavizar(fatia(p, RECUO));
      if (abobora.current) {
        abobora.current.style.opacity = String(1 - fatia(rec, [0.72, 1]));
        abobora.current.style.transform =
          `translate(calc(-50% + var(--macaneta-x) * ${rec.toFixed(3)}), ` +
          `calc(-50% + var(--macaneta-dy) * ${rec.toFixed(3)})) ` +
          `scale(${lerp(1, 0.115, rec).toFixed(3)})`;
        abobora.current.style.filter =
          `blur(${(rec * 12).toFixed(1)}px) saturate(${(1 - rec * 0.6).toFixed(2)}) ` +
          `hue-rotate(${(-rec * 30).toFixed(0)}deg) brightness(${(1 - rec * 0.3).toFixed(2)})`;
      }

      // --- abertura: a folha gira (mesma conta que a luz lê) ---
      const o = aberturaDaFolha(p);
      const largura = 1 - o * 0.95;
      soar(o);

      // --- maçaneta: aparece e depois viaja com a borda da folha ---
      if (macaneta.current) {
        const aparece = fatia(p, MACANETA);
        const some = 1 - fatia(o, [0.55, 1]);
        const lado = 2 * largura - 1;
        macaneta.current.style.opacity = String(Math.min(aparece, some));
        macaneta.current.style.transform =
          `translate(calc(-50% + var(--macaneta-x) * ${lado.toFixed(3)}), -50%) ` +
          `scale(${lerp(0.115, 0.085, aparece).toFixed(3)})`;
      }

      if (porta.current) porta.current.style.opacity = String(fatia(p, PORTA));

      if (folha.current) {
        folha.current.style.transform = `scaleX(${largura.toFixed(4)})`;
        folha.current.style.filter = `brightness(${(1 - o * 0.7).toFixed(3)})`;
      }

      // A quina da folha, virada para dentro, pega a luz da sala. É o que dá
      // espessura à porta: sem ela a folha é um retângulo preto encolhendo, e
      // não uma folha girando na frente de uma luz. Ela viaja com a borda e
      // acende conforme o vão abre — some no fim, quando a folha já saiu.
      if (quina.current) {
        quina.current.style.left = `${(largura * 100).toFixed(3)}%`;
        quina.current.style.opacity = String(
          fatia(o, [0, 0.12]) * (1 - fatia(o, [0.86, 1])),
        );
      }

      // A festa assenta enquanto é revelada: entra um tico maior e recua para o
      // lugar. Parada, ela lê como adesivo colado atrás do vão.
      if (galera.current) {
        galera.current.style.transform = `scale(${lerp(1.08, 1, o).toFixed(4)})`;
      }

      // O brilho do batente é da porta se abrindo: cresce com o vão e se apaga
      // quando a luz já tomou a cena, para não virar um halo parado no fundo.
      if (brilho.current) {
        brilho.current.style.opacity = String(o * (1 - fatia(p, ALARGA)));
      }

      // O cartaz só existe depois que há luz onde ele possa estar.
      if (cartaz.current) {
        cartaz.current.style.opacity = String(fatia(p, [CARTAZ[0] - 0.04, CARTAZ[0]]));
      }

      if (dica.current) dica.current.style.opacity = String(1 - fatia(p, [0.02, 0.16]));
    };

    const aoRolar = () => {
      if (!frame) frame = requestAnimationFrame(desenhar);
    };

    desenhar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  return (
    <section
      ref={secao}
      data-abertura
      className="abertura relative"
      style={{ height: ALTURA_ABERTURA }}
    >
      {/*
        O palco fica preso no topo enquanto a seção passa e sai rolando quando
        ela acaba. É a cena inteira: porta, galera, luz e cartaz moram aqui, e é
        por isso que não existe passagem de uma porta para outra.
      */}
      {/*
        Sem fundo próprio, e com z acima do feixe: o preto da cena é o do body, e
        a luz — que é fixa, atrás de tudo — aparece por onde o palco não pinta
        nada. Um palco opaco esconderia a luz; um palco abaixo do feixe deixaria
        o vermelho passar por cima do cartaz.
      */}
      <div className="palco sticky top-0 z-30 h-svh overflow-hidden">
        {/* a abóbora: presente, e recua perdendo a forma conforme rola */}
        <div ref={abobora} className="abertura-abobora">
          {event.intro.pumpkin ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.intro.pumpkin}
              alt=""
              className="abertura-risada h-full w-full object-contain"
            />
          ) : null}
        </div>

        {/* o que sobra dela: a maçaneta */}
        <div ref={macaneta} className="abertura-macaneta" />

        {/* o brilho que escapa do batente conforme a porta abre */}
        <div ref={brilho} className="abertura-brilho" />

        {/* a porta: a luz e a festa atrás, a folha por cima delas */}
        <div ref={porta} data-porta className="abertura-porta">
          <div className="abertura-luz" />
          <div ref={galera} className="abertura-galera">
            <DoorCrowd />
          </div>
          {/* a sombra do batente, que dá fundo ao vão */}
          <div aria-hidden className="abertura-batente" />
          <div ref={folha} className="abertura-folha" />
          {/* a quina da folha, acesa pela luz de dentro */}
          <div ref={quina} aria-hidden className="abertura-quina" />
        </div>

        {/*
          O cartaz, deitado no plano do feixe: inclinado com ele, convergindo
          para a mesma abertura. A perspectiva é 3D em vez de larguras escolhidas
          linha a linha, para o bloco acompanhar o trapézio sozinho em qualquer
          tela.
        */}
        <div
          ref={cartaz}
          className="absolute inset-x-0 bottom-0 z-40 flex justify-center opacity-0"
          style={{ height: "34%", perspective: "180px", perspectiveOrigin: "50% 0%" }}
        >
          <div
            className="flex w-[min(79vw,66svh)] items-end justify-center pb-[2vh] sm:w-[min(66vw,116svh)]"
            style={{ transform: "rotateX(34deg)", transformOrigin: "50% 100%" }}
          >
            <h1 className="sr-only">
              {event.name} — festa de Halloween em {event.dateLabel}
            </h1>
            <MeltingPoster fonte={estadoCartaz}>
              <PosterLines />
            </MeltingPoster>
          </div>
        </div>

        <p ref={dica} className="abertura-dica font-heading">
          role para abrir a porta ▾
        </p>
      </div>

      <style>{`
        .abertura {
          --porta-topo: ${DOOR_TOP}%;
          --porta-altura: ${DOOR_BOTTOM - DOOR_TOP}%;
          /* Meia altura da porta: onde a mão alcançaria a maçaneta. */
          --macaneta-y: ${(DOOR_TOP + DOOR_BOTTOM) / 2}%;
          /*
            Distância vertical que a abóbora percorre até a maçaneta, em altura
            de tela. Precisa ser vh e não %: dentro de um transform, a
            porcentagem é relativa ao próprio elemento, não à viewport.
          */
          --macaneta-dy: ${(DOOR_TOP + DOOR_BOTTOM) / 2 - 38}vh;
          --macaneta-x: 14.4vw;
        }

        @media (min-width: 640px) {
          .abertura { --macaneta-x: 7.9vw; }
        }

        .abertura-abobora,
        .abertura-macaneta {
          position: absolute;
          left: 50%;
          top: 38%;
        }

        .abertura-abobora {
          width: min(34vw, 220px);
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
        }

        /*
          O riso vive no próprio desenho, num ritmo independente do scroll.

          A entrada vem junto, na mesma tag: a abóbora nasce do escuro em vez de
          já estar lá quando a página abre. Ela sobe embaçada e sem cor, e ganha
          foco e brilho conforme aparece — é a lanterna acendendo, não um
          elemento surgindo.

          As duas animações convivem porque tratam de propriedades diferentes: a
          entrada mexe em opacidade e filtro, o riso mexe em transform. Se as
          duas disputassem transform, a última declarada apagaria a outra.

          A opacidade daqui multiplica a que o scroll escreve no elemento de
          fora — por isso a entrada mora no desenho, e não no contêiner que o
          laço da rolagem controla a cada quadro.
        */
        .abertura-risada {
          transform-origin: 50% 60%;
          animation:
            abertura-nascer 1500ms cubic-bezier(0.22, 0.8, 0.3, 1) both,
            abertura-risada 620ms ease-in-out infinite alternate;
        }

        @keyframes abertura-nascer {
          from {
            opacity: 0;
            filter: blur(16px) brightness(0.25) saturate(0.4);
          }
          to {
            opacity: 1;
            filter: blur(0) brightness(1) saturate(1);
          }
        }

        /* Sem movimento, a abóbora já está acesa — nada a fazer nascer. */
        @media (prefers-reduced-motion: reduce) {
          .abertura-risada {
            animation: none;
          }
        }

        @keyframes abertura-risada {
          from { transform: scale(1) rotate(-2deg); }
          to   { transform: scale(1.04) rotate(2deg); }
        }

        .abertura-macaneta {
          z-index: 2;
          top: var(--macaneta-y);
          width: min(34vw, 220px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: var(--color-blood);
          box-shadow: 0 0 2.5vw rgba(255, 26, 18, 0.45);
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.115);
        }

        .abertura-porta {
          position: absolute;
          left: 50%;
          top: var(--porta-topo);
          height: var(--porta-altura);
          /* a largura sai da altura, para a porta manter proporção de porta em
             qualquer formato de janela */
          width: min(46vw, ${(DOOR_BOTTOM - DOOR_TOP) / DOOR_RATIO}svh);
          transform: translateX(-50%);
          z-index: 10;
          overflow: hidden;
          background: #120303;
          opacity: 0;
        }

        .abertura-luz {
          position: absolute;
          inset: 0;
          background: var(--color-blood);
        }

        .abertura-galera {
          position: absolute;
          inset: 0;
          transform-origin: 50% 100%;
        }

        /*
          A sombra que o batente joga para dentro. Só no alto e nas laterais: em
          baixo o vão emenda com o feixe, e escurecer ali abriria uma costura
          entre a luz da porta e a luz que desce pelo chão.
        */
        .abertura-batente {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent 22%),
            linear-gradient(to right, rgba(0, 0, 0, 0.35), transparent 12%),
            linear-gradient(to left, rgba(0, 0, 0, 0.35), transparent 12%);
        }

        .abertura-folha {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: #120303;
          transform-origin: left center;
          transform: scaleX(1);
        }

        /*
          Fora da folha, e não uma borda dela: a folha é escalada em X, e uma
          borda encolheria junto até sumir. Solta, a quina mantém a espessura e
          só acompanha a posição da aresta.
        */
        .abertura-quina {
          position: absolute;
          top: 0;
          bottom: 0;
          z-index: 2;
          width: 0.5vh;
          min-width: 2px;
          transform: translateX(-100%);
          opacity: 0;
          background: linear-gradient(
            to right,
            rgba(255, 140, 90, 0.15),
            rgba(255, 190, 150, 0.85)
          );
        }

        .abertura-brilho {
          position: absolute;
          left: 50%;
          top: var(--macaneta-y);
          width: 120vw;
          height: 96vh;
          transform: translate(-50%, -50%);
          opacity: 0;
          background: radial-gradient(
            ellipse 20% 44% at 50% 50%,
            rgba(255, 80, 40, 0.45) 0%,
            rgba(255, 26, 18, 0.18) 42%,
            transparent 74%
          );
        }

        .abertura-dica {
          position: absolute;
          bottom: 6%;
          left: 50%;
          transform: translateX(-50%);
          color: var(--color-ash);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        /* Sem movimento: a cena já nasce montada e legível. */
        .abertura[data-parado] { height: 100svh; }
        .abertura[data-parado] .abertura-abobora,
        .abertura[data-parado] .abertura-macaneta,
        .abertura[data-parado] .abertura-folha,
        .abertura[data-parado] .abertura-dica { display: none; }
        .abertura[data-parado] .abertura-porta { opacity: 1; }
        .abertura[data-parado] .palco > div:last-of-type { opacity: 1; }
      `}</style>
    </section>
  );
}
