import assert from "node:assert/strict";
import { test } from "node:test";
import { vendaEncerrada } from "./venda.ts";
import { eventDate } from "../config/event.ts";

const COMECO = new Date("2026-10-16T16:00:00-03:00");

test("antes da festa a venda está aberta", () => {
  assert.equal(vendaEncerrada(new Date("2026-10-16T15:59:59-03:00"), COMECO), false);
});

test("na hora marcada a venda fecha", () => {
  assert.equal(vendaEncerrada(COMECO, COMECO), true);
});

test("depois da festa a venda continua fechada", () => {
  // O caso que motivou tudo: alguém entrando no dia seguinte e pagando.
  assert.equal(vendaEncerrada(new Date("2026-10-17T10:00:00-03:00"), COMECO), true);
});

test("meses antes, aberta", () => {
  assert.equal(vendaEncerrada(new Date("2026-09-02T12:00:00-03:00"), COMECO), false);
});

test("data quebrada na configuração não derruba a venda", () => {
  // Errar vendendo é ruim; errar apagando o formulário do site é pior, porque
  // ninguém entende o motivo e a festa fica sem inscrição nenhuma.
  assert.equal(vendaEncerrada(new Date(), new Date("nao é data")), false);
});

test("o corte usa a data real da festa, não uma cópia", () => {
  // Se alguém mudar a data no event.ts, o fechamento acompanha sozinho.
  assert.equal(eventDate.getTime(), COMECO.getTime());
});
