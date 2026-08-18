import { Doorway } from "@/components/Doorway";
import { Floor } from "@/components/Floor";
import { PosterLines } from "@/components/PosterLines";
import { WalkIn } from "@/components/WalkIn";
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
 * A cena inteira, cartaz incluído, fica dentro do WalkIn: ao rolar, tudo se
 * aproxima junto, como se a pessoa desse alguns passos até a porta. O cartaz
 * está pintado no mesmo chão — se ficasse de fora, descolaria da cena.
 */
export function DoorHero() {
  return (
    <section className="bg-ink relative h-svh overflow-hidden">
      <WalkIn>
        {/* chão em perspectiva, com o ponto de fuga na porta */}
        <div className="text-blood/45 absolute inset-0">
          <Floor />
        </div>

        {/* a porta */}
        <div
          className="absolute left-1/2 w-[40vw] -translate-x-1/2 sm:w-[22vw]"
          style={{ top: `${DOOR_TOP}%`, height: `${DOOR_BOTTOM - DOOR_TOP}%` }}
        >
          <Doorway />
        </div>

        {/* o feixe */}
        <div aria-hidden className="feixe bg-blood absolute inset-0">
          <div
            className="absolute inset-0 opacity-25 mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='r'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23r)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>
        {/* o cartaz, deitado no plano do feixe */}
        <div
          className="absolute inset-x-0 bottom-0 flex justify-center"
          style={{
            // Começa bem abaixo do topo da luz: colado na porta o feixe é
            // estreito, e o texto sai apertado e pequeno. Mais para baixo há
            // largura sobrando, então as linhas podem crescer.
            height: "34%",
            perspective: "180px",
            perspectiveOrigin: "50% 0%",
            // Perspectiva, ângulo e altura saíram de uma varredura que mediu, em
            // 320 combinações, quanto da largura da luz cada linha preenchia sem
            // vazar para o preto. No olho eu só alternava entre texto vazando e
            // texto encolhido até virar legenda.
          }}
        >
          <div
            className="flex w-[80vw] items-end justify-center pb-[1vh] sm:w-[62vw]"
            style={{ transform: "rotateX(34deg)", transformOrigin: "50% 100%" }}
          >
            <h1 className="sr-only">
              {event.name} — festa de Halloween em {event.dateLabel}
            </h1>
            <PosterLines />
          </div>
        </div>
      </WalkIn>

      {/*
        As duas formas ficam no mesmo <style> porque estilo inline venceria a
        regra do media query: no desktop a porta é mais estreita e o feixe
        precisa sair mais fechado.
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
