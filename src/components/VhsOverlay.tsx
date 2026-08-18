/**
 * Camada fixa acima de tudo que dá a textura de fita VHS gasta:
 * linhas de varredura, granulado, uma faixa de tracking que desce
 * lentamente e uma vinheta escura nas bordas.
 * Puramente decorativa — não intercepta cliques.
 */
export function VhsOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* linhas de varredura */}
      <div
        className="absolute inset-0 opacity-[0.28] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 1px, transparent 1px, transparent 3px)",
        }}
      />
      {/* granulado */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />
      {/* faixa de tracking */}
      <div className="animate-scan absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
      {/* vinheta */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(5,4,10,0.55) 100%)",
        }}
      />
    </div>
  );
}
