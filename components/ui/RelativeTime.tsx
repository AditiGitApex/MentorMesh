"use client"

import { useEffect, useState } from "react"

export function formatDate(iso: string, style: "short" | "long" = "short") {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString(
    "en-US",
    style === "long"
      ? { year: "numeric", month: "long", day: "numeric" }
      : { year: "numeric", month: "short", day: "numeric" }
  )
}

export function RelativeTime({ date, className }: { date: string; className?: string }) {
  const [label, setLabel] = useState(() => formatDate(date, "short"))

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { formatDistanceToNow } = await import("date-fns")
        if (!cancelled) setLabel(formatDistanceToNow(new Date(date), { addSuffix: true }))
      } catch {
        /* keep absolute */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [date])

  return (
    <time dateTime={date} className={className} suppressHydrationWarning>
      {label}
    </time>
  )
}
