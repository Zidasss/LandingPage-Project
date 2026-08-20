import { brl } from "@/lib/format";
import { event } from "@/config/event";

/**
 * Um mini-ingresso da Volvoween, para a parede de fundo.
 *
 * A forma de ingresso vem de dois detalhes: a linha de picote (uma coluna de
 * pontos) separando o canhoto, e as cantoneiras recortadas. O nome grande na
 * fonte de cartaz repete a identidade da festa; o canhoto traz data e valor.
 * Puramente decorativo — o ingresso que se preenche é o de destaque.
 */
export function Ticket({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-blood text-ink relative flex h-[9.5rem] w-[19rem] shrink-0 items-stretch overflow-hidden ${className}`}
      aria-hidden
    >
      {/* corpo: o nome */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <span className="font-heading text-[0.55rem] font-bold tracking-[0.3em] uppercase opacity-70">
          {event.dateLabel} · {event.timeLabel}
        </span>
        <span className="font-display -mb-1 text-[2.6rem] leading-none uppercase">
          {event.name}
        </span>
        <span className="font-heading text-[0.55rem] font-bold tracking-[0.25em] uppercase opacity-70">
          {event.venue.name} · {brl(event.ticket.price)}
        </span>
      </div>

      {/* picote */}
      <div
        className="my-2 w-px self-stretch"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, currentColor 0 4px, transparent 4px 9px)",
        }}
      />

      {/* canhoto */}
      <div className="flex w-14 items-center justify-center">
        <span className="font-heading rotate-180 text-[0.6rem] font-bold tracking-[0.35em] whitespace-nowrap uppercase [writing-mode:vertical-rl]">
          Admite 1
        </span>
      </div>

      {/* cantoneiras recortadas do picote */}
      <span className="bg-ink absolute top-[-7px] left-[calc(100%-3.5rem)] h-3.5 w-3.5 -translate-x-1/2 rounded-full" />
      <span className="bg-ink absolute bottom-[-7px] left-[calc(100%-3.5rem)] h-3.5 w-3.5 -translate-x-1/2 rounded-full" />
    </div>
  );
}
