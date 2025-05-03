import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import DebugSupabaseConnection from "@/components/debug-supabase-connection"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shrobe - Share Your Style",
  description: "Buy, trade, and rent fashion. Share your style with the world.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>
          {children}
        </main>
        {/* Debug component to help diagnose Supabase connection issues */}
        <DebugSupabaseConnection />
      </body>
    </html>
  )
}
