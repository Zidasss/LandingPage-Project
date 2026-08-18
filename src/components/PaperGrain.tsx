/**
 * Textura de papel impresso sobre a página inteira.
 *
 * Dois detalhes que custaram para acertar, os dois medidos e não estimados:
 *
 * 1. O granulado usa `multiply`, e não `overlay`: multiply só escurece, então
 *    sobre preto puro ele desaparece e a textura aparece apenas onde há cor.
 * 2. A mistura vai no próprio elemento fixo, não num filho. `mix-blend-mode`
 *    mistura com o fundo dentro do mesmo contexto de empilhamento — num filho
 *    de um contêiner com z-index, não há fundo para misturar e o navegador cai
 *    no modo normal, pintando o ruído cinza por cima do preto.
 *
 * Com o erro no lugar, o preto da página media 47,47,47 em vez de 0,0,0.
 *
 * Decorativa — não intercepta cliques.
 */
export function PaperGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.35]"
      style={{
        mixBlendMode: "multiply",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
