import assert from "node:assert/strict";
import { test } from "node:test";
import { lerVagas, recadoDeVagas } from "./vagas.ts";

test("conta o que sobra a partir do que foi confirmado", () => {
  const v = lerVagas({ confirmados: 12 }, 80);
  assert.deepEqual(v, { confirmados: 12, capacidade: 80, restantes: 68 });
});

test("passar do teto não devolve vaga negativa", () => {
  // A organização pode confirmar a mais na planilha; a tela não pode dizer -3.
  assert.equal(lerVagas({ confirmados: 83 }, 80)?.restantes, 0);
});

test("resposta estranha vira silêncio, e não zero", () => {
  // Zero na tela lê como "ninguém vem" — pior do que não dizer nada.
  for (const lixo of [null, undefined, "oi", {}, { confirmados: "x" }, { confirmados: -2 }]) {
    assert.equal(lerVagas(lixo, 80), null, `deveria calar em ${JSON.stringify(lixo)}`);
  }
});

test("no começo da venda o contador fica calado", () => {
  // 3 de 80 é propaganda de festa vazia.
  assert.equal(recadoDeVagas(lerVagas({ confirmados: 3 }, 80)), null);
});

test("com gente confirmada, vira prova de que a festa está enchendo", () => {
  const r = recadoDeVagas(lerVagas({ confirmados: 24 }, 80));
  assert.equal(r?.tom, "enchendo");
  assert.match(r!.texto, /24 de 80/);
});

test("no fim, vira urgência", () => {
  const r = recadoDeVagas(lerVagas({ confirmados: 70 }, 80));
  assert.equal(r?.tom, "ultimas");
  assert.match(r!.texto, /10 últimas vagas/);
});

test("uma vaga só não fica no plural", () => {
  assert.match(recadoDeVagas(lerVagas({ confirmados: 79 }, 80))!.texto, /1 última vaga/);
});

test("cheio é lotado", () => {
  assert.equal(recadoDeVagas(lerVagas({ confirmados: 80 }, 80))?.tom, "lotado");
});

test("sem notícia da planilha, ninguém fala nada", () => {
  assert.equal(recadoDeVagas(null), null);
});
