"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { Bookmark } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import QuestionCard from "@/components/ui/QuestionCard"
import { useRouter } from "next/navigation"
import type { Question } from "@/lib/store"

export default function BookmarksPage() {
  const currentUser = useStore((s) => s.currentUser)
  const hydrated = useStore((s) => s.hydrated)
  const router = useRouter()
  const [saved, setSaved] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated) return
    if (!currentUser) {
      router.push("/login")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const res = await fetch("/api/bookmarks", { credentials: "include" })
      if (!res.ok) {
        if (!cancelled) setLoading(false)
        return
      }
      const json = await res.json()
      if (!cancelled) {
        setSaved(json.questions || [])
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [currentUser, hydrated, router])

  if (!hydrated || !currentUser) {
    return (
      <div className="studio-wrap py-24 text-center text-muted-foreground">Loading…</div>
    )
  }

  return (
    <div className="studio-wrap py-12 md:py-16 pb-24">
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[hsl(var(--mesh-signal))] mb-3">
        Saved nodes
      </p>
      <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">Bookmarks</h1>
      <p className="text-lg text-muted-foreground mb-10 max-w-xl">
        Threads you pinned for later.
      </p>
      <div className="max-w-3xl flex flex-col gap-4">
        {loading ? (
          <p className="text-muted-foreground">Loading bookmarks…</p>
        ) : saved.length > 0 ? (
          saved.map((q) => <QuestionCard key={q.id} question={q} />)
        ) : (
          <div className="studio-surface rounded-xl p-12 text-center">
            <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-4" aria-hidden />
            <h2 className="font-display text-2xl font-semibold mb-2">No bookmarks yet</h2>
            <p className="text-muted-foreground mb-8">Save a thread when it matters.</p>
            <Link href="/#feed">
              <Button className="rounded-md h-11 px-6 font-semibold bg-foreground text-background">
                Explore threads
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
