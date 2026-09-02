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
      className="som-botao font-heading border-bone/25 bg-ink/70 text-bone hover:border-blood hover:text-blood fixed top-4 right-4 z-50 flex items-center gap-2 border px-3 py-2 text-[0.55rem] font-bold tracking-[0.25em] uppercase backdrop-blur-sm transition-colors"
    >
      <Onda estado={estado} />
      <span className="hidden sm:inline">
        {estado === "tocando" ? "som" : estado === "travado" ? "tocar" : "mudo"}
      </span>

      <style>{`
        /*
          Só o estado travado pisca. É o único em que o botão está pedindo
          alguma coisa — nos outros dois ele apenas informa, e um botão que
          pulsa sem precisar de nada vira ruído na tela.
        */
        .som-botao[data-estado="travado"] {
          border-color: var(--color-blood);
          color: var(--color-blood);
          animation: som-chama 1600ms ease-in-out infinite;
        }

        @keyframes som-chama {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
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
