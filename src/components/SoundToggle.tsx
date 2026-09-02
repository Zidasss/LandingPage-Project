"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  acompanharVisibilidade,
  alternar,
  assinar,
  estaLigado,
  ligar,
  queriaSom,
} from "@/lib/som";

/**
 * O botão de som.
 *
 * Ele não é um enfeite de acessibilidade: é a peça que faz o som existir. O
 * navegador só libera áudio depois de um gesto de verdade, e rolar a página não
 * é um. O clique aqui é esse gesto — sem ele o rangido da porta seria disparado
 * e engolido em silêncio.
 *
 * Começa desligado, sempre. Som que começa sozinho num site é o motivo número um
 * de alguém fechar a aba correndo.
 */
export function SoundToggle() {
  /*
    O estado do som mora no módulo, não aqui: ele muda a partir do laço da
    rolagem e da troca de aba, fora de qualquer componente. `useSyncExternalStore`
    é o jeito de o React ler esse estado sem o componente virar dono dele — e
    resolve a hidratação de brinde, porque o servidor sempre responde "mudo",
    que é como o som de fato começa.
  */
  const ligado = useSyncExternalStore(assinar, estaLigado, () => false);

  useEffect(() => acompanharVisibilidade(), []);

  /*
    Quem já tinha ligado o som numa visita anterior não deveria precisar ligar
    de novo — mas o navegador continua exigindo um gesto, e recarregar a página
    não é um. Então a preferência fica armada: o primeiro clique, toque ou tecla
    em qualquer lugar destrava o áudio, uma vez só.
  */
  useEffect(() => {
    if (ligado || !queriaSom()) return;

    const destravar = () => {
      ligar();
      remover();
    };
    const remover = () => {
      for (const ev of ["pointerdown", "keydown", "touchstart"] as const) {
        window.removeEventListener(ev, destravar);
      }
    };
    for (const ev of ["pointerdown", "keydown", "touchstart"] as const) {
      window.addEventListener(ev, destravar, { once: true, passive: true });
    }
    return remover;
  }, [ligado]);

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={ligado}
      aria-label={ligado ? "Desligar o som" : "Ligar o som"}
      title={ligado ? "Desligar o som" : "Ligar o som"}
      className="font-heading border-bone/25 bg-ink/70 text-bone hover:border-blood hover:text-blood fixed top-4 right-4 z-50 flex items-center gap-2 border px-3 py-2 text-[0.55rem] font-bold tracking-[0.25em] uppercase backdrop-blur-sm transition-colors"
    >
      <Onda ligado={ligado} />
      <span className="hidden sm:inline">{ligado ? "som" : "mudo"}</span>
    </button>
  );
}

/** O ícone: um alto-falante, com as ondas só quando há som saindo. */
function Onda({ ligado }: { ligado: boolean }) {
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
      {ligado ? (
        <>
          <path d="M16.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 6a8.5 8.5 0 0 1 0 12" />
        </>
      ) : (
        <path d="M17 9.5l5 5m0-5l-5 5" />
      )}
    </svg>
  );
}
