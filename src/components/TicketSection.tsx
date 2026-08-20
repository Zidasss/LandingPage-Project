"use client";

import { useState } from "react";
import { Field } from "@/components/Field";
import { PixPanel } from "@/components/PixPanel";
import { TicketWall } from "@/components/TicketWall";
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

/**
 * A seção do ingresso.
 *
 * Uma parede de ingressos corre atrás, escurecida por um spotlight diagonal —
 * o cenário. No centro, um único ingresso em destaque, iluminado e parado, que
 * é o próprio formulário: o cabeçalho vermelho carrega a identidade da festa e
 * o corpo escuro segura os campos, para o texto ficar legível sobre a parede.
 */
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
      className="bg-ink relative z-40 overflow-hidden px-6 py-24 sm:py-32"
    >
      {/* cenário: a parede de ingressos correndo */}
      <TicketWall />

      {/*
        Spotlight: escurece a parede e concentra a luz no centro, onde fica o
        ingresso de destaque. Sem isso, a parede briga com a leitura do
        formulário.
      */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 45%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.82) 55%, rgba(0,0,0,0.96) 100%)",
        }}
      />

      {/* o ingresso de destaque: é o formulário */}
      <div className="relative mx-auto max-w-md">
        <div className="border-blood/40 bg-ink/95 border shadow-[0_0_80px_rgba(255,26,18,0.25)] backdrop-blur-sm">
          {/* cabeçalho: a identidade do ingresso */}
          <div className="bg-blood text-ink relative px-6 pt-5 pb-7">
            <p className="font-heading text-[0.6rem] font-bold tracking-[0.35em] uppercase opacity-80">
              ▶ garanta seu lugar
            </p>
            <p className="font-display mt-1 text-4xl leading-none uppercase sm:text-5xl">
              {event.name}
            </p>
            <p className="font-heading mt-2 text-[0.62rem] font-bold tracking-[0.25em] uppercase opacity-80">
              {event.dateLabel} · {event.timeLabel} · {brl(event.ticket.price)}
            </p>

            {/* picote entre o cabeçalho e o corpo */}
            <div
              className="absolute inset-x-4 bottom-0 h-px translate-y-1/2"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, currentColor 0 5px, transparent 5px 11px)",
              }}
            />
            <span className="bg-ink absolute bottom-0 left-0 h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full" />
            <span className="bg-ink absolute right-0 bottom-0 h-5 w-5 translate-x-1/2 translate-y-1/2 rounded-full" />
          </div>

          {/* corpo: o formulário */}
          <div className="px-6 pt-8 pb-7">
            {txid === null ? (
              <form onSubmit={submit} noValidate className="flex flex-col gap-5">
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

                <div className="border-bone/15 text-bone flex items-center justify-between border-t pt-5">
                  <span className="font-heading text-ash text-xs font-bold tracking-[0.2em] uppercase">
                    Total
                  </span>
                  <span className="font-display text-blood text-3xl">
                    {brl(total)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="font-heading bg-blood text-ink hover:bg-ember px-8 py-4 text-sm font-bold tracking-[0.25em] uppercase transition-colors"
                >
                  gerar pix
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-8">
                <PixPanel amount={total} txid={txid} guestName={guest.name} />

                <div className="border-bone/15 border-t pt-6 text-left">
                  <p className="font-heading text-blood text-sm font-bold tracking-[0.2em] uppercase">
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
                  className="font-heading text-ash hover:text-bone text-xs font-bold tracking-[0.25em] uppercase transition-colors"
                >
                  ← corrigir meus dados
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
