import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rodrigo & Gabrielle | Nosso Casamento",
  description: "Uma história de amor escrita por Deus. Confirme sua presença em nosso casamento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0f0b18] text-[#fdfcf7] overflow-x-hidden selection:bg-[#cba8eb]/30 selection:text-[#fdfcf7]">
        {children}
      </body>
    </html>
  );
}
