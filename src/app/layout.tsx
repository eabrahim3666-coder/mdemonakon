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
  title: "Md. Emon — Software Developer",
  description:
    "Portfolio of Md. Emon — Software Developer. Explore projects, skills and ways to get in touch.",
  keywords: ["Portfolio", "Md. Emon", "Developer", "Software Developer", "Backend", "Interactive", "Web Development", "Full Stack", "Next.js", "React"],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  openGraph: {
    title: "Md. Emon — Software Developer",
    description: "Portfolio of Md. Emon — Software Developer",
    siteName: "Md. Emon Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Md. Emon — Software Developer",
    description: "Portfolio of Md. Emon — Software Developer",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Hard light lock — prevents browsers from auto-darkening the page */}
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body className={`${inter.variable} bg-background font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
