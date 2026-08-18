import assert from "node:assert/strict";
import { test } from "node:test";
import {
  beamPolygon,
  beamShape,
  clamp01,
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

test("o feixe nunca toma a tela inteira: os cantos de cima ficam pretos", () => {
  // a aresta de cima é a da porta, então acima dela sempre sobra preto —
  // é o que impede a cena de virar simples troca de fundo
  for (const p of [0, 0.5, 1]) {
    assert.ok(beamShape(p, PORTA).topHalf < 50, `o topo cobriu a tela em ${p}`);
  }
});

test("a base cresce durante todo o percurso, sem parar no meio", () => {
  const inicio = beamShape(0, PORTA).bottomHalf;
  const meio = beamShape(0.5, PORTA).bottomHalf;
  const fim = beamShape(1, PORTA).bottomHalf;
  assert.ok(meio > inicio, "cresceu na primeira metade");
  assert.ok(fim > meio, "e continuou crescendo na segunda");
});

test("a base já nasce larga o bastante para o texto do cartaz", () => {
  assert.ok(beamShape(0, PORTA).bottomHalf > 35, "o cartaz não caberia");
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
