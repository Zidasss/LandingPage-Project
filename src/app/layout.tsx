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
      className={`${poster.variable} ${drip.variable} ${grotesk.variable} ${term.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        {/*
          Roda antes de a abertura ser pintada: quem já viu não pode ver nem um
          quadro de tela preta. Decidir isso depois da hidratação piscaria.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{if(localStorage.getItem("volvoween:intro"))document.documentElement.dataset.introVista="1"}catch(e){}',
          }}
        />
        <PaperGrain />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
