import type { Metadata } from "next"
import "./globals.css"
import AppShell from "@/components/layout/AppShell"
import { ThemeProvider } from "@/components/theme-provider"

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
    <html lang="en" suppressHydrationWarning className="font-body">
      <head>
        {/* Load fonts via CSS links — more reliable on Vercel than next/font Google fetch */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
      </head>
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
