import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casa de Memoria e Futuro | RC Agropecuaria",
  description:
    "Plataforma de memoria, acervo, curadoria e futuro institucional da RC Agropecuaria. 37 anos de historia preservados como patrimonio vivo.",
  openGraph: {
    title: "Casa de Memoria e Futuro",
    description:
      "O futuro passa pelo registro organizado, inteligente e sensivel da memoria.",
    siteName: "Casa de Memoria e Futuro - RC Agropecuaria",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased grain-overlay">{children}</body>
    </html>
  );
}
