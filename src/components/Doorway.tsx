import { DoorCrowd } from "@/components/DoorCrowd";

/**
 * A porta ao fundo: um retângulo vermelho recortado no preto, com a festa
 * acontecendo lá dentro.
 */
export function Doorway() {
  return (
    <div className="bg-blood relative h-full w-full overflow-hidden">
      <DoorCrowd />

      <style>{`
        .vulto {
          position: absolute;
          width: auto;
          background-size: contain;
          background-position: bottom center;
          background-repeat: no-repeat;
          transform-origin: 50% 100%;
          translate: -50% 0;
          animation-name: vulto-balanca;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }

        /* O balanço gira pelos pés, que é onde o corpo apoia — girar pelo
           centro faria os pés deslizarem no chão. */
        @keyframes vulto-balanca {
          from { transform: rotate(calc(var(--balanco) * -1)) scaleX(var(--espelho)); }
          to   { transform: rotate(var(--balanco)) scaleX(var(--espelho)); }
        }

        .garras {
          position: absolute;
          left: 50%;
          bottom: -4%;
          width: 64%;
          translate: -50% 0;
          background-size: contain;
          background-position: bottom center;
          background-repeat: no-repeat;
          transform-origin: 50% 100%;
          animation: garras-brinda 4.2s ease-in-out infinite alternate;
        }

        @keyframes garras-brinda {
          from { transform: rotate(-1.2deg) translateY(0); }
          to   { transform: rotate(1.2deg) translateY(-1.5%); }
        }

        .bola {
          transform-origin: 50% 20%;
          animation: bola-gira 9s ease-in-out infinite alternate;
        }

        @keyframes bola-gira {
          from { transform: translateX(-50%) rotate(-7deg); }
          to   { transform: translateX(-50%) rotate(7deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .vulto, .garras, .bola { animation: none; }
        }
      `}</style>
    </div>
  );
}
