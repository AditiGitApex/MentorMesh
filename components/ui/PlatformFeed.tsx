"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import QuestionCard from "@/components/ui/QuestionCard"
import { Search, Filter, TrendingUp, Users, Bell } from "lucide-react"
import { useStore } from "@/lib/store"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type FeedMode = "all" | "following"

const FALLBACK_TAGS = ["AIML", "RAI", "CEA", "CSE", "CSIT", "IT", "Career"]

export default function PlatformFeed() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tagFromUrl = searchParams.get("tag") || ""
  const followingFromUrl = searchParams.get("following") === "1"
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTag, setFilterTag] = useState(tagFromUrl)
  const [mode, setMode] = useState<FeedMode>(followingFromUrl ? "following" : "all")
  const [followedTagNames, setFollowedTagNames] = useState<string[]>([])

  const currentUser = useStore((s) => s.currentUser)
  const questions = useStore((s) => s.questions)
  const users = useStore((s) => s.users)
  const refreshQuestions = useStore((s) => s.refreshQuestions)

  useEffect(() => {
    setFilterTag(tagFromUrl)
  }, [tagFromUrl])

  useEffect(() => {
    if (followingFromUrl) setMode("following")
  }, [followingFromUrl])

  // Always keep the full question list in the store — never overwrite with a tag-filtered API result.
  useEffect(() => {
    void refreshQuestions()
  }, [refreshQuestions])

  useEffect(() => {
    if (!currentUser) {
      setFollowedTagNames([])
      if (mode === "following") setMode("all")
      return
    }
    let cancelled = false
    ;(async () => {
      const res = await fetch("/api/tags/follow", { credentials: "include" })
      if (!res.ok || cancelled) return
      const json = await res.json()
      const tags = (json.tags || []) as { name: string }[]
      setFollowedTagNames(tags.map((t) => t.name))
    })()
    return () => {
      cancelled = true
    }
  }, [currentUser?.id, mode])

  const followedSet = useMemo(
    () => new Set(followedTagNames.map((t) => t.toLowerCase())),
    [followedTagNames]
  )

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    const tag = filterTag.trim().toLowerCase()
    const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")

    return questions.filter((question) => {
      if (mode === "following") {
        if (!currentUser) return false
        if (followedSet.size === 0) return false
        const overlaps = question.tags.some((t) => followedSet.has(t.toLowerCase()))
        if (!overlaps) return false
      }

      if (tag) {
        const tagMatch = question.tags.some((t) => t.toLowerCase().includes(tag))
        if (!tagMatch) return false
      }

      if (q) {
        const inTitle = question.title.toLowerCase().includes(q)
        const inBody = strip(question.description).toLowerCase().includes(q)
        const inTags = question.tags.some((t) => t.toLowerCase().includes(q))
        if (!inTitle && !inBody && !inTags) return false
      }

      return true
    })
  }, [questions, searchTerm, filterTag, mode, currentUser, followedSet])

  const tagCounts: Record<string, number> = {}
  questions.forEach((question) =>
    question.tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1
    })
  )
  const trending = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([t]) => t)
  const topMentors = [...users].sort((a, b) => b.reputation - a.reputation).slice(0, 3)

  const setTagFilter = (tag: string) => {
    const next = tag === filterTag ? "" : tag
    setFilterTag(next)
    const params = new URLSearchParams(searchParams.toString())
    if (next) params.set("tag", next)
    else params.delete("tag")
    const qs = params.toString()
    router.replace(qs ? `/?${qs}#feed` : "/#feed", { scroll: false })
  }

  const clearTag = () => setTagFilter("")

  return (
    <div className="studio-wrap grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-8">
      <div className="lg:col-span-8 flex flex-col gap-5">
        {currentUser && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "all" ? "default" : "outline"}
              className="rounded-lg"
              onClick={() => setMode("all")}
            >
              All threads
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "following" ? "default" : "outline"}
              className="rounded-lg gap-1.5"
              onClick={() => setMode("following")}
            >
              <Bell className="h-3.5 w-3.5" />
              Following
            </Button>
            <Link href="/tags" className="text-xs text-muted-foreground hover:text-foreground ml-1">
              Manage tags →
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <Input
              id="search"
              type="search"
              placeholder="Search title, details, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 rounded-xl bg-card border-border transition-colors duration-200"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden
            />
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Filter by tag..."
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              onBlur={() => {
                const trimmed = filterTag.trim()
                if (trimmed !== tagFromUrl) setTagFilter(trimmed)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  setTagFilter(filterTag.trim())
                }
              }}
              className="h-11 sm:w-48 pl-9 rounded-xl bg-card border-border transition-colors duration-200"
              aria-label="Filter by tag"
            />
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden
            />
          </div>
        </div>

        {mode === "following" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">From tags you follow:</span>
            {followedTagNames.length === 0 ? (
              <Link href="/tags" className="text-xs text-[hsl(var(--mesh-signal))] hover:underline">
                Follow tags to personalize this feed
              </Link>
            ) : (
              followedTagNames.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTagFilter(tag)}
                  className={
                    "tag-pill cursor-pointer" +
                    (filterTag.toLowerCase() === tag.toLowerCase()
                      ? " text-[hsl(var(--mesh-signal))] border-[hsl(var(--mesh-signal))]/40 bg-[hsl(var(--mesh-wash))]"
                      : "")
                  }
                >
                  {tag}
                </button>
              ))
            )}
          </div>
        )}

        {filterTag && (
          <div className="flex items-center gap-2 animate-scale-in">
            <span className="text-xs text-muted-foreground">Filtered by:</span>
            <button
              type="button"
              onClick={clearTag}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-[hsl(var(--mesh-signal))]/30 bg-[hsl(var(--mesh-wash))] text-[hsl(var(--mesh-signal))] hover:opacity-80 transition-opacity duration-200"
            >
              {filterTag} ×
            </button>
          </div>
        )}

        {searchTerm || filterTag || mode === "following" ? (
          <p className="text-sm text-muted-foreground -mb-1">
            {filtered.length} {filtered.length === 1 ? "thread" : "threads"}
            {mode === "following" ? " in your follows" : " found"}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {filtered.length > 0 ? (
            filtered.map((q, i) => (
              <div key={q.id} className="animate-fade-up" style={{ animationDelay: i * 40 + "ms" }}>
                <QuestionCard question={q} />
              </div>
            ))
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center animate-scale-in">
              <h3 className="font-display text-xl font-semibold mb-2">
                {mode === "following" ? "No followed threads yet" : "No threads found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {mode === "following"
                  ? "Follow branch tags to see related questions here."
                  : filterTag
                    ? `No threads match “${filterTag}”. Try another tag or clear the filter.`
                    : "Try another search, or ask the first question."}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {(filterTag || searchTerm) && (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => {
                      setSearchTerm("")
                      clearTag()
                    }}
                  >
                    Clear filters
                  </Button>
                )}
                <Link href={mode === "following" ? "/tags" : "/ask"}>
                  <Button className="rounded-lg bg-foreground text-background hover:opacity-85 transition-all duration-200">
                    {mode === "following" ? "Browse tags" : "Ask a question"}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-20 h-fit">
        <div className="bg-card border border-border rounded-xl p-5 animate-fade-up delay-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--mesh-signal))]" aria-hidden />
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Trending tags
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(trending.length ? trending : FALLBACK_TAGS).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tag)}
                className={
                  "tag-pill cursor-pointer transition-all duration-200" +
                  (filterTag.toLowerCase() === tag.toLowerCase()
                    ? " text-[hsl(var(--mesh-signal))] border-[hsl(var(--mesh-signal))]/40 bg-[hsl(var(--mesh-wash))]"
                    : "")
                }
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 animate-fade-up delay-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-[hsl(var(--mesh-signal))]" aria-hidden />
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Strong nodes
            </h3>
          </div>
          <ul className="flex flex-col gap-3">
            {topMentors.map((m, i) => (
              <li key={m.id}>
                <Link href={"/profile/" + m.id} className="flex items-center gap-3 group">
                  <div className="relative">
                    <Avatar className="h-9 w-9 border border-border group-hover:border-[hsl(var(--mesh-signal))]/40 transition-colors duration-200">
                      <AvatarImage src={m.avatar} alt="" />
                      <AvatarFallback className="bg-secondary text-xs font-semibold">
                        {m.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {i === 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500/90 text-[8px] font-bold text-white">
                        1
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold group-hover:text-[hsl(var(--mesh-signal))] truncate transition-colors duration-200">
                      {m.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.reputation.toLocaleString("en-US")} rep
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl p-5 border border-[hsl(var(--mesh-signal))]/25 bg-[hsl(var(--mesh-wash))] animate-fade-up delay-300">
          <h3 className="font-display text-base font-semibold mb-1.5">Strengthen the mesh</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Answer a thread. Reputation densifies where your expertise already lives.
          </p>
          <Link href="/ask">
            <Button
              variant="outline"
              className="w-full rounded-lg border-[hsl(var(--mesh-signal))]/30 hover:bg-card hover:border-[hsl(var(--mesh-signal))]/50 transition-all duration-200"
            >
              Contribute
            </Button>
          </Link>
        </div>
      </aside>
    </div>
  )
}
