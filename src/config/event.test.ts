import assert from "node:assert/strict";
import { test } from "node:test";
import { event, ouPadrao } from "./event.ts";

/*
 * O PIX já sumiu do ar por causa disto: a variável `NEXT_PUBLIC_PIX_KEY` foi
 * criada em branco no painel da Vercel, chegou como texto vazio, atravessou o
 * `??` — que só cai no padrão quando o valor é nulo — e o site passou a dizer
 * "chave PIX não configurada" com a chave certa no código.
 */

test("variável em branco cai no padrão, como se não existisse", () => {
  assert.equal(ouPadrao("", "padrão"), "padrão");
  assert.equal(ouPadrao(undefined, "padrão"), "padrão");
  // Só espaços é o mesmo que nada — acontece ao colar no painel.
  assert.equal(ouPadrao("   ", "padrão"), "padrão");
});

test("variável preenchida vence o padrão", () => {
  assert.equal(ouPadrao("+5541988887777", "padrão"), "+5541988887777");
});

test("espaço em volta é aparado", () => {
  // Colar no painel costuma trazer espaço junto, e o BR Code não perdoa.
  assert.equal(ouPadrao("  +5541988887777 \n", "padrão"), "+5541988887777");
});

test("a festa nasce com PIX utilizável sem configurar nada", () => {
  assert.ok(event.pix.key.length > 0, "a chave não pode ficar vazia");
  assert.ok(event.pix.receiverName.length > 0);
  assert.ok(event.pix.receiverCity.length > 0);
});
