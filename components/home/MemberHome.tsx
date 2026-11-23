"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import PlatformFeed from "@/components/ui/PlatformFeed"
import QuestionCard from "@/components/ui/QuestionCard"
import { type Question, type User } from "@/lib/store"
import { greetingFor } from "@/lib/greeting"
import { ArrowRight, Bookmark, HelpCircle, Sparkles, MessageCircleQuestion } from "lucide-react"

type Personalized = {
  myQuestions: Question[]
  recommended: Question[]
  unanswered: Question[]
  bookmarked: Question[]
  answeredByMe: Question[]
  focusTags: string[]
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function MemberHome({ user }: { user: User }) {
  const [data, setData] = useState<Personalized | null>(null)
  const [greeting, setGreeting] = useState(() => greetingFor(user.name))
  const isAdmin = user.role === "ADMIN"

  useEffect(() => {
    setGreeting(greetingFor(user.name))
  }, [user.name])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch("/api/home/personalized", { credentials: "include" })
      if (!res.ok) return
      const json = await res.json()
      if (!cancelled) setData(json)
    })()
    return () => {
      cancelled = true
    }
  }, [user.id])

  return (
    <div className="w-full max-w-[100vw]" style={{ overflowX: "clip" }}>
      <section className="border-b border-border bg-[hsl(var(--mesh-wash))]/35">
        <div className="studio-wrap py-12 md:py-16">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[hsl(var(--mesh-signal))] mb-3">
              Your mesh
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-3">
              {greeting.line}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8">{greeting.sub}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/ask">
                <Button className="rounded-lg h-11 px-6 font-semibold bg-foreground text-background gap-2">
                  Ask something
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <Link href="/tags">
                <Button variant="outline" className="rounded-lg h-11 px-6 font-semibold">
                  Follow tags
                </Button>
              </Link>
              <a href="#for-you">
                <Button variant="outline" className="rounded-lg h-11 px-6 font-semibold">
                  Jump to for you
                </Button>
              </a>
              {isAdmin && (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    className="rounded-lg h-11 px-5 font-semibold border-[hsl(var(--mesh-signal))]/40 text-[hsl(var(--mesh-signal))]"
                  >
                    Admin console
                  </Button>
                </Link>
              )}
            </div>
            {data?.focusTags && data.focusTags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground self-center mr-1">Your focus</span>
                {data.focusTags.map((tag) => (
                  <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}#feed`} className="tag-pill">
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section id="for-you" className="py-12 md:py-16 scroll-mt-16">
        <div className="studio-wrap space-y-12">
          <Rail
            icon={<HelpCircle className="h-4 w-4" />}
            title="Your questions"
            empty="You haven’t asked yet — start a thread."
            emptyHref="/ask"
            emptyCta="Ask a question"
            items={data?.myQuestions}
          />
          <Rail
            icon={<Sparkles className="h-4 w-4" />}
            title="Recommended for you"
            empty="Ask or answer a few threads so we can tailor this."
            items={data?.recommended}
          />
          <Rail
            icon={<MessageCircleQuestion className="h-4 w-4" />}
            title="Needs an answer"
            empty="No open threads in your topics right now."
            items={data?.unanswered}
          />
          {(data?.bookmarked?.length || 0) > 0 && (
            <Rail
              icon={<Bookmark className="h-4 w-4" />}
              title="Saved for later"
              items={data?.bookmarked}
            />
          )}
        </div>
      </section>

      <section id="feed" className="py-12 md:py-20 border-t border-border scroll-mt-16">
        <div className="studio-wrap mb-10">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[hsl(var(--mesh-signal))] mb-2">
            Live mesh
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            All threads
          </h2>
          <p className="mt-2 text-muted-foreground text-lg max-w-xl">
            Search and filter across the campus mesh.
          </p>
        </div>
        <Suspense fallback={<div className="studio-wrap py-16 text-muted-foreground">Loading…</div>}>
          <PlatformFeed />
        </Suspense>
      </section>
    </div>
  )
}

function Rail({
  icon,
  title,
  items,
  empty,
  emptyHref,
  emptyCta,
}: {
  icon: React.ReactNode
  title: string
  items?: Question[]
  empty?: string
  emptyHref?: string
  emptyCta?: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[hsl(var(--mesh-signal))]">{icon}</span>
        <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      {!items ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="studio-surface rounded-xl p-8 text-sm text-muted-foreground">
          <p>{empty}</p>
          {emptyHref && emptyCta && (
            <Link href={emptyHref} className="inline-block mt-4">
              <Button variant="outline" className="rounded-lg">
                {emptyCta}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  )
}
