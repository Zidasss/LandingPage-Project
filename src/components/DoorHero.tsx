import { Doorway } from "@/components/Doorway";
import { GrowingBeam } from "@/components/GrowingBeam";
import { Floor } from "@/components/Floor";
import { MeltingPoster } from "@/components/MeltingPoster";
import { PosterLines } from "@/components/PosterLines";
import {
  beamPolygon,
  BEAM_DESKTOP,
  BEAM_MOBILE,
  BEAM_TOP,
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
 * A transição é a própria luz: ao rolar, o feixe abre até cobrir toda a largura
 * abaixo da porta e encostar na seção seguinte, que já é vermelha — a luz vira
 * o fundo dela. Enquanto isso o cartaz derrete e escorre para fora, para as
 * letras não ficarem perdidas sobre o vermelho depois que a cena acabar.
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

      {/* z-30 · o feixe, que cresce até virar o fundo da seção seguinte */}
      <GrowingBeam origemY={BEAM_TOP}>
        {/*
          Sem granulado próprio: o grão da página já cobre tudo, e uma segunda
          camada só aqui deixava a luz num tom levemente diferente do vermelho
          da seção seguinte — o que reabria uma emenda visível entre as duas.
        */}
        <div aria-hidden className="feixe bg-blood absolute inset-0" />
      </GrowingBeam>

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
