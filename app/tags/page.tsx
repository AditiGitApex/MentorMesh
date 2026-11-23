"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { BellPlus, BellOff } from "lucide-react"

type TagRow = {
  id?: string
  name: string
  count: number
  followers?: number
  following?: boolean
}

export default function TagsPage() {
  const currentUser = useStore((s) => s.currentUser)
  const [sorted, setSorted] = useState<TagRow[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch("/api/tags", { credentials: "include" })
    if (!res.ok) return
    const json = await res.json()
    setSorted(json.tags || [])
  }

  useEffect(() => {
    void load()
  }, [currentUser?.id])

  const toggleFollow = async (tag: TagRow) => {
    if (!currentUser) return
    setBusy(tag.name)
    const res = await fetch("/api/tags/follow", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: tag.name, tagId: tag.id }),
    })
    setBusy(null)
    if (!res.ok) return
    const json = await res.json()
    setSorted((rows) =>
      rows.map((r) =>
        r.name === tag.name
          ? {
              ...r,
              following: json.following,
              followers: Math.max(0, (r.followers || 0) + (json.following ? 1 : -1)),
            }
          : r
      )
    )
  }

  return (
    <div className="studio-wrap py-12 md:py-16 pb-24">
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[hsl(var(--mesh-signal))] mb-3">
        Topics
      </p>
      <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">Tags</h1>
      <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
        Follow branch and topic tags to get notified when new threads appear.
        {!currentUser && (
          <>
            {" "}
            <Link href="/login" className="text-[hsl(var(--mesh-signal))] hover:underline">
              Sign in
            </Link>{" "}
            to follow.
          </>
        )}
      </p>

      {currentUser && (
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Following
          </p>
          <div className="flex flex-wrap gap-2">
            {sorted.filter((t) => t.following).length === 0 ? (
              <p className="text-sm text-muted-foreground">No followed tags yet — pick a branch below.</p>
            ) : (
              sorted
                .filter((t) => t.following)
                .map((t) => (
                  <Link key={`f-${t.name}`} href={`/?tag=${encodeURIComponent(t.name)}#feed`} className="tag-pill">
                    {t.name}
                  </Link>
                ))
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((row) => (
          <div
            key={row.name}
            className="studio-surface rounded-xl p-5 hover:border-[hsl(var(--mesh-signal))]/40 transition-colors group flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <Link href={`/?tag=${encodeURIComponent(row.name)}#feed`} className="min-w-0">
                <div className="font-display text-lg font-semibold group-hover:text-[hsl(var(--mesh-signal))] mb-1 truncate">
                  {row.name}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground tabular-nums">{row.count}</span>{" "}
                  {row.count === 1 ? "thread" : "threads"}
                  {typeof row.followers === "number" && (
                    <>
                      {" "}
                      · <span className="tabular-nums">{row.followers}</span> following
                    </>
                  )}
                </p>
              </Link>
              {currentUser && (
                <Button
                  type="button"
                  size="sm"
                  variant={row.following ? "secondary" : "outline"}
                  className="rounded-lg shrink-0 gap-1.5"
                  disabled={busy === row.name}
                  onClick={() => void toggleFollow(row)}
                >
                  {row.following ? (
                    <>
                      <BellOff className="h-3.5 w-3.5" />
                      Following
                    </>
                  ) : (
                    <>
                      <BellPlus className="h-3.5 w-3.5" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="col-span-full studio-surface rounded-lg p-12 text-center text-muted-foreground">
            No tags yet.
          </div>
        )}
      </div>
    </div>
  )
}
