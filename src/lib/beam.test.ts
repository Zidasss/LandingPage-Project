import assert from "node:assert/strict";
import { test } from "node:test";
import { beamPolygon, beamShape, clamp01, slice, DOOR_BOTTOM } from "./beam.ts";

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

test("no início o feixe é estreito e nasce colado na porta", () => {
  const forma = beamShape(0);
  assert.equal(forma.topY, DOOR_BOTTOM);
  assert.equal(forma.topHalf, 11);
  assert.ok(forma.bottomHalf > forma.topHalf, "a base é mais larga que o topo");
});

test("no fim o feixe cobre a tela inteira", () => {
  const forma = beamShape(1);
  assert.equal(forma.topY, 0);
  assert.ok(forma.topHalf >= 50, "a aresta de cima passa das bordas");
  assert.ok(forma.bottomHalf >= 50, "a base passa das bordas");
});

test("a base abre antes de a aresta de cima subir", () => {
  const meio = beamShape(0.5);
  assert.equal(meio.topY, DOOR_BOTTOM, "a aresta de cima ainda não subiu");
  assert.ok(meio.bottomHalf > 90, "mas a base já passou das bordas");
});

test("as diagonais continuam visíveis durante quase todo o percurso", () => {
  // topHalf < 50 mantém a aresta de cima dentro da tela: sem isso o trapézio
  // vira um bloco chapado com corte reto no meio da viewport.
  for (const p of [0.2, 0.35, 0.5, 0.65, 0.75]) {
    const forma = beamShape(p);
    assert.ok(forma.topHalf < 50, `em ${p} a aresta de cima já passou das bordas`);
    assert.ok(forma.bottomHalf > forma.topHalf, `em ${p} o feixe deixou de abrir`);
  }
});

test("o feixe só cresce, nunca encolhe", () => {
  let anterior = beamShape(0);
  for (let p = 0.02; p <= 1.0001; p += 0.02) {
    const atual = beamShape(p);
    assert.ok(atual.topHalf >= anterior.topHalf - 1e-9, `topo encolheu em ${p}`);
    assert.ok(atual.bottomHalf >= anterior.bottomHalf - 1e-9, `base encolheu em ${p}`);
    assert.ok(atual.topY <= anterior.topY + 1e-9, `aresta desceu em ${p}`);
    anterior = atual;
  }
});

test("o polígono tem quatro vértices em porcentagem", () => {
  const d = beamPolygon(beamShape(0.3));
  assert.match(d, /^polygon\(/);
  assert.equal(d.split(",").length, 4);
});
