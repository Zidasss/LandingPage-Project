import assert from "node:assert/strict";
import { test } from "node:test";
import {
  beamPolygon,
  beamShape,
  clamp01,
  glowRadius,
  slice,
  DOOR_BOTTOM,
  DOOR_TOP,
} from "./beam.ts";

/** Meia-largura típica da porta, em porcentagem da largura da tela. */
const PORTA = 11;

test("prende o progresso ao intervalo válido", () => {
  assert.equal(clamp01(-3), 0);
  assert.equal(clamp01(0.4), 0.4);
  assert.equal(clamp01(9), 1);
});

test("slice reposiciona o valor dentro da faixa", () => {
  assert.equal(slice(0.6, 0.6, 1), 0);
  // divisão de float não fecha exato: 0.2/0.4 dá 0.5000000000000001
  assert.ok(Math.abs(slice(0.8, 0.6, 1) - 0.5) < 1e-9);
  assert.equal(slice(1, 0.6, 1), 1);
  assert.equal(slice(0.1, 0.6, 1), 0);
});

test("a aresta de cima nunca passa da largura da porta", () => {
  // é essa igualdade que elimina o degrau reto na base da porta
  for (let p = 0; p <= 1.0001; p += 0.05) {
    assert.equal(beamShape(p, PORTA).topHalf, PORTA, `sobrou degrau em ${p}`);
  }
});

test("a aresta de cima acompanha portas de larguras diferentes", () => {
  for (const largura of [6, 11, 18, 24]) {
    assert.equal(beamShape(0.5, largura).topHalf, largura);
  }
});

test("a base abre até passar das bordas da tela", () => {
  assert.ok(beamShape(0, PORTA).bottomHalf > PORTA, "começa mais larga que o topo");
  assert.ok(beamShape(1, PORTA).bottomHalf > 100, "termina fora da tela");
});

test("a base só abre, nunca fecha", () => {
  let anterior = beamShape(0, PORTA).bottomHalf;
  for (let p = 0.02; p <= 1.0001; p += 0.02) {
    const atual = beamShape(p, PORTA).bottomHalf;
    assert.ok(atual >= anterior - 1e-9, `a base fechou em ${p}`);
    anterior = atual;
  }
});

test("o clarão entra depois que a base já abriu, e só cresce", () => {
  assert.equal(glowRadius(0), 0);
  assert.equal(glowRadius(0.5), 0, "ainda não começou");
  assert.ok(glowRadius(0.8) > 0, "já está em curso");
  assert.ok(glowRadius(0.8) < 100, "mas ainda não comeu o feixe");
  assert.ok(glowRadius(1) >= 100, "cobre a tela inteira só no fim");

  let anterior = glowRadius(0);
  for (let p = 0.02; p <= 1.0001; p += 0.02) {
    const atual = glowRadius(p);
    assert.ok(atual >= anterior - 1e-9, `o clarão encolheu em ${p}`);
    anterior = atual;
  }
});

test("o polígono nasce colado na base da porta", () => {
  const d = beamPolygon(beamShape(0.3, PORTA));
  assert.ok(d.includes(`${DOOR_BOTTOM.toFixed(2)}%`), "o topo encosta na porta");
  assert.equal(d.split(",").length, 4);
});

test("a porta é mais alta que larga", () => {
  const altura = DOOR_BOTTOM - DOOR_TOP;
  assert.ok(altura > 40, `a porta ficou baixa: ${altura}% da tela`);
  assert.ok(DOOR_TOP > 0 && DOOR_BOTTOM < 100);
});
