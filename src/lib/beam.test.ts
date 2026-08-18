import assert from "node:assert/strict";
import { test } from "node:test";
import {
  beamPolygon,
  halfWidthAt,
  BEAM_DESKTOP,
  BEAM_MOBILE,
  BEAM_TOP,
  DOOR_BOTTOM,
  DOOR_GAP,
  DOOR_TOP,
} from "./beam.ts";

const FORMAS = [
  ["celular", BEAM_MOBILE],
  ["desktop", BEAM_DESKTOP],
] as const;

test("o feixe nasce exatamente na largura da porta e abre para baixo", () => {
  for (const [nome, forma] of FORMAS) {
    assert.ok(forma.bottomHalf > forma.topHalf, `${nome}: o feixe não abre`);
    assert.ok(forma.topHalf < 50, `${nome}: o topo cobriu a tela`);
  }
});

test("o feixe nunca toma a tela inteira: sobra preto em cima", () => {
  for (const [nome, forma] of FORMAS) {
    assert.ok(forma.topHalf < 50, `${nome}: o topo cobriu a tela`);
  }
});

test("existe uma faixa preta entre a porta e a luz no chão", () => {
  assert.ok(DOOR_GAP > 0, "sem respiro, porta e feixe viram uma peça só");
  assert.equal(BEAM_TOP, DOOR_BOTTOM + DOOR_GAP);
  for (const [nome, forma] of FORMAS) {
    assert.ok(
      beamPolygon(forma).includes(`${BEAM_TOP}%`),
      `${nome}: o feixe não começou abaixo da porta`,
    );
  }
});

test("a largura cresce de forma contínua da porta até o pé da tela", () => {
  for (const [nome, forma] of FORMAS) {
    assert.equal(halfWidthAt(forma, BEAM_TOP), forma.topHalf, nome);
    assert.equal(halfWidthAt(forma, 100), forma.bottomHalf, nome);
    const meio = halfWidthAt(forma, (DOOR_BOTTOM + 100) / 2);
    assert.ok(meio > forma.topHalf && meio < forma.bottomHalf, `${nome}: meio`);
  }
});

test("fora do trecho do feixe a largura fica presa nas pontas", () => {
  assert.equal(halfWidthAt(BEAM_DESKTOP, 10), BEAM_DESKTOP.topHalf);
  assert.equal(halfWidthAt(BEAM_DESKTOP, 130), BEAM_DESKTOP.bottomHalf);
});

test("o polígono tem quatro vértices em porcentagem", () => {
  const d = beamPolygon(BEAM_DESKTOP);
  assert.match(d, /^polygon\(/);
  assert.equal(d.split(",").length, 4);
});

test("a porta é mais alta que larga", () => {
  const altura = DOOR_BOTTOM - DOOR_TOP;
  assert.ok(altura > 40, `a porta ficou baixa: ${altura}% da tela`);
  assert.ok(altura > BEAM_DESKTOP.topHalf * 2, "mais alta que larga");
});
