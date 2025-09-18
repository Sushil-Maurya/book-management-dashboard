import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "@/app/globals.css"
import CssBaseline from "@mui/material/CssBaseline"
import { AppLayout } from "@/components/app-layout"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Book Management Dashboard",
  description: "A comprehensive dashboard for managing book inventory with CRUD operations",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultTheme="system" storageKey="book-dashboard-theme">
          <CssBaseline />
          <Suspense fallback={null}>
            <AppLayout>{children}</AppLayout>
          </Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
