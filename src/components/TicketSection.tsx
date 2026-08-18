"use client";

import { useState } from "react";
import { Field } from "@/components/Field";
import { PixPanel } from "@/components/PixPanel";
import { brl, makeTxid, maskPhone } from "@/lib/format";
import { event } from "@/config/event";

type Guest = { name: string; email: string; phone: string; quantity: number };
type Errors = Partial<Record<keyof Guest, string>>;

const MAX_TICKETS = 5;

function validate(guest: Guest): Errors {
  const errors: Errors = {};
  if (guest.name.trim().length < 3) errors.name = "Escreva seu nome completo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(guest.email.trim()))
    errors.email = "E-mail inválido — é nele que chega a confirmação.";
  if (guest.phone.replace(/\D/g, "").length < 10)
    errors.phone = "Informe o WhatsApp com DDD.";
  if (guest.quantity < 1 || guest.quantity > MAX_TICKETS)
    errors.quantity = `Entre 1 e ${MAX_TICKETS} ingressos.`;
  return errors;
}

export function TicketSection() {
  const [guest, setGuest] = useState<Guest>({
    name: "",
    email: "",
    phone: "",
    quantity: 1,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [txid, setTxid] = useState<string | null>(null);

  const total = event.ticket.price * guest.quantity;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(guest);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setTxid(makeTxid());
  }

  function update<K extends keyof Guest>(key: K, value: Guest[K]) {
    setGuest((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  return (
    <section
      id="ingresso"
      className="border-crypt relative border-t px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-xl text-center">
        <p className="font-mono text-magenta text-[0.65rem] tracking-[0.4em] uppercase">
          ▶ garanta seu lugar
        </p>
        <h2 className="font-heading chromatic text-bone mt-3 text-3xl tracking-[0.12em] uppercase sm:text-4xl">
          Ingresso
        </h2>
        <p className="text-bone/70 mt-5 text-sm leading-relaxed">
          {brl(event.ticket.price)} por pessoa. Preencha seus dados, pague pelo
          PIX e envie o comprovante — a confirmação chega no seu e-mail.
        </p>

        {txid === null ? (
          <form onSubmit={submit} noValidate className="mt-10 flex flex-col gap-5">
            <Field
              id="nome"
              label="Nome completo"
              type="text"
              autoComplete="name"
              placeholder="Como está no seu documento"
              value={guest.name}
              error={errors.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <Field
              id="email"
              label="E-mail"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="voce@email.com"
              hint="A confirmação e o comprovante chegam aqui."
              value={guest.email}
              error={errors.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <Field
              id="whatsapp"
              label="WhatsApp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(41) 99999-9999"
              value={guest.phone}
              error={errors.phone}
              onChange={(e) => update("phone", maskPhone(e.target.value))}
            />
            <Field
              id="quantidade"
              label="Quantos ingressos"
              type="number"
              min={1}
              max={MAX_TICKETS}
              inputMode="numeric"
              value={guest.quantity}
              error={errors.quantity}
              onChange={(e) => update("quantity", Number(e.target.value))}
            />

            <div className="border-cyan/20 text-bone/80 flex items-center justify-between border-t pt-5 text-sm">
              <span className="font-mono text-ash text-xs tracking-[0.2em] uppercase">
                Total
              </span>
              <span className="font-heading glow-pumpkin text-pumpkin text-2xl">
                {brl(total)}
              </span>
            </div>

            <button
              type="submit"
              className="font-heading border-pumpkin text-pumpkin hover:bg-pumpkin hover:text-void hover:shadow-pumpkin/40 border-2 px-8 py-4 text-sm tracking-[0.25em] uppercase transition-all duration-300 hover:shadow-[0_0_40px]"
            >
              gerar pix
            </button>
          </form>
        ) : (
          <div className="mt-10 flex flex-col gap-8">
            <PixPanel amount={total} txid={txid} guestName={guest.name} />

            <div className="border-cyan/20 bg-crypt/40 border p-6 text-left">
              <p className="font-heading text-cyan text-sm tracking-[0.2em] uppercase">
                Próximo passo
              </p>
              <p className="text-bone/70 mt-3 text-sm leading-relaxed">
                Depois de pagar, envie o comprovante para a organização
                confirmar sua vaga. O envio pelo site entra no ar em breve.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setTxid(null)}
              className="font-mono text-ash hover:text-cyan text-xs tracking-[0.25em] uppercase transition-colors"
            >
              ← corrigir meus dados
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
