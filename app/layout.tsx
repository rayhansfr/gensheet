import type { Metadata } from "next";
import Providers from '@/components/Providers'
import "./globals.css";

export const metadata: Metadata = {
  title: "GenSheet - Smart Checksheet Platform",
  description: "Create, manage, and execute custom checksheets with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
