import { DOOR_BOTTOM } from "@/lib/beam";

/**
 * Chão em perspectiva. As linhas partem todas do centro da porta, então o
 * ponto de fuga do chão e a origem do feixe são o mesmo lugar — sem isso a
 * cena parece dois desenhos colados.
 */
export function Floor() {
  const raios = Array.from({ length: 17 }, (_, i) => {
    const t = i / 16;
    return { x: -60 + t * 220, key: i };
  });

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
    >
      <g stroke="currentColor" strokeWidth="0.12" opacity="0.5">
        {raios.map(({ x, key }) => (
          <line key={key} x1="50" y1={DOOR_BOTTOM} x2={x} y2="100" />
        ))}
      </g>
      {/* travessas: mais juntas perto do horizonte, abrindo em direção a quem olha */}
      <g stroke="currentColor" strokeWidth="0.1" opacity="0.32">
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i + 1) / 10;
          const y = DOOR_BOTTOM + (100 - DOOR_BOTTOM) * t ** 2.1;
          return <line key={i} x1="0" y1={y} x2="100" y2={y} />;
        })}
      </g>
    </svg>
  );
}
