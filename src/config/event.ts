/**
 * Fonte única de verdade da festa.
 * Tudo que muda de ano para ano (ou que o Gustavo quiser ajustar) mora aqui.
 * Campos marcados com TODO ainda precisam ser confirmados.
 */
export const event = {
  name: "Halloween Project",
  tagline: "A noite em que a fita não rebobina",
  edition: "2026",

  /** Data/hora oficial em horário de Brasília (UTC-03:00). TODO: confirmar horário. */
  startsAt: "2026-10-16T22:00:00-03:00",
  /** Rótulo humano usado nos textos. */
  dateLabel: "16 de outubro",
  weekdayLabel: "sexta-feira",
  timeLabel: "22h",

  venue: {
    /** TODO: confirmar nome do local. */
    name: "Local a confirmar",
    /** TODO: confirmar endereço completo. */
    address: "Endereço a confirmar",
    city: "Curitiba",
    state: "PR",
    /** Link do Google Maps. TODO: preencher. */
    mapsUrl: "",
  },

  ticket: {
    /** Valor por pessoa, em reais. TODO: confirmar. */
    price: 50,
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
