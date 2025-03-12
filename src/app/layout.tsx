import type { Metadata } from "next";
import { Inter as GeistSans, Roboto_Mono as GeistMono } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { AccessibilityFeatures } from "@/components/AccessibilityFeatures";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "@/styles/accessibility.css";

const geistSans = GeistSans({ 
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = GeistMono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Bingo - Job Coach Platform",
  description: "A comprehensive job coaching platform for individuals with disabilities",
  keywords: ["job coaching", "accessibility", "employment", "disabilities", "career development"],
  authors: [{ name: "Bingo Team" }],
  creator: "Bingo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AccessibilityProvider>
              <main id="main-content" tabIndex={-1}>
                {children}
              </main>
              <AccessibilityFeatures />
              <Toaster position="bottom-right" />
            </AccessibilityProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
