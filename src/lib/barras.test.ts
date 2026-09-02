import assert from "node:assert/strict";
import { test } from "node:test";
import { barrasDoCodigo } from "./barras.ts";

test("o mesmo código desenha sempre as mesmas barras", () => {
  // É disto que depende a hidratação: servidor e navegador desenham o mesmo.
  assert.deepEqual(barrasDoCodigo("VWX7K2M9"), barrasDoCodigo("VWX7K2M9"));
});

test("códigos diferentes desenham barras diferentes", () => {
  // Se todo ingresso saísse igual, o código de barras não seria do ingresso.
  assert.notDeepEqual(barrasDoCodigo("VWX7K2M9"), barrasDoCodigo("VWA3B4C5"));
});

test("toda barra tem largura visível", () => {
  // Largura zero some da tela e abre um buraco no meio do desenho.
  for (const l of barrasDoCodigo("VOLVOWEEN2026")) {
    assert.ok(l >= 1 && l <= 3, `largura fora do previsto: ${l}`);
  }
});

test("texto vazio ainda desenha um código inteiro", () => {
  // O rodapé desenha antes de existir pedido; não pode vir uma lista vazia.
  assert.equal(barrasDoCodigo("").length, barrasDoCodigo("VWX7K2M9").length);
});
