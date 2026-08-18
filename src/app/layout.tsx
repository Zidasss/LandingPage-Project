import type { Metadata } from "next";
import { Monoton, Orbitron, Share_Tech_Mono, Space_Grotesk } from "next/font/google";
import { event } from "@/config/event";
import { VhsOverlay } from "@/components/VhsOverlay";
import "./globals.css";

const neon = Monoton({
  variable: "--font-neon",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const tech = Orbitron({
  variable: "--font-tech",
  subsets: ["latin"],
  display: "swap",
});

const term = Share_Tech_Mono({
  variable: "--font-term",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const text = Space_Grotesk({
  variable: "--font-text",
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
      className={`${neon.variable} ${tech.variable} ${term.variable} ${text.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        <VhsOverlay />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
