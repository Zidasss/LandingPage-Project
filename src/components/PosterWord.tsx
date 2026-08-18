/**
 * O nome da festa, esticado até encostar nas duas margens.
 *
 * Um font-size fixo nunca preenche a largura exata — depende de quantas
 * letras a palavra tem e da tela. Aqui o texto vai em SVG com `textLength`
 * igual à largura toda e `lengthAdjust="spacingAndGlyphs"`, então o navegador
 * estica as letras até as bordas em qualquer tamanho de tela.
 */
export function PosterWord({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 1000 250" className={`block w-full ${className}`} aria-hidden>
      <text
        x="0"
        y="196"
        textLength="1000"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-poster)"
        fontSize="240"
        fill="currentColor"
      >
        {children.toUpperCase()}
      </text>
    </svg>
  );
}
