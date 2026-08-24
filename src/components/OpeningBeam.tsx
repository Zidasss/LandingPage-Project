"use client";

import { useEffect, useRef } from "react";
import { ALARGA, aberturaDaFolha, fatia, progresso } from "@/lib/abertura";
import {
  beamGapPolygon,
  beamPolygon,
  BEAM_DESKTOP,
  BEAM_MOBILE,
  DOOR_GAP,
} from "@/lib/beam";

/**
 * A luz da porta: abre pelo vão, cresce com a folha e vira o fundo da página.
 *
 * Ela é **fixa na tela** e mora fora da cena, atrás de todo o conteúdo. Sem
 * isso, as seções seguintes precisariam pintar o próprio vermelho — e aí o que
 * sobe durante a rolagem é outro bloco vermelho, não a luz. Fixa, ela abre e
 * simplesmente continua ali: o vermelho que se vê é o mesmo o tempo todo.
 *
 * O desenho tem duas etapas, e as duas saem da **mesma** linha do tempo da
 * abertura — antes eram dois feixes, um desenhado dentro da cena enquanto a
 * porta abria e outro aqui fora, e a passagem de um para o outro aparecia:
 *
 * 1. Enquanto a folha gira, o feixe é o vão da porta abrindo (`beamGapPolygon`).
 * 2. Depois, a base se afasta até passar das bordas da tela (`beamPolygon`).
 *
 * A aresta de cima continua sempre com a largura da porta, então a luz nunca
 * deixa de sair da abertura. Um `scaleX` no elemento seria mais barato, mas
 * alargaria o topo junto — a luz descolaria da porta e viraria um bloco
 * crescendo sozinho. Por isso o que anda aqui é o `clip-path`, em degraus, para
 * não repintar o polígono a cada pixel de rolagem.
 */

/** Meia-largura final da base, em % da tela. Passa das bordas com folga. */
const ABERTURA_FINAL = 190;
/** Degrau da largura, em % da tela. */
const DEGRAU = 2;

export function OpeningBeam() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // O progresso vem da abertura, não do próprio elemento: fixo na tela, ele
    // não rola e não teria posição para medir.
    const cena = document.querySelector<HTMLElement>("[data-abertura]");
    if (!cena) return;

    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    let anterior = "";
    let visivel = false;

    const aplicar = () => {
      frame = 0;
      const porta = cena.querySelector<HTMLElement>("[data-porta]");
      const tela = window.innerHeight;
      const p = parado ? 1 : progresso(cena);

      // Antes de a folha começar a girar não há luz nenhuma para mostrar: o
      // vermelho apareceria como um bloco no fundo, sem porta que o justifique.
      // O número vem da mesma conta da folha, já suavizado — é o que mantém a
      // boca da luz exatamente do tamanho da fresta.
      const aberto = aberturaDaFolha(p);
      const mostrar = aberto > 0;
      if (mostrar !== visivel) {
        node.style.opacity = mostrar ? "1" : "0";
        visivel = mostrar;
      }
      if (!mostrar) return;

      // A porta define a largura e a altura do vértice de cima. Medir o próprio
      // elemento é o que mantém a luz colada na abertura: ela tem mínimo e
      // máximo em pixels e — por a luz ser fixa e a porta rolar — a altura só
      // pode vir de onde a porta está agora.
      const larguraPorta = porta?.offsetWidth ?? 0;
      const padrao = window.innerWidth >= 640 ? BEAM_DESKTOP : BEAM_MOBILE;
      const base = larguraPorta
        ? { ...padrao, topHalf: (larguraPorta / window.innerWidth) * 50 }
        : padrao;

      const alarga = fatia(p, ALARGA);
      let forma: string;
      if (alarga <= 0) {
        // Etapa 1: o vão da porta, abrindo.
        forma = beamGapPolygon(base, aberto);
      } else {
        // Etapa 2: a base se afasta. Acelera no fim: a luz demora a sair do
        // lugar e depois toma a tela.
        const topY = porta
          ? (porta.getBoundingClientRect().bottom / tela) * 100 + DOOR_GAP
          : undefined;
        const alvo =
          base.bottomHalf + (ABERTURA_FINAL - base.bottomHalf) * alarga * alarga;
        const bottomHalf = Math.round(alvo / DEGRAU) * DEGRAU;
        forma = beamPolygon({ ...base, bottomHalf }, topY);
      }

      if (forma !== anterior) {
        node.style.clipPath = forma;
        anterior = forma;
      }
    };

    const aoRolar = () => {
      if (!frame) frame = requestAnimationFrame(aplicar);
    };

    aplicar();
    if (parado) return;
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  return <div ref={ref} aria-hidden className="bg-blood fixed inset-0 z-20 opacity-0" />;
}
