/**
 * A bola de espelhos pendurada no alto da porta.
 *
 * Geometria pura, desenhada em SVG: círculo, grade de facetas e brilhos. É o
 * tipo de forma que sai limpa em código — e, sendo código, ela gira de verdade
 * em vez de ser um desenho parado.
 */
export function DiscoBall({ className = "" }: { className?: string }) {
  /** Linhas horizontais da grade, achatando em direção aos polos. */
  const paralelos = [-0.72, -0.42, -0.14, 0.14, 0.42, 0.72];
  /** Linhas verticais, estreitando em direção às bordas. */
  const meridianos = [-0.78, -0.5, -0.2, 0.2, 0.5, 0.78];

  return (
    <svg viewBox="0 0 100 128" className={className} aria-hidden>
      {/* fio */}
      <line x1="50" y1="0" x2="50" y2="26" stroke="currentColor" strokeWidth="1.6" />
      <rect x="46" y="24" width="8" height="5" fill="currentColor" />

      <g stroke="currentColor" strokeWidth="1.4" fill="none">
        <circle cx="50" cy="72" r="34" strokeWidth="2.4" />
        {paralelos.map((t) => (
          <ellipse key={t} cx="50" cy={72 + t * 34} rx={34 * Math.sqrt(1 - t * t)} ry="3.4" />
        ))}
        {meridianos.map((t) => (
          <ellipse key={t} cx="50" cy="72" rx={34 * Math.abs(t)} ry="34" />
        ))}
      </g>

      {/* brilhos: quatro pontas, como no cartaz */}
      <g fill="currentColor">
        <path d="M14 34 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6 z" />
        <path d="M86 28 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
        <path d="M80 108 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" />
      </g>
    </svg>
  );
}
