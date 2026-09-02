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
 *
 * Passar de 100 é permitido, e necessário. O bloco é um retângulo em
 * perspectiva, mas o feixe é um trapézio que abre mais rápido do que ele: as
 * linhas de baixo têm mais luz para preencher do que as de cima, e travar todas
 * em 100 deixava justamente as maiores sobrando espaço dos dois lados. Medido, o
 * texto ocupava de 40% a 72% da largura do feixe.
 *
 * "Halloween" continua curta de propósito: é a chamada que anuncia o nome, e se
 * ela crescer junto some a hierarquia — o cartaz vira sete linhas do mesmo peso.
 */
const LINHAS = [
  { texto: "Halloween", familia: "heading", largura: 62 },
  { texto: event.dateLabel, familia: "heading", largura: 90 },
  { texto: event.name, familia: "display", largura: 95 },
  { texto: `a partir das ${event.timeLabel}`, familia: "heading", largura: 100 },
  { texto: event.venue.name, familia: "heading", largura: 104 },
  { texto: brl(event.ticket.price), familia: "display", largura: 88 },
  { texto: "fantasia obrigatória", familia: "heading", largura: 118 },
] as const;

export function PosterLines() {
  return (
    <div className="flex w-full flex-col items-center gap-[0.5vw]">
      {LINHAS.map(({ texto, familia, largura }) => (
        <div
          key={texto}
          data-linha
          className="text-ink"
          style={{ width: `${largura}%` }}
        >
          <PosterWord familia={familia}>{texto}</PosterWord>
        </div>
      ))}
    </div>
  );
}
