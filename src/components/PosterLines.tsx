import { PosterWord } from "@/components/PosterWord";
import { brl } from "@/lib/format";
import { event } from "@/config/event";

/**
 * O texto do cartaz, empilhado dentro do feixe.
 *
 * Duas restrições mandam aqui:
 *
 * 1. Cada linha tem que caber na largura que o feixe tem naquela altura. Fora
 *    do vermelho o texto preto some no fundo — por isso as larguras crescem de
 *    cima para baixo, acompanhando a abertura.
 * 2. O nome vai embaixo, na parte larga. É onde ele pode ficar realmente
 *    grande, e é o que o cartaz de referência faz: a linha que domina não é a
 *    primeira, é a que pega a boca do feixe.
 *
 * Três linhas de propósito: numa tela deitada sobra bem menos altura entre a
 * base da porta e o pé da página do que num cartaz impresso em retrato.
 */
/*
 * As larguras são responsivas porque a proporção do feixe muda com a tela: no
 * celular a porta bate no mínimo em pixels e a luz abre larga, sobrando espaço;
 * no desktop ela é uma fatia estreita no meio de uma tela deitada. Um valor
 * único em vw deixaria o texto minúsculo num caso ou fora do vermelho no outro.
 */
const LINHAS = [
  {
    texto: `${event.dateLabel} · ${event.timeLabel}`,
    familia: "heading",
    largura: "w-[64vw] sm:w-[32vw]",
  },
  { texto: event.name, familia: "display", largura: "w-[86vw] sm:w-[44vw]" },
  {
    texto: `${brl(event.ticket.price)} · fantasia obrigatória`,
    familia: "heading",
    largura: "w-[94vw] sm:w-[58vw]",
  },
] as const;

export function PosterLines() {
  return (
    <div className="flex flex-col items-center gap-[0.8vw]">
      {LINHAS.map(({ texto, familia, largura }) => (
        <div key={texto} className={`text-ink ${largura}`}>
          <PosterWord familia={familia}>{texto}</PosterWord>
        </div>
      ))}
    </div>
  );
}
