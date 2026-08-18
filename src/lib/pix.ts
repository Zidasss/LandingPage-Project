/**
 * Gerador de BR Code (PIX "copia e cola") no padrão EMV®QRCPS do Banco Central.
 *
 * O payload é uma sequência de campos no formato ID + tamanho + valor, e termina
 * com um CRC16 calculado sobre tudo que veio antes. Qualquer byte fora do lugar
 * faz o app do banco recusar o código — por isso a normalização é rígida aqui.
 */

/** Monta um campo EMV: identificador + tamanho em 2 dígitos + valor. */
function field(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

/**
 * CRC16/CCITT-FALSE (polinômio 0x1021, valor inicial 0xFFFF) — o exigido pelo
 * BR Code. Retorna 4 dígitos hexadecimais maiúsculos.
 */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Remove acentos, símbolos e limita o tamanho.
 * Nome do recebedor e cidade só aceitam caracteres básicos no BR Code.
 */
function sanitize(value: string, maxLength: number): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .slice(0, maxLength);
}

/** Identificador da transação: até 25 caracteres alfanuméricos, ou "***". */
function sanitizeTxid(txid: string | undefined): string {
  if (!txid) return "***";
  const clean = txid
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 25);
  return clean || "***";
}

export type PixParams = {
  /** Chave PIX do recebedor (CPF, CNPJ, e-mail, telefone ou aleatória). */
  key: string;
  /** Nome do recebedor como está cadastrado no banco. */
  receiverName: string;
  /** Cidade do recebedor. */
  receiverCity: string;
  /** Valor em reais. Omitido = o pagador digita o valor. */
  amount?: number;
  /** Identificador para conciliar o pagamento depois. */
  txid?: string;
};

/**
 * Devolve a string do PIX copia e cola, pronta para virar QR Code.
 * Lança se a chave estiver vazia — melhor falhar aqui do que gerar um
 * código que o banco recusa na frente do convidado.
 */
export function buildPixPayload({
  key,
  receiverName,
  receiverCity,
  amount,
  txid,
}: PixParams): string {
  if (!key.trim()) {
    throw new Error("Chave PIX não configurada.");
  }

  const merchantAccount =
    field("00", "br.gov.bcb.pix") + field("01", key.trim());

  const parts = [
    field("00", "01"), // versão do payload
    field("26", merchantAccount), // conta do recebedor
    field("52", "0000"), // categoria do estabelecimento
    field("53", "986"), // moeda: real
    amount !== undefined ? field("54", amount.toFixed(2)) : "",
    field("58", "BR"), // país
    field("59", sanitize(receiverName, 25) || "NAO INFORMADO"),
    field("60", sanitize(receiverCity, 15) || "BRASIL"),
    field("62", field("05", sanitizeTxid(txid))), // dados adicionais
  ].join("");

  const withCrcMarker = `${parts}6304`;
  return `${withCrcMarker}${crc16(withCrcMarker)}`;
}
