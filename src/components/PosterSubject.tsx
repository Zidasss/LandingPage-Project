/**
 * O personagem central do cartaz.
 *
 * Enquanto a foto definitiva não chega, desenha uma silhueta de fantasma de
 * lençol em SVG — um marcador honesto de composição, não arte final. Quando
 * `src` for preenchido, a foto entra no lugar já em duotone (abóbora sobre
 * preto), aplicado por mistura de camadas em CSS.
 */
export function PosterSubject({ src }: { src?: string }) {
  if (src) {
    return (
      <div className="relative h-[34svh] w-auto max-w-[80vw] sm:h-[42svh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="h-full w-full object-contain grayscale contrast-125"
        />
        <div className="bg-pumpkin absolute inset-0 mix-blend-color" />
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 460 560"
      className="h-[34svh] w-auto max-w-[80vw] sm:h-[42svh]"
      role="img"
      aria-label="Espaço reservado para a imagem do cartaz"
    >
      <defs>
        <linearGradient id="lencol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-ember)" />
          <stop offset="65%" stopColor="var(--color-pumpkin)" />
          <stop offset="100%" stopColor="#9c3f00" />
        </linearGradient>
      </defs>

      {/* lençol */}
      <path
        d="M62 512 C62 236 58 44 230 44 C402 44 398 236 398 512
           C374 552 352 480 328 518 C304 556 282 484 258 520
           C234 556 212 484 188 520 C164 556 142 486 118 520
           C96 552 78 534 62 512 Z"
        fill="url(#lencol)"
      />
      {/* dobra lateral, para o lençol não ficar chapado */}
      <path
        d="M148 96 C112 168 100 320 108 508 C100 522 86 520 76 502
           C66 312 84 158 130 78 Z"
        fill="#ffffff"
        opacity="0.16"
      />
      {/* óculos escuros */}
      <g fill="var(--color-ink)">
        <rect x="140" y="232" width="82" height="50" rx="10" />
        <rect x="238" y="232" width="82" height="50" rx="10" />
        <rect x="214" y="248" width="32" height="10" rx="5" />
      </g>
      <g fill="#ffffff" opacity="0.35">
        <rect x="150" y="241" width="22" height="9" rx="4" />
        <rect x="248" y="241" width="22" height="9" rx="4" />
      </g>
    </svg>
  );
}
