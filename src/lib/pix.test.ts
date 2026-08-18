import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPixPayload, crc16 } from "./pix.ts";

const CHAVE = "123e4567-e12b-12d1-a456-426655440000";

test("reproduz o vetor de referência do BR Code publicado pelo BCB", () => {
  assert.equal(
    buildPixPayload({
      key: CHAVE,
      receiverName: "Fulano de Tal",
      receiverCity: "BRASILIA",
    }),
    "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D",
  );
});

test("inclui o valor no campo 54 quando informado", () => {
  const payload = buildPixPayload({
    key: CHAVE,
    receiverName: "Fulano de Tal",
    receiverCity: "BRASILIA",
    amount: 1,
  });
  assert.ok(payload.includes("54041.00"));
  assert.equal(payload.slice(-4), "B836");
});

test("formata centavos mesmo em valores redondos", () => {
  const payload = buildPixPayload({
    key: CHAVE,
    receiverName: "Fulano",
    receiverCity: "CURITIBA",
    amount: 60,
  });
  assert.ok(payload.includes("540560.00"));
});

test("remove acentos e respeita os limites de nome e cidade", () => {
  const payload = buildPixPayload({
    key: "teste@email.com",
    receiverName: "José da Silva Ção",
    receiverCity: "São José dos Pinhais",
    amount: 60,
  });
  assert.ok(payload.includes("5917Jose da Silva Cao"));
  assert.ok(payload.includes("6015Sao Jose dos P"));
});

test("limpa o txid e cai para *** quando não sobra nada", () => {
  const comTxid = buildPixPayload({
    key: CHAVE,
    receiverName: "Fulano",
    receiverCity: "CURITIBA",
    txid: "VOLVOWEEN-001",
  });
  assert.ok(comTxid.includes("0512VOLVOWEEN001"));

  const semTxid = buildPixPayload({
    key: CHAVE,
    receiverName: "Fulano",
    receiverCity: "CURITIBA",
    txid: "---",
  });
  assert.ok(semTxid.includes("0503***"));
});

test("o CRC fecha sobre o próprio payload gerado", () => {
  const payload = buildPixPayload({
    key: CHAVE,
    receiverName: "Fulano",
    receiverCity: "CURITIBA",
    amount: 60,
    txid: "ABC123",
  });
  assert.equal(crc16(payload.slice(0, -4)), payload.slice(-4));
});

test("recusa chave PIX vazia em vez de gerar código inválido", () => {
  assert.throws(
    () =>
      buildPixPayload({ key: "   ", receiverName: "X", receiverCity: "Y" }),
    /Chave PIX não configurada/,
  );
});
