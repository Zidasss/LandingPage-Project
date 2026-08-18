/**
 * Fundo do hero: sol retrô listrado + grade em perspectiva sumindo no horizonte.
 * Tudo em CSS/SVG, sem imagem — carrega instantâneo e escala em qualquer tela.
 */
export function SynthGrid() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* céu */}
      <div className="from-void via-crypt to-void absolute inset-0 bg-gradient-to-b" />

      {/* sol */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 sm:top-[20%]">
        <div
          className="animate-pulse-glow h-44 w-44 rounded-full opacity-80 blur-[2px] sm:h-72 sm:w-72"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-pumpkin) 0%, var(--color-magenta) 55%, #7a1a6b 100%)",
            maskImage:
              "repeating-linear-gradient(to bottom, black 0 14px, transparent 14px 18px), linear-gradient(to bottom, black 55%, transparent 92%)",
            maskComposite: "intersect",
            WebkitMaskImage:
              "repeating-linear-gradient(to bottom, black 0 14px, transparent 14px 18px), linear-gradient(to bottom, black 55%, transparent 92%)",
            WebkitMaskComposite: "source-in",
          }}
        />
        <div className="bg-magenta/25 absolute inset-0 -z-10 scale-150 rounded-full blur-3xl" />
      </div>

      {/* horizonte */}
      <div className="via-cyan/70 absolute inset-x-0 bottom-[32%] h-px bg-gradient-to-r from-transparent to-transparent" />

      {/* grade em perspectiva */}
      <div
        className="absolute inset-x-0 bottom-0 h-[32%] opacity-60"
        style={{
          perspective: "220px",
          perspectiveOrigin: "50% 0%",
        }}
      >
        <div
          className="h-[300%] w-full origin-top"
          style={{
            transform: "rotateX(72deg)",
            backgroundImage:
              "linear-gradient(to right, color-mix(in srgb, var(--color-cyan) 45%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-magenta) 40%, transparent) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* névoa baixa */}
      <div className="from-void absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent" />
    </div>
  );
}
