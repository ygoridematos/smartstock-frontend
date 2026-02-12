import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Configuração das fontes otimizadas do Google via Next.js
// Isso evita "Layout Shift" e melhora a performance de carregamento.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadados para SEO e identificação da página na aba do navegador
export const metadata: Metadata = {
  title: "SmartStock - Gestão de Estoque",
  description: "Sistema profissional para gerenciamento de produtos e estoque.",
};

/**
 * LAYOUT PRINCIPAL (RootLayout)
 * Envolve TODAS as páginas da aplicação.
 * É o lugar ideal para Navbar, Footer e contextos globais.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
