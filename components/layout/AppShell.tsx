"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import SiteFooter from "@/components/layout/SiteFooter"
import StoreHydrator from "@/components/StoreHydrator"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuth = pathname === "/login" || pathname === "/register"

  return (
    <StoreHydrator>
      <Navbar />
      <main
        id="main-content"
        className="flex-1 flex flex-col w-full max-w-[100vw] relative z-0"
        style={{ overflowX: "clip" }}
      >
        {children}
      </main>
      {!isAuth && <SiteFooter />}
    </StoreHydrator>
  )
}
