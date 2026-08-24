import { Doorway } from "@/components/Doorway";
import { MeltingPoster } from "@/components/MeltingPoster";
import { PosterLines } from "@/components/PosterLines";
import {
  beamPolygon,
  BEAM_DESKTOP,
  BEAM_MOBILE,
  DOOR_BOTTOM,
  DOOR_RATIO,
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
 * A luz não é desenhada aqui: ela é fixa na tela e mora fora do hero, atrás do
 * conteúdo da página inteira — só assim o vermelho que aparece durante a
 * rolagem é a própria luz, e não um segundo bloco pintado pela seção seguinte.
 * Este componente cuida do quarto: chão, porta e o cartaz por cima da luz.
 */
export function DoorHero() {
  return (
    <section data-hero className="bg-ink relative h-svh overflow-hidden">
      {/* z-10 · a porta */}
      <div
        data-porta
        className="absolute left-1/2 z-10 -translate-x-1/2"
        style={{
          top: `${DOOR_TOP}%`,
          height: `${DOOR_BOTTOM - DOOR_TOP}%`,
          /*
            A largura sai da altura, e não da largura da tela: assim a porta
            mantém proporção de porta em qualquer formato de janela. O limite em
            vw existe só para telas muito estreitas, onde 
            uma porta proporcional ficaria maior que a tela.
          */
          width: `min(46vw, ${(DOOR_BOTTOM - DOOR_TOP) / DOOR_RATIO}svh)`,
        }}
      >
        <Doorway />
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
          /*
            A largura tem teto em svh pelo mesmo motivo da porta: a luz nasce da
            largura da porta, que agora vem da altura da janela. Numa janela
            baixa a porta fica estreita, o topo do feixe também, e um bloco
            medido só em vw jogava as primeiras linhas para fora da luz — onde
            texto preto some no fundo. Conferido medindo em celular, notebook,
            monitor largo e janela baixa.
          */
          className="flex w-[min(80vw,56svh)] items-end justify-center pb-[1vh] sm:w-[min(48vw,72svh)]"
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
