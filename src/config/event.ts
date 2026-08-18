/**
 * Fonte única de verdade da festa.
 * Tudo que muda de ano para ano (ou que o Gustavo quiser ajustar) mora aqui.
 * Campos marcados com TODO ainda precisam ser confirmados.
 */
export const event = {
  name: "Volvoween",
  tagline: "A noite em que a fita não rebobina",
  edition: "2026",

  /** Data/hora oficial em horário de Brasília (UTC-03:00). */
  startsAt: "2026-10-16T16:00:00-03:00",
  /** Rótulo humano usado nos textos. */
  dateLabel: "16 de outubro",
  weekdayLabel: "sexta-feira",
  timeLabel: "16h",

  venue: {
    name: "Associação Volvo",
    street: "R. Eduardo Sprada, 6447",
    district: "Cidade Industrial de Curitiba",
    city: "Curitiba",
    state: "PR",
    zip: "81290-000",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Associa%C3%A7%C3%A3o+Volvo%2C+R.+Eduardo+Sprada%2C+6447%2C+Curitiba+-+PR%2C+81290-000",
  },

  ticket: {
    /** Valor por pessoa, em reais. Placeholder — confirmar. */
    price: 60,
    /** Quantidade máxima de convidados. TODO: confirmar. */
    capacity: 80,
  },

  pix: {
    /** Chave PIX que recebe os pagamentos. TODO: preencher. */
    key: "",
    /** Nome do recebedor exatamente como está no banco (máx. 25 caracteres). */
    receiverName: "",
    /** Cidade do recebedor (máx. 15 caracteres). */
    receiverCity: "CURITIBA",
  },

  contact: {
    /** WhatsApp em formato internacional, só dígitos. TODO: preencher. */
    whatsapp: "",
    instagram: "",
  },
} as const;

/** Data da festa como objeto Date (usada pela contagem regressiva). */
export const eventDate = new Date(event.startsAt);

/** Endereço completo em uma linha, do jeito que se lê em voz alta. */
export const fullAddress = `${event.venue.street} — ${event.venue.district}, ${event.venue.city}/${event.venue.state}, ${event.venue.zip}`;

/** Valor do ingresso formatado em reais. */
export const priceLabel = event.ticket.price.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
});
