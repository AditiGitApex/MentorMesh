"use client"

import { useEffect, useMemo, useRef } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

export type MeshSeed = {
  id: string
  label: string
  kind: "mentor" | "question" | "answer" | "ambient"
  href?: string
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  pulse: number
  label?: string
  kind: MeshSeed["kind"]
  seeded: boolean
  href?: string
}

export default function MeshField({
  className = "",
  density = 36,
  interactive = true,
  seeds = [],
  active = true,
}: {
  className?: string
  density?: number
  interactive?: boolean
  seeds?: MeshSeed[]
  active?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Particle[]>([])
  const { resolvedTheme } = useTheme()
  const router = useRouter()
  const mouse = useRef({ x: -9999, y: -9999 })
  const reduced = useRef(false)
  const seedsKey = useMemo(() => seeds.map((s) => `${s.id}:${s.href || ""}`).join("|"), [seeds])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    reduced.current = mq.matches
    const on = () => {
      reduced.current = mq.matches
    }
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    let running = true
    const isDark = resolvedTheme === "dark"

    const hash = (s: string) => {
      let n = 0
      for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) | 0
      return Math.abs(n)
    }

    const resize = () => {
      const parent = canvas.parentElement
      w = Math.max(1, parent?.clientWidth || window.innerWidth)
      h = Math.max(1, parent?.clientHeight || window.innerHeight)
      const dpr = Math.min(window.devicePixelRatio || 1, w < 768 ? 1.4 : 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const ambientCount = Math.max(10, Math.floor((w * h) / (w < 768 ? 28000 : 18000 / (density / 36))))

      const seeded: Particle[] = seeds.map((s, i) => {
        const col = (i % 3) + 1
        const row = Math.floor(i / 3) + 1
        return {
          x: Math.min(w - 28, Math.max(28, (col / 4) * w * 0.72 + w * 0.14 + (hash(s.id) % 30) - 15)),
          y: Math.min(h - 28, Math.max(28, (row / 4) * h * 0.5 + h * 0.22 + (hash(s.id + "y") % 28) - 14)),
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          r: s.kind === "mentor" ? 3 : 2.4,
          pulse: Math.random() * Math.PI * 2,
          label: s.label.length > 16 ? s.label.slice(0, 14) + "…" : s.label,
          kind: s.kind,
          seeded: true,
          href: s.href,
        }
      })

      nodesRef.current = [
        ...seeded,
        ...Array.from({ length: ambientCount }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 0.9 + Math.random() * 1.4,
          pulse: Math.random() * Math.PI * 2,
          kind: "ambient" as const,
          seeded: false,
        })),
      ]
    }

    resize()
    window.addEventListener("resize", resize)

    const onMove = (e: PointerEvent) => {
      if (!interactive) return
      const rect = canvas.getBoundingClientRect()
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const hit = nodesRef.current.find(
        (n) => n.seeded && n.href && Math.hypot(n.x - mouse.current.x, n.y - mouse.current.y) < n.r + 14
      )
      canvas.style.cursor = hit ? "pointer" : "default"
    }
    const onLeave = () => {
      mouse.current = { x: -9999, y: -9999 }
      canvas.style.cursor = "default"
    }
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const hit = nodesRef.current.find((n) => n.seeded && n.href && Math.hypot(n.x - x, n.y - y) < n.r + 14)
      if (hit?.href) router.push(hit.href)
    }

    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerleave", onLeave)
    canvas.addEventListener("click", onClick)

    const line = isDark ? "rgba(107, 155, 136, 0.18)" : "rgba(47, 93, 80, 0.16)"
    const signal = isDark ? "rgba(107, 155, 136, 0.9)" : "rgba(47, 93, 80, 0.85)"
    const ink = isDark ? "rgba(240, 236, 228, 0.55)" : "rgba(40, 36, 32, 0.45)"
    const labelC = isDark ? "rgba(240, 236, 228, 0.45)" : "rgba(40, 36, 32, 0.4)"

    const paint = () => {
      const nodes = nodesRef.current
      const maxDist = Math.min(140, Math.max(85, w * 0.1))
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          const limit = a.seeded && b.seeded ? maxDist * 1.3 : maxDist
          if (d < limit) {
            ctx.beginPath()
            ctx.strokeStyle = a.seeded && b.seeded ? signal : line
            ctx.globalAlpha = (1 - d / limit) * (a.seeded && b.seeded ? 0.5 : 0.9)
            ctx.lineWidth = 1
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      for (const n of nodes) {
        const color = n.kind === "mentor" || n.kind === "answer" ? signal : ink
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.globalAlpha = n.seeded ? 1 : 0.65 + Math.sin(n.pulse) * 0.15
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
        if (n.seeded && n.label && w >= 700) {
          ctx.globalAlpha = 1
          ctx.font = "500 11px var(--font-body), DM Sans, sans-serif"
          ctx.fillStyle = labelC
          ctx.textAlign = "center"
          ctx.fillText(n.label, n.x, n.y + n.r + 14)
        }
      }
      ctx.globalAlpha = 1
    }

    const draw = () => {
      if (!running) return
      if (!active) {
        raf = requestAnimationFrame(draw)
        return
      }
      const nodes = nodesRef.current
      if (!reduced.current) {
        for (const n of nodes) {
          n.x += n.vx
          n.y += n.vy
          n.pulse += 0.015
          if (n.x < 8 || n.x > w - 8) n.vx *= -1
          if (n.y < 8 || n.y > h - 8) n.vy *= -1
          n.x = Math.min(w - 8, Math.max(8, n.x))
          n.y = Math.min(h - 8, Math.max(8, n.y))
          const dx = n.x - mouse.current.x
          const dy = n.y - mouse.current.y
          if (Math.hypot(dx, dy) < 120) {
            n.x += dx * -0.008
            n.y += dy * -0.008
          }
        }
      }
      paint()
      if (reduced.current) return
      raf = requestAnimationFrame(draw)
    }

    if (reduced.current) paint()
    else draw()

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerleave", onLeave)
      canvas.removeEventListener("click", onClick)
    }
  }, [resolvedTheme, density, interactive, seedsKey, active, router, seeds])

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} aria-hidden />
}
