/**
 * Uma linha de texto esticada até encostar nas bordas do seu container.
 *
 * Tamanho em vw não serve: cada linha tem um número diferente de letras, então
 * o mesmo font-size produz larguras diferentes e nada se alinha. Em SVG,
 * `textLength` com `lengthAdjust="spacingAndGlyphs"` estica as letras até a
 * largura exata pedida — a linha passa a ser medida pela caixa, não pelo texto.
 *
 * A altura da caixa sai da contagem de letras, e não de um valor fixo: para a
 * mesma largura, linha curta fica alta e linha longa fica baixa. É o que o
 * cartaz de referência faz — uma linha de três palavras domina, e a linha de
 * recado embaixo é uma tarja fina. Proporção fixa achataria as duas por igual.
 */

/** Largura média da letra, em relação à altura, em cada família. */
const PROPORCAO = { display: 0.56, heading: 0.6 } as const;

/**
 * O quanto a linha cresce na vertical além do que a proporção pediria.
 *
 * Existe por causa da perspectiva: o bloco é deitado no plano do feixe com uma
 * rotação de 34°, e isso achata a altura em cerca de 17% antes de a letra
 * chegar à tela. Sem compensar, o texto sai mais baixo do que foi desenhado e o
 * cartaz lê como uma etiqueta esticada em vez de tipografia de cartaz.
 *
 * A compensação é um pouco maior que o achatamento — letra de cartaz é alta de
 * propósito, e é a altura que dá o peso.
 */
const ESTICA = 1.28;

export function PosterWord({
  children,
  familia = "display",
  className = "",
}: {
  children: string;
  familia?: keyof typeof PROPORCAO;
  className?: string;
}) {
  const texto = children.toUpperCase();
  const altura = (1000 * ESTICA) / (PROPORCAO[familia] * Math.max(texto.length, 3));
  // O SVG recorta no viewBox. Sem folga, acento de maiúscula (Ó, Ç) e vírgula
  // ficam de fora — a caixa é calculada pela altura das maiúsculas, e eles
  // passam disso. A folga entra na caixa mas não no cálculo da proporção.
  const caixa = altura * 1.2;

  return (
    <svg
      viewBox={`0 0 1000 ${caixa.toFixed(1)}`}
      className={`block w-full ${className}`}
      aria-hidden
    >
      <text
        x="0"
        y={(caixa * 0.82).toFixed(1)}
        textLength="1000"
        lengthAdjust="spacingAndGlyphs"
        fontFamily={
          familia === "display" ? "var(--font-poster)" : "var(--font-grotesk)"
        }
        fontSize={(altura * 1.3).toFixed(1)}
        fontWeight={familia === "display" ? 400 : 700}
        fill="currentColor"
      >
        {texto}
      </text>
    </svg>
  );
}
