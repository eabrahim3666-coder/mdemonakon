import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Toukoum Portfolio",
  description:
    "Interactive portfolio with an AI-powered Memoji that answers questions about me, my skills, and my experience",
  keywords: ["Portfolio", "Developer", "AI", "Interactive", "Memoji", "Web Development", "Full Stack", "Next.js", "React"],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  openGraph: {
    title: "Toukoum Portfolio",
    description: "Interactive portfolio with an AI-powered Memoji that answers questions about me",
    siteName: "Toukoum Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toukoum Portfolio",
    description: "Interactive portfolio with an AI-powered Memoji that answers questions about me",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-background font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
