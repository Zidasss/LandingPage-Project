import { PosterWord } from "@/components/PosterWord";
import { brl } from "@/lib/format";
import { event } from "@/config/event";

/**
 * O texto do cartaz, deitado no plano do feixe.
 *
 * As linhas têm todas a mesma largura aqui dentro; quem produz o trapézio é a
 * perspectiva aplicada pelo componente de fora. Assim o bloco de texto converge
 * no mesmo ritmo do feixe, sem eu precisar acertar largura por largura — e é o
 * que faz o texto parecer pintado no chão, e não empilhado por cima dele.
 */
const LINHAS = [
  { texto: "Halloween", familia: "heading" },
  { texto: `${event.dateLabel} · ${event.timeLabel}`, familia: "heading" },
  { texto: event.name, familia: "display" },
  { texto: event.venue.name, familia: "heading" },
  { texto: `${brl(event.ticket.price)} · fantasia obrigatória`, familia: "heading" },
] as const;

export function PosterLines() {
  return (
    <div className="flex w-full flex-col items-center gap-[0.4vw]">
      {LINHAS.map(({ texto, familia }) => (
        <div key={texto} className="text-ink w-full">
          <PosterWord familia={familia}>{texto}</PosterWord>
        </div>
      ))}
    </div>
  );
}
