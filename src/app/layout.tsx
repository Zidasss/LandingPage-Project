import type { Metadata } from "next";
import { Archivo, Chicle, Rubik_Wet_Paint, Share_Tech_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { event } from "@/config/event";
import { PaperGrain } from "@/components/PaperGrain";
import "./globals.css";

/** Gorda e ondulada: carrega o nome da festa e os títulos grandes. */
const poster = Chicle({
  variable: "--font-poster",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Escorrida, para os títulos de seção. Só funciona em corpo grande —
 * pequena, os pingos empastelam a leitura.
 */
const drip = Rubik_Wet_Paint({
  variable: "--font-drip",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

/** Grotesca de apoio: legendas, textos corridos e botões. */
const grotesk = Archivo({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

/** Monoespaçada para números, códigos e o código de barras. */
const term = Share_Tech_Mono({
  variable: "--font-term",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

/**
 * O endereço do site, para o card do link.
 *
 * WhatsApp, Instagram e afins não resolvem caminho relativo: sem um endereço
 * absoluto, a imagem do card simplesmente não aparece. A Vercel entrega o
 * domínio de produção em `VERCEL_PROJECT_PRODUCTION_URL`, então isto se resolve
 * sozinho no deploy e não depende de ninguém lembrar de configurar.
 */
const endereco =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/*
 * A imagem do card é `opengraph-image.png`, ao lado deste arquivo: o Next a
 * encontra pelo nome e monta as tags sozinho. Ela é um retrato da própria cena
 * do site — a porta aberta com o cartaz formado — e não um desenho à parte, que
 * envelheceria sem ninguém perceber.
 */
export const metadata: Metadata = {
  metadataBase: new URL(endereco),
  title: `${event.name} — ${event.dateLabel}`,
  description: `${event.tagline}. Festa de Halloween em ${event.venue.city} — ${event.dateLabel}, das ${event.timeLabel} às ${event.endTimeLabel}, na ${event.venue.name}. Confirme sua presença pelo PIX.`,
  openGraph: {
    title: `${event.name} — ${event.dateLabel}`,
    description: `${event.dateLabel}, ${event.timeLabel} · ${event.venue.name}. ${event.tagline}.`,
    type: "website",
    locale: "pt_BR",
    siteName: event.name,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${poster.variable} ${drip.variable} ${grotesk.variable} ${term.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        <PaperGrain />
        <main className="relative z-10">{children}</main>
        {/*
          A contagem de visitas da Vercel.

          Conta acesso, de onde veio o link, país e tipo de aparelho — e nada
          além disso. Não usa cookie, não segue ninguém entre sites e **não vê
          o formulário**: medido, a única coisa que ela chega a enfileirar é
          {"pageview", route "/"}. Digitar nome, e-mail e telefone não
          acrescenta nada à fila. O que ela mede é a página, não a pessoa —
          para uma lista de convidados isso importa mais do que parece.

          Rodar na sua máquina não polui o número, mas não é porque o script
          fique de fora: ele entra no HTML sempre. O que acontece é que
          /_vercel/insights/script.js só existe servido pela Vercel — em
          qualquer outro lugar ele dá 404, nada carrega e nada é registrado.

          **Falta um passo, e é fora do código:** ligar em Vercel → o projeto →
          aba Analytics → Enable. Sem isso o painel fica vazio para sempre,
          mesmo com este componente no ar.
        */}
        <Analytics />
      </body>
    </html>
  );
}
