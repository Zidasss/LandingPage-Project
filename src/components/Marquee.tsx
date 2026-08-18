/**
 * Faixa de texto que atravessa a tela em loop, como tarja de cartaz de show.
 * O conteúdo é duplicado e a animação desloca exatamente 50% — por isso a
 * emenda entre a primeira e a segunda cópia é invisível.
 */
export function Marquee({
  items,
  className = "",
  slow = false,
  reverse = false,
}: {
  items: string[];
  className?: string;
  slow?: boolean;
  reverse?: boolean;
}) {
  const strip = [...items, ...items];

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`flex w-max ${slow ? "animate-marquee-slow" : "animate-marquee"}`}
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {strip.map((item, i) => (
          <span
            key={i}
            aria-hidden={i >= items.length}
            className="flex shrink-0 items-center gap-6 px-6"
          >
            {item}
            <span className="text-[0.6em] opacity-60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
