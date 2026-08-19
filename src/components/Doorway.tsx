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

        /*
          As garras entram pela quina de baixo, e não pelo meio: braço que
          nasce no centro da porta parece flutuando. Encostado na quina, ele lê
          como alguém à frente de quem olha, fora do quadro. Vão à direita
          porque a multidão já pesa para a esquerda.
        */
        .garras {
          position: absolute;
          right: -8%;
          bottom: -6%;
          width: 70%;
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

        /*
          Só a rotação entra aqui. O Tailwind v4 centraliza pela propriedade
          "translate", que é independente de "transform" — repetir o
          deslocamento no keyframe somava os dois, e a bola andava 100% para a
          esquerda em vez de 50%, saindo pela borda da porta.

          Balanço curto de propósito: com amplitude grande a bola passa longe do
          eixo e deixa de ler como centrada, mesmo estando.
        */
        @keyframes bola-gira {
          from { transform: rotate(-3.5deg); }
          to   { transform: rotate(3.5deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .vulto, .garras, .bola { animation: none; }
        }
      `}</style>
    </div>
  );
}
