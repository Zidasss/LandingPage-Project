import assert from "node:assert/strict";
import { test } from "node:test";
import { linkComprovante } from "./pedido.ts";

const BASE = {
  numero: "5541996475299",
  festa: "Volvoween",
  txid: "VW72H4PB",
  nome: "Gustavo Zavadniak",
  ingressos: 2,
  valor: "R$ 160,00",
};

test("o link leva o código do pedido no recado", () => {
  const url = new URL(linkComprovante(BASE));
  assert.equal(url.host, "wa.me");
  assert.equal(url.pathname, "/5541996475299");
  const texto = url.searchParams.get("text") ?? "";
  assert.match(texto, /VW72H4PB/);
  assert.match(texto, /Gustavo Zavadniak/);
  assert.match(texto, /R\$ 160,00/);
});

test("o número perde máscara: wa.me só aceita dígitos", () => {
  const url = new URL(linkComprovante({ ...BASE, numero: "+55 (41) 99647-5299" }));
  assert.equal(url.pathname, "/5541996475299");
});

test("um ingresso não vira 'ingressos'", () => {
  const url = new URL(linkComprovante({ ...BASE, ingressos: 1 }));
  assert.match(url.searchParams.get("text") ?? "", /1 ingresso,/);
});
