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
 * O fogo sobe conforme a rolagem. Não são quadros de animação: são duas artes
 * empilhadas, a casa limpa embaixo e a casa em chamas por cima, e o que anda é
 * a máscara que revela a de cima, de baixo para cima, com a frente borrada.
 *
 * As duas artes **não são o mesmo desenho** — foram geradas separadas, e cada
 * traço saiu diferente. Isso não estraga porque elas concordam no que importa
 * (a casa, o telhado, as janelas, o chão) e a frente da máscara é suave: a
 * diferença de traço na faixa de passagem lê como tremida de calor.
 *
 * Por isso mesmo a máscara **varre a arte inteira**, de fora a fora. A primeira
 * versão parava o fogo abaixo das teias, que é onde os dois desenhos mais
 * divergem — só que parar deixa uma emenda parada na tela para sempre, com as
 * duas teias sobrepostas. Varrendo até o fim, o estado final é a arte em chamas
 * pura, sem emenda nenhuma: a diferença só existe na faixa que está passando, e
 * o que está passando ninguém consegue examinar.
 */

/** Altura da frente borrada do fogo, em porcentagem da altura da arte. */
const SUAVE = 16;
/**
 * Em quantos degraus a subida acontece.
 *
 * Mexer na máscara obriga o navegador a repintar a arte inteira — é o mesmo
 * custo do borrão da abóbora na abertura, e pela mesma razão anda em degraus
 * em vez de a cada quadro. Trinta é fino o bastante para o olho ler como
 * subida contínua, porque o fogo é uma forma irregular e borrada: não há linha
 * reta em que o degrau apareça.
 */
const DEGRAUS = 30;

/** Prende um número entre 0 e 1. */
function entre0e1(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function FireSection() {
  const secao = useRef<HTMLElement>(null);
  const fogo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alvo = secao.current;
    const camada = fogo.current;
    if (!alvo || !camada) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      camada.style.setProperty("--corte", `${-SUAVE}%`);
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
        O fogo anda enquanto a cena está presa no topo, e não enquanto ela
        entra pela borda de baixo.

        A primeira versão media a entrada da seção na tela, e com isso a casa
        já chegava em brasa: como a seção tinha uma tela de altura e é a última
        da página, quando ela terminava de entrar não sobrava rolagem nenhuma —
        o fogo subia todo antes de alguém poder olhar. Agora a seção é mais
        alta que a tela e o palco gruda: o percurso é o que sobra de seção
        depois da tela, e é ele que o dedo percorre com a cena parada.
      */
      const curso = caixa.height - window.innerHeight;
      const passo = Math.round(entre0e1(curso > 0 ? -caixa.top / curso : 1) * DEGRAUS);
      if (passo === ultimo) return;
      ultimo = passo;

      const f = passo / DEGRAUS;
      const corte = 100 + SUAVE - f * (100 + SUAVE * 2);
      camada.style.setProperty("--corte", `${corte.toFixed(2)}%`);
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
      className="cena-fogo bg-blood text-ink relative z-40 h-[175svh]"
    >
      {/* O palco gruda no topo: a cena fica parada enquanto o fogo sobe. */}
      <div className="sticky top-0 h-svh overflow-hidden">
        {/*
          A arte é medida pela altura, como a do morcego: ela é retrato (4:5) e
          o que precisa caber é a casa inteira, do chão às teias. O teto em vw
          impede que, num celular estreito, a largura calculada a partir da
          altura estoure a tela e corte as árvores das pontas.
        */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ "--arte-h": "min(86svh, 125vw)" } as React.CSSProperties}
        >
          <div
            className="relative mx-auto aspect-[4/5]"
            style={{ height: "var(--arte-h)" }}
          >
            {/*
              As artes são `.webp` com o vermelho já embutido, servidas cruas,
              e não os `.png` transparentes pelo `next/image`. É uma diferença
              de 793KB para 251KB nas duas juntas, e o motivo é o canal alfa:
              num desenho de traço denso como este ele carrega quase toda a
              informação e é o que mais custa a comprimir. Achatadas sobre o
              vermelho exato do site (`--color-blood`), as bordas da caixa
              somem no fundo da seção e o resultado na tela é idêntico —
              inclusive na faixa de passagem da máscara, onde as duas se
              misturam sobre o mesmo vermelho.

              Os `.png` originais continuam no repositório: são a fonte, e é
              deles que sai um `.webp` novo se a arte mudar.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/casa.webp"
              alt="Casarão mal-assombrado entre árvores secas"
              width={1080}
              height={1350}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain object-bottom"
            />

            {/*
              A camada do fogo, revelada de baixo para cima pela máscara. O
              `--corte` é onde está a frente do fogo; abaixo dele a arte em
              chamas aparece inteira, e na faixa de `SUAVE` logo acima ela vai
              sumindo.
            */}
            <div ref={fogo} className="camada-fogo absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/casa-fogo.webp"
                alt=""
                aria-hidden
                width={1080}
                height={1350}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-contain object-bottom"
              />
            </div>
          </div>
        </div>

        {/*
          O texto ocupa o vazio do céu entre as teias, que é onde o cartaz
          original tinha os dizeres. Fica acima da arte na pilha.

          A altura é em svh, e diferente por tamanho de tela, porque a arte não
          se ancora no mesmo lugar nas duas: no celular ela é limitada pela
          largura e sobra muito céu em cima; no computador ela é limitada pela
          altura e o céu é uma faixa estreita. Um valor só deixava o texto
          boiando longe do desenho de um lado ou colado nele do outro.
        */}
        <div className="relative z-10 px-6 pt-[19svh] text-center sm:pt-[7svh]">
          <p className="font-heading text-ink/70 text-[0.62rem] font-bold tracking-[0.35em] uppercase">
            é isso
          </p>
          <h2
            id="ate-la-titulo"
            className="font-drip text-ink mt-3 text-5xl uppercase sm:text-7xl"
          >
            Até lá
          </h2>
          <p className="font-heading text-ink mt-5 text-[0.68rem] font-bold tracking-[0.26em] uppercase sm:text-xs">
            {event.dateLabel} · {event.timeLabel}
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>
            {event.venue.name}
          </p>
        </div>
      </div>

      <style>{`
        .camada-fogo {
          --corte: ${100 + SUAVE}%;
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
      `}</style>
    </section>
  );
}
