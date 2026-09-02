"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/** Deformação máxima, em pixels do espaço do filtro. */
const DERRETIMENTO = 118;
/** Desfoque máximo que alimenta a liquefação. */
const BORRAO = 9;
/**
 * O filtro é recalculado pixel a pixel a cada mudança. Arredondar em degraus
 * corta a maior parte das recalculações sem que o olho perceba salto.
 */
const DEGRAU = 3;
/**
 * Limiar da liquefação. Ele decide quanta massa sobrevive ao desfoque: no
 * início segura a forma das letras, e no fim vai comendo a massa de fora para
 * dentro até não sobrar gota nenhuma.
 */
const LIMIAR_INICIAL = -8;
const LIMIAR_FINAL = -26;
/** Quanto do percurso separa a primeira linha a se formar da última. */
const ATRASO_TOTAL = 0.34;
/** Quantos filtros existem no documento — teto de linhas atendidas. */
const FILTROS = 8;

/**
 * O cartaz se **forma derretendo**, conforme a página rola — tudo guiado só pelo
 * scroll, sem relógio nenhum.
 *
 * Quando a porta termina de abrir, a rolagem do hero está em zero e as letras
 * estão liquefeitas, gotas espalhadas dentro da luz. A partir daí, cada pixel de
 * rolagem puxa a massa de volta à forma: as gotas se juntam, as bordas endurecem
 * e as palavras aparecem — no mesmo compasso em que a luz cresce e toma a tela. É
 * o derretimento ao contrário, e é uma coisa só com a abertura: parar de rolar
 * congela o quadro, voltar torna a derreter.
 *
 * Cada linha tem o **seu próprio filtro**, com semente e ritmo diferentes. Com
 * um filtro só, todas se formavam no mesmo instante e com o mesmo desenho — o
 * efeito ficava mecânico, que é o oposto do que derretimento parece. Aqui as
 * de baixo endurecem primeiro, por estarem mais perto de quem olha, e cada uma
 * com uma textura própria.
 *
 * A deformação é `feDisplacementMap` seguido de liquefação: filtro é o efeito
 * mais caro que existe para animar, porque não roda na camada de composição.
 * Por isso ele fica restrito a telas grandes; no celular o mesmo movimento
 * acontece só com transform, que desliza liso.
 */
/** O quanto o cartaz está derretido agora, e o quanto escorre para os lados. */
export type EstadoCartaz = { derretido: number; espalha: number };

