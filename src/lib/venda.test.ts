import assert from "node:assert/strict";
import { test } from "node:test";
import { faseDaVenda, vendaEncerrada } from "./venda.ts";
import { deadlineDate, deadlineLabel, eventDate } from "../config/event.ts";

const PRAZO = new Date("2026-09-25T23:59:59-03:00");
const FESTA = new Date("2026-10-16T19:00:00-03:00");

const fase = (quando: string) => faseDaVenda(new Date(quando), PRAZO, FESTA);

test("antes do prazo a venda está aberta", () => {
  assert.equal(fase("2026-09-02T12:00:00-03:00"), "aberta");
});

test("no último dia, à noite, ainda dá para pagar", () => {
  // O prazo é "até o dia 25": quem paga às 23h do 25 pagou dentro do prazo.
  assert.equal(fase("2026-09-25T23:00:00-03:00"), "aberta");
});

test("passado o prazo, fecha — mas a festa ainda não aconteceu", () => {
  // O erro que isto evita: dizer "a festa já foi" três semanas antes dela.
  assert.equal(fase("2026-09-26T09:00:00-03:00"), "prazo-encerrado");
});

test("depois da festa, a fase é outra", () => {
  assert.equal(fase("2026-10-17T10:00:00-03:00"), "festa-passou");
});

test("a festa é o teto: prazo largo não faz a venda sobreviver a ela", () => {
  const prazoAbsurdo = new Date("2027-01-01T00:00:00-03:00");
  assert.equal(
    faseDaVenda(new Date("2026-10-17T10:00:00-03:00"), prazoAbsurdo, FESTA),
    "festa-passou",
  );
});

test("prazo quebrado não derruba a venda", () => {
  // Um typo na configuração não pode apagar o formulário do site.
  assert.equal(
    faseDaVenda(new Date("2026-09-02T12:00:00-03:00"), new Date("xx"), FESTA),
    "aberta",
  );
});

test("com tudo quebrado, a venda continua de pé", () => {
  assert.equal(
    faseDaVenda(new Date(), new Date("xx"), new Date("yy")),
    "aberta",
  );
});

test("só 'aberta' deixa o formulário na tela", () => {
  assert.equal(vendaEncerrada("aberta"), false);
  assert.equal(vendaEncerrada("prazo-encerrado"), true);
  assert.equal(vendaEncerrada("festa-passou"), true);
});

test("o corte usa as datas reais da configuração", () => {
  // Mudou a data no event.ts, o fechamento acompanha sozinho.
  assert.equal(deadlineDate.getTime(), PRAZO.getTime());
  assert.equal(eventDate.getTime(), FESTA.getTime());
});

test("o prazo escrito bate com o prazo real, e não escorrega de fuso", () => {
  // Sem fuso declarado, 23:59 de Brasília vira o dia 26 em UTC: o servidor
  // escreveria uma data e o navegador de quem está no Brasil, outra.
  assert.equal(deadlineLabel, "25 de setembro");
});
