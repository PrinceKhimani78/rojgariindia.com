import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalUIProvider } from "@/components/global/GlobalUIProvider";
import { GlobalThemeProvider } from "@/components/global/GlobalTheme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RojgariIndia.com",
  description:
    "We’re bridging the distance between people seeking work and the workplaces that need them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlobalThemeProvider>
          <GlobalUIProvider>{children}</GlobalUIProvider>
        </GlobalThemeProvider>
      </body>
    </html>
  );
}
