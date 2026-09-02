/**
 * Fonte única de verdade da festa.
 * Tudo que muda de ano para ano (ou que o Gustavo quiser ajustar) mora aqui.
 * Campos marcados com TODO ainda precisam ser confirmados.
 */

/**
 * O valor da variável de ambiente, ou o padrão quando ela não diz nada.
 *
 * `??` não serve aqui: ele só cai no padrão quando a variável **não existe**, e
 * variável de ambiente é sempre texto. Criada em branco no painel da Vercel —
 * que é o passo mais fácil de errar — ela chega como `""`, atravessa o `??` e
 * derruba o que dependia dela. Foi assim que o PIX sumiu do site: a chave
 * existia, vazia, e o padrão nunca entrou.
 */
export function ouPadrao(valor: string | undefined, padrao: string): string {
  const limpo = valor?.trim();
  return limpo ? limpo : padrao;
}
export const event = {
  name: "Volvoween",
  /**
   * A frase que abre a descrição do site — o texto que aparece no resultado do
   * Google e nos previews de link.
   *
   * O trabalho dela é fazer um estranho clicar, então vale mais uma regra de
   * verdade da festa do que trocadilho: quem lê já sabe que precisa se fantasiar
   * antes de abrir o site.
   */
  tagline: "Fantasia obrigatória",
  edition: "2026",

  /** Data/hora oficial em horário de Brasília (UTC-03:00). */
  startsAt: "2026-10-16T19:00:00-03:00",
  /** Rótulo humano usado nos textos. */
  dateLabel: "16 de outubro",
  weekdayLabel: "sexta-feira",
  timeLabel: "19h",

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
    /** Valor por pessoa, em reais. */
    price: 85,
    /** Quantidade máxima de convidados. */
    capacity: 130,
    /**
     * Até quando dá para pagar. Depois disto o formulário sai do ar sozinho.
     *
     * O horário é o último segundo do dia, em Brasília: o prazo é "até o dia
     * 25", e quem paga às onze da noite do 25 pagou dentro do prazo.
     */
    deadline: "2026-09-25T23:59:59-03:00",
  },

  /**
   * Dados do recebedor do PIX. Vêm de variáveis de ambiente para poderem ser
   * trocadas na Vercel sem commit — e para a chave não ficar no histórico do git.
   * Continuam públicas no HTML: é assim que PIX estático funciona.
   */
  pix: {
    // Chave de telefone. As variáveis de ambiente continuam podendo
    // sobrescrever na Vercel sem commit; o valor abaixo é o padrão que já
    // funciona sem configurar nada — inclusive se a variável existir em branco.
    key: ouPadrao(process.env.NEXT_PUBLIC_PIX_KEY, "+5541996475299"),
    receiverName: ouPadrao(process.env.NEXT_PUBLIC_PIX_NAME, "VOLVOWEEN"),
    receiverCity: ouPadrao(process.env.NEXT_PUBLIC_PIX_CITY, "CURITIBA"),
  },

  /** Quem recebe os comprovantes e confirma as vagas. */
  organizacao: {
    /**
     * WhatsApp que recebe o comprovante. Só dígitos, com país e DDD — é o
     * formato que o link `wa.me` exige; com `+`, parênteses ou traço ele abre
     * o app sem a conversa.
     */
    whatsapp: ouPadrao(process.env.NEXT_PUBLIC_WHATSAPP, "5541996475299"),
  },

  /** Abertura do site, antes da cena da porta. */
  intro: {
    /** Abóbora que vira a maçaneta. */
    pumpkin: "/abobora.png",
  },

  /**
   * A festa vista pelo vão da porta. Todas as figuras são silhuetas pretas
   * recortadas da arte enviada, e ficam sobre o vermelho da luz.
   */
  crowd: {
    /**
     * Vultos ao fundo, na pista. A medida de cada recorte vem junto: eles têm
     * proporções bem diferentes entre si, e sem isso a bruxa — que é alta e
     * estreita — sairia esmagada na mesma caixa do vulto que segura a garrafa.
     */
    figures: [
      { src: "/vulto-bruxa.png", w: 142, h: 496 },
      { src: "/vulto-zumbi.png", w: 558, h: 656 },
      { src: "/vulto-zumbi2.png", w: 208, h: 526 },
      { src: "/vulto-garrafa.png", w: 409, h: 509 },
    ],
    /** Primeiro plano: garras brindando, cortadas na borda de baixo. */
    foreground: { src: "/garras-tacas.png", w: 422, h: 513 },
  },

  /** Cena da contagem regressiva. */
  bats: {
    /** Arte principal: o morcego grande. */
    scene: "/morcego.png",
    /** Sprites do bando, recortados da própria arte. */
    sprites: ["/morcego-voo-a.png", "/morcego-voo-b.png"],
  },

  /** Endereço divulgado no topo do cartaz. */
  site: "@volvoween.com",
} as const;

/** Data da festa como objeto Date (usada pela contagem regressiva). */
export const eventDate = new Date(event.startsAt);

/**
 * A data curta, como "16/10". É a que vai no cartaz, onde espaço é o que falta.
 *
 * Derivada de `startsAt`, e não escrita à parte: com duas fontes, um dia alguém
 * muda a data e esquece uma delas, e o cartaz passa a anunciar um dia e a
 * contagem regressiva outro. O fuso é declarado porque o horário é de Brasília
 * e, em UTC, uma festa à noite já cai no dia seguinte.
 */
export const shortDateLabel = eventDate.toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Sao_Paulo",
});

/** O fim do prazo de pagamento, como objeto Date. */
export const deadlineDate = new Date(event.ticket.deadline);

/**
 * O prazo escrito por extenso, como "25 de setembro".
 *
 * Derivado da própria data, e não digitado à parte: com dois campos, um dia
 * alguém muda a data e esquece o texto, e o site passa a prometer um prazo e
 * cobrar outro. É o mesmo risco que `startsAt` e `dateLabel` já correm.
 *
 * O fuso é declarado na marra. Sem ele o rótulo sai do fuso de quem renderiza:
 * o prazo termina às 23:59 de Brasília, que em UTC já é o dia seguinte — o
 * servidor escreveria "26 de setembro" e o navegador de quem está no Brasil
 * escreveria "25". Duas datas diferentes para o mesmo prazo.
 */
export const deadlineLabel = deadlineDate.toLocaleDateString("pt-BR", {
  day: "numeric",
  month: "long",
  timeZone: "America/Sao_Paulo",
});

/** Endereço completo em uma linha, do jeito que se lê em voz alta. */
export const fullAddress = `${event.venue.street} — ${event.venue.district}, ${event.venue.city}/${event.venue.state}, ${event.venue.zip}`;

/** Valor do ingresso formatado em reais. */
export const priceLabel = event.ticket.price.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
});
