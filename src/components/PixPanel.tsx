"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { buildPixPayload } from "@/lib/pix";
import { brl } from "@/lib/format";
import { event } from "@/config/event";

/**
 * Mostra o QR Code e o código copia e cola para o valor já calculado.
 * O payload é montado no cliente — nenhum dado do convidado sai da página
 * nesta etapa.
 */
export function PixPanel({
  amount,
  txid,
  guestName,
}: {
  amount: number;
  txid: string;
  guestName: string;
}) {
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // O payload é determinístico: derivar em vez de guardar em estado.
  const { payload, error } = useMemo(() => {
    try {
      return {
        payload: buildPixPayload({
          key: event.pix.key,
          receiverName: event.pix.receiverName,
          receiverCity: event.pix.receiverCity,
          amount,
          txid,
        }),
        error: null,
      };
    } catch (err) {
      return {
        payload: null,
        error: err instanceof Error ? err.message : "Falha ao gerar o PIX.",
      };
    }
  }, [amount, txid]);

  // Só o desenho do QR é assíncrono.
  useEffect(() => {
    if (!payload) return;
    let active = true;
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 480,
      color: { dark: "#05040a", light: "#ede7f5" },
    }).then((url) => {
      if (active) setQr(url);
    });
    return () => {
      active = false;
    };
  }, [payload]);

  async function copy() {
    if (!payload) return;
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (error) {
    return (
      <div className="border-magenta/50 bg-magenta/5 border p-6 text-left">
        <p className="font-heading text-magenta text-sm tracking-[0.2em] uppercase">
          PIX indisponível
        </p>
        <p className="text-bone/70 mt-3 text-sm leading-relaxed">
          {error} Enquanto isso, fale direto com a organização para garantir sua
          vaga.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <p className="font-mono text-ash text-[0.65rem] tracking-[0.3em] uppercase">
          Valor a pagar
        </p>
        <p className="font-heading glow-pumpkin text-pumpkin mt-2 text-4xl">
          {brl(amount)}
        </p>
        <p className="font-mono text-ash/70 mt-2 text-xs">
          código {txid} · {guestName}
        </p>
      </div>

      <div className="bg-bone border-cyan/40 rounded border p-3">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qr}
            alt={`QR Code do PIX de ${brl(amount)}`}
            className="h-56 w-56 sm:h-64 sm:w-64"
          />
        ) : (
          <div className="text-void/40 font-mono flex h-56 w-56 items-center justify-center text-xs sm:h-64 sm:w-64">
            gerando…
          </div>
        )}
      </div>

      <div className="w-full">
        <p className="font-mono text-ash text-[0.65rem] tracking-[0.3em] uppercase">
          Ou use o copia e cola
        </p>
        <p className="bg-void/70 border-cyan/20 text-ash mt-2 max-h-24 overflow-y-auto border p-3 font-mono text-[0.7rem] break-all">
          {payload ?? "…"}
        </p>
        <button
          type="button"
          onClick={copy}
          disabled={!payload}
          className="font-heading border-cyan text-cyan hover:bg-cyan hover:text-void mt-3 w-full border-2 px-6 py-3 text-xs tracking-[0.25em] uppercase transition-colors disabled:opacity-40"
        >
          {copied ? "copiado ✓" : "copiar código pix"}
        </button>
      </div>
    </div>
  );
}
