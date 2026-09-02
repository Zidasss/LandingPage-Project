"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  acompanharVisibilidade,
  alternar,
  assinar,
  estadoDoSom,
  ligar,
  queriaSom,
} from "@/lib/som";

/**
 * O botão de som.
 *
 * Ele mostra **três** estados, e não dois, porque "ligado" e "tocando" não são
 * a mesma coisa. Nenhum navegador deixa um site tocar áudio sozinho no primeiro
 * acesso: Chrome, Safari e Firefox exigem um gesto de verdade — clique, toque,
 * tecla —, e rolar a página não conta. Entre abrir o site e encostar em alguma
 * coisa, o som está ligado e mudo ao mesmo tempo.
 *
 * Mostrar "som" nesse intervalo era mentir justamente para quem estava
 * procurando o motivo de não ouvir nada. Agora o botão pede o que falta: um
 * toque. Ele pisca devagar enquanto isso, e para de piscar quando o som sai.
 */
export function SoundToggle() {
  /*
    O estado mora no módulo, não aqui: ele muda a partir do laço da rolagem, da
    troca de aba e do próprio navegador liberando o áudio — tudo fora de
    qualquer componente. No servidor a resposta é sempre "mudo", que é como o
    som de fato começa, então a hidratação bate.
  */
  const estado = useSyncExternalStore(assinar, estadoDoSom, () => "mudo");

  useEffect(() => acompanharVisibilidade(), []);

  /*
    O site nasce com o som ligado, e a música fica armada esperando o gesto.

    Tentar ligar de cara não é desperdício mesmo bloqueado: o contexto de áudio
    nasce junto e os arquivos começam a baixar, então quando o gesto vem o som
    já está pronto — sem o atraso de baixar dois megabytes na hora.

    Roda uma vez só, na montagem. Com o estado do som nas dependências, o
    próprio `ligar` daqui refazia o efeito e removia os ouvintes antes de
    qualquer gesto acontecer — o som nunca destravava.
  */
  useEffect(() => {
    if (!queriaSom()) return;
    ligar();

    // Chamar `ligar` de novo é inofensivo: ele só retoma o que já existe. O que
    // importa é que desta vez a chamada acontece dentro de um gesto.
    const destravar = () => {
      if (queriaSom()) ligar();
      remover();
    };
    const eventos = ["pointerdown", "keydown", "touchstart"] as const;
    const remover = () => {
      for (const ev of eventos) window.removeEventListener(ev, destravar);
    };
    for (const ev of eventos) {
      window.addEventListener(ev, destravar, { once: true, passive: true });
    }
    return remover;
  }, []);

  const rotulo =
    estado === "tocando"
      ? "Desligar o som"
      : estado === "travado"
        ? "Tocar o som — o navegador espera um toque"
        : "Ligar o som";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={estado === "tocando"}
      aria-label={rotulo}
      title={rotulo}
      data-estado={estado}
      className="som-botao font-heading fixed top-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2 text-[0.58rem] font-bold tracking-[0.22em] uppercase"
    >
      <Onda estado={estado} />
      <span className="hidden sm:inline">
        {estado === "tocando" ? "som" : estado === "travado" ? "tocar" : "mudo"}
      </span>

      <style>{`
        /*
          Adesivo torto, e não botão de sistema.

          O site inteiro é impresso — ingresso, cartaz, carimbo — e o controle
          de som era o único elemento com cara de barra de ferramentas: caixa
          cinza, canto reto, alinhada ao pixel. Aqui ele vira um adesivo colado
          meio torto no canto, na mesma linguagem do resto.

          A inclinação é pequena de propósito: torto o bastante para parecer
          colado à mão, reto o bastante para ninguém achar que quebrou.
        */
        .som-botao {
          background: var(--color-bone);
          color: var(--color-ink);
          transform: rotate(-2.5deg);
          box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.45);
          transition:
            transform 180ms cubic-bezier(0.2, 0.8, 0.3, 1),
            background-color 180ms ease,
            color 180ms ease;
        }

        .som-botao:hover {
          transform: rotate(-2.5deg) translateY(-2px) scale(1.03);
        }

        /* Apertado, o adesivo afunda: o deslocamento vai junto com a sombra. */
        .som-botao:active {
          transform: rotate(-2.5deg) translate(2px, 2px);
          box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.45);
        }

        /*
          Mudo é o estado apagado: o adesivo perde a cor e fica de canto, sem
          disputar atenção com a cena.
        */
        .som-botao[data-estado="mudo"] {
          background: transparent;
          color: color-mix(in srgb, var(--color-bone) 55%, transparent);
          box-shadow: none;
          outline: 1px solid color-mix(in srgb, var(--color-bone) 30%, transparent);
        }

        /*
          Travado é o único estado que pede alguma coisa, então é o único que
          pulsa — em vermelho, que aqui é a cor de "olha para mim". Nos outros o
          botão só informa, e pulsar sem precisar vira ruído na tela.
        */
        .som-botao[data-estado="travado"] {
          background: var(--color-blood);
          color: var(--color-ink);
          animation: som-chama 1500ms ease-in-out infinite;
        }

        @keyframes som-chama {
          0%, 100% { transform: rotate(-2.5deg) scale(1); }
          50% { transform: rotate(-2.5deg) scale(1.07); }
        }

        @media (prefers-reduced-motion: reduce) {
          .som-botao[data-estado="travado"] { animation: none; }
        }
      `}</style>
    </button>
  );
}

/** O ícone: um alto-falante, com as ondas só quando há som saindo de verdade. */
function Onda({ estado }: { estado: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
      {estado === "tocando" ? (
        <>
          <path d="M16.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 6a8.5 8.5 0 0 1 0 12" />
        </>
      ) : estado === "travado" ? (
        // Travado mostra o triângulo de "tocar": é o que falta acontecer.
        <path d="M17 8.5l5 3.5-5 3.5z" fill="currentColor" stroke="none" />
      ) : (
        <path d="M17 9.5l5 5m0-5l-5 5" />
      )}
    </svg>
  );
}
