"use client"

import { Suspense, useMemo, useRef, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import PlatformFeed from "@/components/ui/PlatformFeed"
import ThreadWeave from "@/components/ui/ThreadWeave"
import { MeshMark } from "@/components/ui/MeshMark"
import { motion } from "framer-motion"
import { useStore } from "@/lib/store"
import type { MeshSeed } from "@/components/ui/MeshField"
import { ArrowRight } from "lucide-react"

const MeshField = dynamic(() => import("@/components/ui/MeshField"), {
  ssr: false,
  loading: () => null,
})

function useInView(ref: React.RefObject<Element | null>) {
  const [v, setV] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: "80px" })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return v
}

function HeroMesh() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wrapRef)
  const questions = useStore((s) => s.questions)
  const users = useStore((s) => s.users)

  const seeds: MeshSeed[] = useMemo(() => {
    const mentors = [...users]
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, 3)
      .map((u) => ({
        id: `m-${u.id}`,
        label: u.name.split(" ")[0],
        kind: "mentor" as const,
        href: `/profile/${u.id}`,
      }))
    const qs = questions.slice(0, 4).map((q) => ({
      id: `q-${q.id}`,
      label: q.tags[0] || q.title.slice(0, 12),
      kind: "question" as const,
      href: `/questions/${q.id}`,
    }))
    return [...mentors, ...qs]
  }, [questions, users])

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <MeshField density={34} seeds={seeds} active={inView} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 40%, hsl(var(--background) / 0.15) 0%, hsl(var(--background) / 0.85) 70%, hsl(var(--background)) 100%)",
        }}
      />
    </div>
  )
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function GuestHome() {
  const questions = useStore((s) => s.questions)
  const users = useStore((s) => s.users)

  return (
    <div className="w-full max-w-[100vw]" style={{ overflowX: "clip" }}>
      <section className="relative min-h-[calc(100vh-3.5rem)] w-full overflow-hidden border-b border-border">
        <HeroMesh />
        <div className="studio-wrap relative z-10 flex min-h-[calc(100vh-3.5rem)] flex-col justify-center py-16 md:py-24">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl">
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[hsl(var(--mesh-signal))] bg-[hsl(var(--mesh-wash))] border border-[hsl(var(--mesh-signal))]/20 px-3 py-1.5 rounded-full">
                <MeshMark size={13} className="animate-pulse-dot" />
                MentorMesh
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-foreground leading-[1.02] mb-5"
            >
              Knowledge,{" "}
              <br />
              <span className="text-[hsl(var(--mesh-signal))] relative inline-block">
                woven.
                <span
                  className="absolute -bottom-1 left-0 w-full h-px bg-[hsl(var(--mesh-signal))]/30 rounded-full"
                  aria-hidden
                />
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed mb-8"
            >
              A calm campus studio for structured Q&amp;A. Browse threads as a guest — or sign in
              with your enrollment mail to make it yours.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="rounded-lg h-11 px-6 font-semibold bg-foreground text-background hover:opacity-85 transition-all duration-200 group gap-2"
                >
                  Join the mesh
                  <ArrowRight
                    className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200"
                    aria-hidden
                  />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-lg h-11 px-6 font-semibold border-border bg-card/60 hover:bg-secondary/70"
                >
                  Sign in
                </Button>
              </Link>
              <a href="#weave">
                <Button size="lg" variant="ghost" className="rounded-lg h-11 px-4 font-medium">
                  How it works
                </Button>
              </a>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="mt-10 flex items-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground font-semibold text-base tabular-nums">
                  {questions.length || "—"}
                </span>
                <span className="text-[11px]">Live threads</span>
              </div>
              <span className="w-px h-4 bg-border" aria-hidden />
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground font-semibold text-base tabular-nums">
                  {users.length || "—"}
                </span>
                <span className="text-[11px]">Active members shown</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div id="weave" className="scroll-mt-14">
        <ThreadWeave />
      </div>

      <section id="feed" className="py-16 md:py-24 scroll-mt-16">
        <div className="studio-wrap mb-10">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[hsl(var(--mesh-signal))] mb-2">
            Public mesh
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            Explore threads
          </h2>
          <p className="mt-2 text-muted-foreground text-lg max-w-xl">
            Browse as a guest. Sign in to ask, answer, and save.
          </p>
        </div>
        <Suspense fallback={<div className="studio-wrap py-16 text-muted-foreground">Loading…</div>}>
          <PlatformFeed />
        </Suspense>
      </section>
    </div>
  )
}
