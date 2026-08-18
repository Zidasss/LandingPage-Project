import { PosterWord } from "@/components/PosterWord";
import { brl } from "@/lib/format";
import { event } from "@/config/event";

/**
 * O texto do cartaz, deitado no plano do feixe.
 *
 * Cada linha ocupa uma fatia diferente da largura do bloco, e é daí que vem o
 * contraste de tamanho: como a linha é esticada até a largura que recebe, a que
 * pega a faixa inteira fica grande e a que pega uma faixa curta fica pequena.
 * No cartaz de referência é assim — uma palavra domina e as outras acompanham,
 * em vez de todas crescerem no mesmo ritmo.
 *
 * A perspectiva de fora é que produz o trapézio; aqui as larguras são relativas
 * ao bloco, não à tela.
 */
const LINHAS = [
  { texto: "Halloween", familia: "heading", largura: 58 },
  { texto: event.dateLabel, familia: "heading", largura: 76 },
  { texto: event.name, familia: "display", largura: 100 },
  { texto: `a partir das ${event.timeLabel}`, familia: "heading", largura: 70 },
  { texto: event.venue.name, familia: "heading", largura: 92 },
  { texto: brl(event.ticket.price), familia: "display", largura: 62 },
  { texto: "fantasia obrigatória", familia: "heading", largura: 100 },
] as const;

export function PosterLines() {
  return (
    <div className="flex w-full flex-col items-center gap-[0.5vw]">
      {LINHAS.map(({ texto, familia, largura }) => (
        <div key={texto} className="text-ink" style={{ width: `${largura}%` }}>
          <PosterWord familia={familia}>{texto}</PosterWord>
        </div>
      ))}
    </div>
  );
}
