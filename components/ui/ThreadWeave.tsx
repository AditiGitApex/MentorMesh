"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

const ease = [0.22, 1, 0.36, 1] as const

export default function ThreadWeave() {
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)
  const questions = useStore((s) => s.questions)
  const users = useStore((s) => s.users)

  const featured = useMemo(() => {
    const withAnswer =
      questions.find((q) => q.answers.some((a) => a.isAccepted)) ||
      questions.find((q) => q.answers.length > 0) ||
      questions[0]
    if (!withAnswer) return null
    const answer = withAnswer.answers.find((a) => a.isAccepted) || withAnswer.answers[0]
    const mentor = answer ? users.find((u) => u.id === answer.authorId) : undefined
    return { question: withAnswer, answer, mentor }
  }, [questions, users])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(true)
      return
    }
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!featured) return null
  const { question, answer, mentor } = featured
  const preview = answer
    ? answer.content.replace(/<[^>]+>/g, "").slice(0, 130)
    : "Waiting for the first edge..."

  const items = [
    { key: "q", body: <Card kind="q" title={question.title} tags={question.tags} />, cls: "w-full" },
    { key: "d1", body: <Dot active={active} delay={0.4} />, cls: "" },
    {
      key: "m",
      body: (
        <Card
          kind="m"
          title={mentor?.name || answer?.author || "Mentor"}
          sub={mentor ? `${mentor.reputation.toLocaleString("en-US")} reputation` : undefined}
        />
      ),
      cls: "w-full max-w-md",
    },
    { key: "d2", body: <Dot active={active} delay={0.6} />, cls: "" },
    {
      key: "a",
      body: <Card kind="a" title={`${preview}${preview.length >= 130 ? "..." : ""}`} />,
      cls: "w-full",
    },
    {
      key: "s",
      body: (
        <div className="flex flex-col items-center gap-3 pt-1">
          <p className="text-sm font-medium text-[hsl(var(--mesh-signal))] tracking-wide">
            Thread resolved
          </p>
          <Link href={`/questions/${question.id}`}>
            <Button
              variant="outline"
              className="rounded-xl border-[hsl(var(--mesh-signal))]/35 hover:bg-[hsl(var(--mesh-wash))] hover:border-[hsl(var(--mesh-signal))]/50 transition-all duration-200"
            >
              Open this thread
            </Button>
          </Link>
        </div>
      ),
      cls: "w-full",
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative border-y border-border py-20 md:py-28"
      aria-labelledby="weave-heading"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, hsl(var(--mesh-wash) / 0.4) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="studio-wrap relative z-10 flex flex-col items-center text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[hsl(var(--mesh-signal))] mb-3">
          How it works
        </p>
        <h2
          id="weave-heading"
          className="font-display text-3xl md:text-4xl font-semibold tracking-tight max-w-lg mb-12 md:mb-14"
        >
          A real thread, woven.
        </h2>

        <div className="relative w-full max-w-xl mx-auto">
          <motion.div
            className="absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-[hsl(var(--mesh-signal))]/60 via-[hsl(var(--mesh-signal))]/30 to-transparent"
            aria-hidden
            initial={{ scaleY: 0 }}
            animate={active ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 1.1, ease }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-7">
            {items.map((item, i) => (
              <motion.div
                key={item.key}
                className={item.cls}
                initial={{ opacity: 0, y: 28 }}
                animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
                transition={{ duration: 0.55, ease, delay: active ? i * 0.14 : 0 }}
              >
                {item.body}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Dot({ active, delay }: { active: boolean; delay: number }) {
  return (
    <motion.span
      className="relative z-20 flex h-3 w-3 items-center justify-center"
      aria-hidden
      initial={{ scale: 0, opacity: 0 }}
      animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <span className="absolute h-3 w-3 rounded-full bg-[hsl(var(--mesh-signal))] animate-pulse-dot" />
      <span className="h-2 w-2 rounded-full bg-[hsl(var(--mesh-signal))] ring-[4px] ring-background relative z-10" />
    </motion.span>
  )
}

function Card({
  kind,
  title,
  sub,
  tags,
}: {
  kind: "q" | "m" | "a"
  title: string
  sub?: string
  tags?: string[]
}) {
  const label = kind === "q" ? "Question" : kind === "m" ? "Mentor" : "Answer"
  return (
    <div
      className={`bg-card border rounded-xl p-5 sm:p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md ${
        kind === "q"
          ? "border-[hsl(var(--mesh-signal))]/40 border-t-2 border-t-[hsl(var(--mesh-signal))]"
          : "border-border hover:border-[hsl(var(--mesh-signal))]/25"
      }`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.18em] mb-2.5 ${
          kind === "m" ? "text-[hsl(var(--mesh-signal))]" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      <p
        className={`font-display font-semibold leading-snug ${
          kind === "q" ? "text-lg sm:text-xl" : "text-base"
        } ${
          kind === "a" ? "!font-sans !font-medium text-sm text-foreground/80" : ""
        }`}
      >
        {title}
      </p>
      {sub && <p className="text-sm text-muted-foreground mt-1.5">{sub}</p>}
      {tags && (
        <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
          {tags.slice(0, 3).map((t) => (
            <span key={t} className="tag-pill">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}