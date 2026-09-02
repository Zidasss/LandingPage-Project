import assert from "node:assert/strict";
import { test } from "node:test";
import { lerVagas, recadoDeVagas } from "./vagas.ts";

test("conta o que sobra a partir do que foi confirmado", () => {
  const v = lerVagas({ confirmados: 12 }, 130);
  assert.deepEqual(v, { confirmados: 12, capacidade: 130, restantes: 118 });
});

test("passar do teto não devolve vaga negativa", () => {
  // A organização pode confirmar a mais na planilha; a tela não pode dizer -3.
  assert.equal(lerVagas({ confirmados: 133 }, 130)?.restantes, 0);
});

test("resposta estranha vira silêncio, e não zero", () => {
  // Zero na tela lê como "ninguém vem" — pior do que não dizer nada.
  for (const lixo of [null, undefined, "oi", {}, { confirmados: "x" }, { confirmados: -2 }]) {
    assert.equal(lerVagas(lixo, 130), null, `deveria calar em ${JSON.stringify(lixo)}`);
  }
});

test("o selo nunca conta quantos já confirmaram", () => {
  // Quantos vieram é conta da organização. O selo só fala de vaga que sobra.
  for (const n of [0, 12, 40, 90, 118, 129]) {
    const r = recadoDeVagas(lerVagas({ confirmados: n }, 130));
    if (r) assert.doesNotMatch(r.texto, /confirmad/i, `vazou em ${n}`);
  }
});

test("no começo da venda o contador fica calado", () => {
  // "127 vagas restantes" no primeiro dia é propaganda de festa vazia.
  assert.equal(recadoDeVagas(lerVagas({ confirmados: 3 }, 130)), null);
});

test("com a festa pela metade ainda fica calado", () => {
  assert.equal(recadoDeVagas(lerVagas({ confirmados: 65 }, 130)), null);
});

test("o aviso começa quando faltam 30", () => {
  const em = (conf: number) => recadoDeVagas(lerVagas({ confirmados: conf }, 130));
  assert.equal(em(99), null, "31 restantes ainda é cedo");
  assert.match(em(100)!.texto, /30 últimas vagas/, "30 restantes é a hora");
});

test("no fim, vira urgência", () => {
  const r = recadoDeVagas(lerVagas({ confirmados: 110 }, 130));
  assert.equal(r?.tom, "ultimas");
  assert.match(r!.texto, /20 últimas vagas/);
});

test("uma vaga só não fica no plural", () => {
  assert.match(recadoDeVagas(lerVagas({ confirmados: 129 }, 130))!.texto, /1 última vaga/);
});

test("cheio é lotado", () => {
  assert.equal(recadoDeVagas(lerVagas({ confirmados: 130 }, 130))?.tom, "lotado");
});

test("festa pequena não avisa desde o primeiro dia", () => {
  // Avisar "30 últimas vagas" numa casa de 40 seria avisar desde o começo — o
  // aviso vira exatamente o anúncio de vazio que o silêncio evita.
  const em = (conf: number, cap: number) => recadoDeVagas(lerVagas({ confirmados: conf }, cap));
  assert.equal(em(5, 40), null, "35 restantes de 40 não é urgência");
  assert.equal(em(20, 40)?.tom, "ultimas", "metade da casa pequena, aí sim");
});

test("sem notícia da planilha, ninguém fala nada", () => {
  assert.equal(recadoDeVagas(null), null);
});
