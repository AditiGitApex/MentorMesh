import type { Metadata } from "next"
import { Fraunces, DM_Sans } from "next/font/google"
import "./globals.css"
import AppShell from "@/components/layout/AppShell"
import { ThemeProvider } from "@/components/theme-provider"

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
})

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "MentorMesh — Knowledge, woven",
  description:
    "A calm Q&A studio where questions, mentors, and answers connect with intent.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <body
        className="min-h-screen flex flex-col studio-atmosphere text-foreground relative max-w-[100vw]"
        style={{ overflowX: "clip" }}
        suppressHydrationWarning
      >
        <div className="studio-grain" aria-hidden />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-card focus:text-foreground focus:px-4 focus:py-2 focus:border focus:border-border"
        >
          Skip to content
        </a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
