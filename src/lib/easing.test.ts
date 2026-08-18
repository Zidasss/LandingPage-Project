import assert from "node:assert/strict";
import { test } from "node:test";
import { amostrar, cubicBezier } from "./easing.ts";

test("a curva começa em 0 e termina em 1", () => {
  const f = cubicBezier(0.45, 0, 0.35, 1);
  assert.equal(f(0), 0);
  assert.equal(f(1), 1);
  assert.equal(f(-2), 0);
  assert.equal(f(9), 1);
});

test("a curva só sobe", () => {
  const f = cubicBezier(0.45, 0, 0.35, 1);
  let anterior = -1;
  for (let x = 0; x <= 1.0001; x += 0.02) {
    const y = f(x);
    assert.ok(y >= anterior - 1e-9, `desceu em ${x}`);
    anterior = y;
  }
});

test("uma curva linear devolve o próprio x", () => {
  const f = cubicBezier(1 / 3, 1 / 3, 2 / 3, 2 / 3);
  for (const x of [0.15, 0.4, 0.75]) {
    assert.ok(Math.abs(f(x) - x) < 5e-3, `${x} saiu em ${f(x)}`);
  }
});

test("a amostragem cobre o percurso inteiro com tempo linear", () => {
  const pontos = amostrar(cubicBezier(0.45, 0, 0.35, 1), 10);
  assert.equal(pontos.length, 11);
  assert.equal(pontos[0].tempo, 0);
  assert.equal(pontos[10].tempo, 1);
  assert.equal(pontos[0].valor, 0);
  assert.equal(pontos[10].valor, 1);
  // o tempo anda em passos iguais; o valor, não — é aí que mora a suavização
  assert.ok(Math.abs(pontos[5].tempo - 0.5) < 1e-9);
  assert.notEqual(pontos[5].valor, 0.5);
});
