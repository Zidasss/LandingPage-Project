/**
 * Textura de papel impresso sobre a página inteira: granulado fino e uma
 * vinheta discreta. É o que tira o aspecto "tela" e dá o aspecto "cartaz".
 * Decorativa — não intercepta cliques.
 */
export function PaperGrain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </div>
  );
}
