import { event } from "@/config/event";

/**
 * A porta ao fundo: um retângulo vermelho recortado no preto, com o painel
 * de personagens dentro. É a origem do feixe — a base dela é exatamente onde
 * o trapézio começa.
 */
export function Doorway() {
  return (
    <div className="bg-blood relative h-full w-full overflow-hidden">
      {event.hero.silhouettes ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.hero.silhouettes}
          alt="Silhuetas de convidados fantasiados"
          className="h-full w-full object-cover object-bottom"
        />
      ) : (
        <div className="border-ink/40 flex h-full w-full items-center justify-center border border-dashed p-4">
          <p className="text-ink text-center text-[0.6rem] leading-tight font-bold tracking-[0.12em] uppercase">
            painel das
            <br />
            silhuetas
          </p>
        </div>
      )}
    </div>
  );
}
