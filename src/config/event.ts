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

  /**
   * Dados do recebedor do PIX. Vêm de variáveis de ambiente para poderem ser
   * trocadas na Vercel sem commit — e para a chave não ficar no histórico do git.
   * Continuam públicas no HTML: é assim que PIX estático funciona.
   */
  pix: {
    key: process.env.NEXT_PUBLIC_PIX_KEY ?? "",
    receiverName: process.env.NEXT_PUBLIC_PIX_NAME ?? "",
    receiverCity: process.env.NEXT_PUBLIC_PIX_CITY ?? "CURITIBA",
  },

  /** Arte do hero. */
  hero: {
    /**
     * Painel de silhuetas que aparece dentro da porta.
     * PNG com fundo transparente, em /public. Vazio = espaço reservado.
     */
    silhouettes: "",
  },

  /** Abertura do site, antes da cena da porta. */
  intro: {
    /** Abóbora que vira a maçaneta. */
    pumpkin: "/abobora.png",
  },

  /** Endereço divulgado no topo do cartaz. */
  site: "@volvoween.com",

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
