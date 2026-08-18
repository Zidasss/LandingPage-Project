/**
 * Palavra gigante que sangra de margem a margem.
 *
 * Um font-size fixo nunca preenche a largura exata — sobra ou falta espaço
 * conforme a palavra e a tela. Aqui o texto vai em SVG com `textLength` igual
 * à largura toda e `lengthAdjust="spacingAndGlyphs"`, então o navegador estica
 * as letras até encostarem nas duas bordas, em qualquer tamanho de tela.
 */
export function PosterWord({
  children,
  label,
  className = "",
}: {
  children: string;
  /** Texto lido por leitores de tela, quando a palavra sozinha não basta. */
  label?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1000 196"
      className={`block w-full ${className}`}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <text
        x="0"
        y="180"
        textLength="1000"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-poster)"
        fontSize="226"
        fill="currentColor"
      >
        {children.toUpperCase()}
      </text>
    </svg>
  );
}
