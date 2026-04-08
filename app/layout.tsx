import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/toaster";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ThemeScript } from "@/components/theme-script";
import { AuthBootstrap } from "@/components/auth-bootstrap";

export const metadata: Metadata = {
  title: "MyStore",
  description: "Buy cool products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-white transition-colors duration-300">
        <ThemeScript />
        <AuthBootstrap />
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
