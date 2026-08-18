import type { Metadata } from "next";
import { Anton, Archivo, Pinyon_Script, Share_Tech_Mono } from "next/font/google";
import { event } from "@/config/event";
import { PaperGrain } from "@/components/PaperGrain";
import "./globals.css";

/** Condensada e pesada: a tipografia de cartaz que carrega o nome. */
const poster = Anton({
  variable: "--font-poster",
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

/** Manuscrita, usada em uma palavra só — o contraponto do cartaz. */
const script = Pinyon_Script({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${event.name} — ${event.dateLabel}`,
  description: `${event.tagline}. Festa de Halloween em ${event.dateLabel}, ${event.timeLabel}. Confirme sua presença pelo PIX.`,
  openGraph: {
    title: `${event.name} — ${event.dateLabel}`,
    description: event.tagline,
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${poster.variable} ${grotesk.variable} ${term.variable} ${script.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        <PaperGrain />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
