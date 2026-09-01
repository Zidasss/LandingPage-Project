import type { Metadata } from "next";
import { Archivo, Chicle, Rubik_Wet_Paint, Share_Tech_Mono } from "next/font/google";
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
  description: `${event.tagline}. Festa de Halloween em ${event.dateLabel}, ${event.timeLabel}. Confirme sua presença pelo PIX.`,
  openGraph: {
    title: `${event.name} — ${event.dateLabel}`,
    description: `${event.dateLabel}, ${event.timeLabel} · ${event.venue.name}. Fantasia obrigatória.`,
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
      </body>
    </html>
  );
}