export function MeltingPoster({
  children,
  fonte,
}: {
  children: ReactNode;
  /**
   * De onde vem o estado do cartaz. Quem manda é a linha do tempo da abertura —
   * a mesma que abre a porta e alarga a luz. Medindo por conta própria, o cartaz
   * andava num compasso e a cena em outro, e as duas coisas pareciam animações
   * separadas.
   */
  fonte: () => EstadoCartaz;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const linhas = [...node.querySelectorAll<HTMLElement>("[data-linha]")];
    if (linhas.length === 0) return;

    const total = linhas.length;

    /** Filtro de cada linha, e o quanto ela espera para começar a derreter. */
    const trilhas = linhas.map((linha, i) => {
      const indice = i % FILTROS;
      linha.style.filter = `url(#derrete-${indice})`;
      return {
        linha,
        // as de baixo derretem primeiro: estão mais perto de quem olha
        atraso: ((total - 1 - i) / total) * ATRASO_TOTAL,
        ruido: document.getElementById(
          `ruido-${indice}`,
        ) as unknown as SVGFETurbulenceElement | null,
        desloca: document.getElementById(
          `desloca-${indice}`,
        ) as unknown as SVGFEDisplacementMapElement | null,
        borrao: document.getElementById(
          `borrao-${indice}`,
        ) as unknown as SVGFEGaussianBlurElement | null,
        limiar: document.getElementById(
          `limiar-${indice}`,
        ) as unknown as SVGFEColorMatrixElement | null,
        ultimo: -1,
      };
    });

    let frame = 0;
    const aplicar = () => {
      frame = 0;
      const { derretido, espalha } = fonte();

      for (const t of trilhas) {
        // As de baixo (atraso menor) endurecem primeiro e escorrem por último.
        const local = Math.min(
          1,
          Math.max(0, (derretido - t.atraso) / (1 - t.atraso)),
        );
        const abre = Math.min(
          1,
          Math.max(0, (espalha - t.atraso) / (1 - t.atraso)),
        );

        // Escorre para os lados só quando a luz alarga — é ela que abre espaço.
        // Antes disso a luz é estreita e as letras sairiam dela, para o preto.
        t.linha.style.transform =
          `scale3d(${(1 + abre * abre * 1.35).toFixed(3)}, ` +
          `${(1 + local * 0.09 - abre * 0.16).toFixed(3)}, 1)`;

        /*
          A saída por opacidade é só para o caso de o filtro não existir —
          navegador sem suporte, ou os nós do SVG não terem sido encontrados.
          Não é mais o caminho do celular.

          Ele era: abaixo de 640px o derretimento simplesmente não acontecia, e
          o cartaz só aparecia clareando. A tela pequena via um efeito diferente
          da grande, e isso se notava. A restrição era medo de desempenho, nunca
          medido — medido agora, com o filtro ligado num celular de CPU seis
          vezes mais lenta, a rolagem mantém 16,7ms de mediana e dois quadros
          ruins em cento e noventa e oito. O filtro cabe.
        */
        if (!t.desloca || !t.borrao || !t.ruido || !t.limiar) {
          t.linha.style.opacity = (1 - local * local).toFixed(3);
          continue;
        }
        const escala = Math.round((local * DERRETIMENTO) / DEGRAU) * DEGRAU;
        if (escala === t.ultimo) continue;
        t.ultimo = escala;
        const fracao = escala / DERRETIMENTO;
        t.desloca.setAttribute("scale", String(escala));
        // O desfoque anda junto: separados, ora sobra borrão sem deformação,
        // ora o contrário, e os dois estados parecem defeito.
        t.borrao.setAttribute("stdDeviation", (fracao * BORRAO).toFixed(2));
        // A textura também muda de escala ao longo do derretimento — sem isso
        // o desenho é sempre o mesmo, só maior, e lê como zoom e não como
        // massa perdendo forma.
        t.ruido.setAttribute(
          "baseFrequency",
          `${(0.004 + fracao * 0.005).toFixed(4)} ${(0.021 + fracao * 0.012).toFixed(4)}`,
        );
        // A massa não desbota: ela é comida de fora para dentro, quebrando em
        // gotas cada vez menores até sumir. Baixar a opacidade no lugar disso
        // lia como falha de renderização — dava para ver a linha inteira
        // clareando parada na tela.
        const corrosao = Math.min(1, Math.max(0, (local - 0.34) / 0.5));
        const limiar =
          LIMIAR_INICIAL + (LIMIAR_FINAL - LIMIAR_INICIAL) * corrosao * corrosao;
        t.limiar.setAttribute(
          "values",
          `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 ${limiar.toFixed(2)}`,
        );
      }
    };
    const aoRolar = () => {
      if (!frame) frame = requestAnimationFrame(aplicar);
    };

    aplicar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, [fonte]);

  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <defs>
          {Array.from({ length: FILTROS }, (_, i) => (
            /*
              A região do filtro é bem maior que a linha: sem essa folga os
              pingos são cortados na borda da caixa e o derretimento acaba num
              corte reto. O ruído é alongado na horizontal — frequência baixa
              em X — para as letras se esticarem para os lados.
            */
            <filter
              key={i}
              id={`derrete-${i}`}
              x="-30%"
              y="-40%"
              width="160%"
              height="200%"
              colorInterpolationFilters="sRGB"
            >
              {/*
                Duas oitavas, e não três. Cada oitava é uma passada a mais do
                ruído fractal, e o custo dobra — num celular, com oito filtros
                recalculados enquanto se rola, é a diferença entre passar e
                engasgar. A terceira oitava só acrescenta grão fino, que a
                própria liquefação logo abaixo apaga.
              */}
              <feTurbulence
                id={`ruido-${i}`}
                type="fractalNoise"
                baseFrequency="0.004 0.021"
                numOctaves="2"
                seed={7 + i * 13}
                result="ruido"
              />
              <feDisplacementMap
                id={`desloca-${i}`}
                in="SourceGraphic"
                in2="ruido"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
                result="deslocado"
              />
              {/*
                Liquefação: desfoca e depois recupera o contraste do canal alfa.
                As bordas moles voltam a ser nítidas, mas já fundidas — é o que
                faz as letras virarem massa contínua em vez de cacos borrados.
              */}
              <feGaussianBlur
                id={`borrao-${i}`}
                in="deslocado"
                stdDeviation="0"
                result="mole"
              />
              <feColorMatrix
                id={`limiar-${i}`}
                in="mole"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
              />
            </filter>
          ))}
        </defs>
      </svg>

      <div ref={ref} className="w-full">
        {children}
      </div>
    </>
  );
}
