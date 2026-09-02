import { PosterWord } from "@/components/PosterWord";
import { event, shortDateLabel } from "@/config/event";

/**
 * O texto do cartaz, deitado no plano do feixe.
 *
 * Cada linha ocupa uma fatia diferente da largura do bloco, e é daí que vem o
 * contraste de tamanho: como a linha é esticada até a largura que recebe, a que
 * pega a faixa inteira fica grande e a que pega uma faixa curta fica pequena.
 * No cartaz de referência é assim — uma palavra domina e as outras acompanham,
 * em vez de todas crescerem no mesmo ritmo.
 *
 * As linhas ficam coladas umas nas outras, sem espaço entre elas: cada uma já
 * carrega a folga do acento dentro da própria caixa, e é o empilhamento apertado
 * que faz o conjunto virar uma massa preta em vez de quatro frases separadas.
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
 * E o celular precisa de larguras próprias porque essa diferença de ritmo entre
 * o bloco e o feixe muda com o formato da tela. Numa tela estreita e alta o
 * trapézio abre bem mais rápido, então as mesmas medidas do computador deixam a
 * linha de cima sobrando espaço enquanto a de baixo já aperta. Um número só não
 * atende os dois formatos: no celular as linhas de cima crescem e a última
 * encolhe, que é o contrário do que o computador pede.
 *
 * A data fica curta de propósito: "16/10" tem cinco caracteres, e esticá-la até
 * a largura do feixe a deixaria maior que o nome da festa. Aqui é a linha que
 * anuncia, não a que domina.
 */
const LINHAS = [
  { texto: shortDateLabel, familia: "heading", largura: 66, celular: 78 },
  { texto: event.name, familia: "display", largura: 91, celular: 107 },
  { texto: `a partir das ${event.timeLabel}`, familia: "heading", largura: 97, celular: 105 },
  { texto: "fantasia obrigatória", familia: "heading", largura: 104, celular: 100 },
] as const;

export function PosterLines() {
  return (
    <div className="flex w-full flex-col items-center gap-0">
      {LINHAS.map(({ texto, familia, largura, celular }) => (
        <div
          key={texto}
          data-linha
          className="linha-cartaz text-ink"
          style={
            {
              "--larg": `${largura}%`,
              "--larg-cel": `${celular}%`,
            } as React.CSSProperties
          }
        >
          <PosterWord familia={familia}>{texto}</PosterWord>
        </div>
      ))}

      <style>{`
        .linha-cartaz {
          width: var(--larg-cel);
        }

        @media (min-width: 640px) {
          .linha-cartaz {
            width: var(--larg);
          }
        }
      `}</style>
    </div>
  );
}
