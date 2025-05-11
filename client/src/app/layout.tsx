import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",  // CSS variable name for font reference
  subsets: ["latin"],            // Only load latin character set
  display: "swap",              // Optional: ensures text remains visible during webfont load
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",  // CSS variable name for font reference
  subsets: ["latin"],            // Only load latin character set
  display: "swap",              // Optional: ensures text remains visible during webfont load
});

export const metadata: Metadata = {
  title: "News Chat",
  description: "AI-powered news chat application",  // More descriptive
  keywords: ["news", "chat", "AI"],              // Added for SEO
  authors: [{ name: "Pramod Pachpule" }],              // Optional author credit
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}