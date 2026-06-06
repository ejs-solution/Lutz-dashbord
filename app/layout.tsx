import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import AppShell from "@/components/layout/AppShell";
import SessionWrapper from "@/components/SessionWrapper";
import { BetaProvider } from "@/lib/beta-context";
import PWARegister from "@/components/PWARegister";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0908",
};

export const metadata: Metadata = {
  title: "CUTZ Solution",
  description: "Salon-Management · KI-Agent Paul",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CUTZ",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg",     type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={geist.variable} data-theme="dark">
      <body>
        <SessionWrapper>
          <ThemeProvider>
            <BetaProvider>
              <AppShell>{children}</AppShell>
            </BetaProvider>
          </ThemeProvider>
        </SessionWrapper>
        <PWARegister />
      </body>
    </html>
  );
}
