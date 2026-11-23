"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"

export default function StoreHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useStore((s) => s.hydrate)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  return <>{children}</>
}
