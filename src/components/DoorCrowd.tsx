import { DiscoBall } from "@/components/DiscoBall";
import { event } from "@/config/event";

/**
 * A festa vista pelo vão da porta.
 *
 * A cena repete a estrutura do cartaz de referência: bola de espelhos no alto,
 * os vultos na pista ao fundo e, cortadas na borda de baixo, as garras
 * brindando em primeiro plano.
 *
 * A profundidade vem do tamanho e da altura em que cada vulto pisa: quem está
 * mais atrás é menor e pisa mais alto. E cada um balança no seu próprio compasso
 * — em compasso único, um grupo parece bandeira ao vento, não gente dançando.
 *
 * Os valores são fixos, e não sorteados: sorteio no render faria servidor e
 * navegador desenharem coisas diferentes.
 */

type Vulto = {
  /** Índice em event.crowd.figures. */
  arte: number;
  /** Altura, em % da altura da porta. */
  altura: number;
  /** Posição horizontal do centro, em % da largura da porta. */
  x: number;
  /** Onde os pés pisam, em % da altura da porta. */
  chao: number;
  /** Duração do balanço. */
  ritmo: number;
  /** Defasagem, para ninguém dançar junto. */
  atraso: number;
  /** Amplitude do balanço, em graus. */
  balanco: number;
  espelhado?: boolean;
};

/*
 * Quatro figuras, e não mais: a porta tem menos de 200px de largura na tela, e
 * amontoar vultos ali vira mancha preta. Nesse tamanho o que se lê é a
 * silhueta inteira, não o detalhe — por isso as poses mais reconhecíveis (o
 * chapéu da bruxa, o zumbi de perfil) ficam à frente.
 */
const PISTA: Vulto[] = [
  { arte: 0, altura: 19, x: 17, chao: 62, ritmo: 3.1, atraso: 0, balanco: 2.4 },
  { arte: 2, altura: 20, x: 83, chao: 63, ritmo: 2.6, atraso: 0.7, balanco: 3, espelhado: true },
  { arte: 3, altura: 23, x: 62, chao: 72, ritmo: 2.9, atraso: 1.3, balanco: 3.2, espelhado: true },
  { arte: 1, altura: 24, x: 33, chao: 76, ritmo: 2.3, atraso: 1.7, balanco: 3.6 },
];

export function DoorCrowd() {
  return (
    <div aria-hidden className="pista absolute inset-0 overflow-hidden">
      <DiscoBall className="bola text-ink absolute left-1/2 top-[5%] h-[34%] -translate-x-1/2" />

      {PISTA.map((v, i) => (
        <span
          key={i}
          className="vulto"
          style={
            {
              height: `${v.altura}%`,
              left: `${v.x}%`,
              bottom: `${100 - v.chao}%`,
              // a proporção vem do recorte, para o vulto não sair esmagado
              aspectRatio: `${event.crowd.figures[v.arte].w} / ${event.crowd.figures[v.arte].h}`,
              backgroundImage: `url(${event.crowd.figures[v.arte].src})`,
              animationDuration: `${v.ritmo}s`,
              animationDelay: `${v.atraso}s`,
              "--balanco": `${v.balanco}deg`,
              "--espelho": v.espelhado ? -1 : 1,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Primeiro plano: cortado na borda de baixo, é o que dá a sensação de
          estar espiando por cima do ombro de alguém. */}
      <span
        className="garras"
        style={{
          aspectRatio: `${event.crowd.foreground.w} / ${event.crowd.foreground.h}`,
          backgroundImage: `url(${event.crowd.foreground.src})`,
        }}
      />

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
