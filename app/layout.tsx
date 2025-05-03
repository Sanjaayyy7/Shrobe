
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Header from "@/components/header";
import "./globals.css";
import type React from "react";


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shrobe - Share Your Style",
  description: "Buy, trade, and rent fashion. Share your style with the world.",

  generator: "v0.dev",
};


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}


