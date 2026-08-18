import { Curtain } from "@/components/Curtain";
import { Doorway } from "@/components/Doorway";
import { Floor } from "@/components/Floor";
import { MeltingPoster } from "@/components/MeltingPoster";
import { PosterLines } from "@/components/PosterLines";
import {
  beamPolygon,
  BEAM_DESKTOP,
  BEAM_MOBILE,
  DOOR_BOTTOM,
  DOOR_TOP,
} from "@/lib/beam";
import { event } from "@/config/event";

/**
 * Hero da porta.
 *
 * A porta ao fundo emite um feixe de luz em perspectiva, e o texto do cartaz
 * está deitado no plano desse feixe — inclinado com ele, convergindo para a
 * mesma abertura. A perspectiva é feita com transformação 3D em vez de larguras
 * escolhidas linha a linha: assim o bloco acompanha o trapézio sozinho, em
 * qualquer tamanho de tela.
 *
 * As camadas estão em ordem explícita porque a transição depende disso: ao
 * rolar, a cortina de preto desce sobre o chão e a porta, mas passa por baixo
 * do feixe. A luz permanece enquanto o resto some, e o vermelho que sobra
 * encosta na seção seguinte. Nada muda de lugar nem de forma.
 */
export function DoorHero() {
  return (
    <section className="bg-ink relative h-svh overflow-hidden">
      {/* z-0 · chão em perspectiva, com o ponto de fuga na porta */}
      <div className="text-blood/40 absolute inset-0 z-0">
        <Floor />
      </div>

      {/* z-10 · a porta */}
      <div
        className="absolute left-1/2 z-10 w-[40vw] -translate-x-1/2 sm:w-[22vw]"
        style={{ top: `${DOOR_TOP}%`, height: `${DOOR_BOTTOM - DOOR_TOP}%` }}
      >
        <Doorway />
      </div>

      {/* z-20 · a cortina, entre a cena e a luz */}
      <Curtain />

      {/*
        z-25 · o encontro com a seção seguinte.

        A base do feixe não alcança as bordas da tela, então sobram duas cunhas
        pretas nos cantos de baixo. Encostando direto no vermelho da seção
        seguinte, elas desenham uma linha reta atravessando a página — a troca
        fica seca. Este degradê acende o chão perto de quem olha até o vermelho
        cheio, e as duas seções passam a se encontrar sem aresta.
      */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-[25] h-[30%]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(255,26,18,0.35) 42%, rgba(255,26,18,0.85) 74%, var(--color-blood) 100%)",
        }}
      />

      {/* z-30 · o feixe */}
      <div aria-hidden className="feixe bg-blood absolute inset-0 z-30">
        <div
          className="absolute inset-0 opacity-25 mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='r'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23r)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* z-40 · o cartaz, deitado no plano do feixe */}
      <div
        className="absolute inset-x-0 bottom-0 z-40 flex justify-center"
        style={{
          // Começa bem abaixo do topo da luz: colado na porta o feixe é
          // estreito, e o texto sai apertado e pequeno. Mais para baixo há
          // largura sobrando, então as linhas podem crescer.
          height: "34%",
          // Perspectiva, ângulo e altura saíram de uma varredura que mediu, em
          // 320 combinações, quanto da largura da luz cada linha preenchia sem
          // vazar para o preto. No olho eu só alternava entre texto vazando e
          // texto encolhido até virar legenda.
          perspective: "180px",
          perspectiveOrigin: "50% 0%",
        }}
      >
        <div
          className="flex w-[80vw] items-end justify-center pb-[1vh] sm:w-[62vw]"
          style={{ transform: "rotateX(34deg)", transformOrigin: "50% 100%" }}
        >
          <h1 className="sr-only">
            {event.name} — festa de Halloween em {event.dateLabel}
          </h1>
          <MeltingPoster>
            <PosterLines />
          </MeltingPoster>
        </div>
      </div>

      {/*
        As duas formas do feixe ficam no mesmo <style> porque estilo inline
        venceria a regra do media query: no desktop a porta é mais estreita e o
        feixe precisa sair mais fechado.
      */}
      <style>{`
        .feixe { clip-path: ${beamPolygon(BEAM_MOBILE)}; }
        @media (min-width: 640px) {
          .feixe { clip-path: ${beamPolygon(BEAM_DESKTOP)}; }
        }
      `}</style>
    </section>
  );
}
