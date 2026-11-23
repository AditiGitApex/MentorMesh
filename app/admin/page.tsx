"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatDate } from "@/components/ui/RelativeTime"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Shield, UserPlus, UserMinus } from "lucide-react"

type Stats = {
  questions: number
  answers: number
  members: number
  unanswered: number
  askedToday: number
  answeredToday: number
  reported: number
}

type Recent = {
  id: string
  title: string
  author: string
  authorEmail?: string
  answers: number
  date: string
}

type AdminUser = {
  id: string
  name: string
  email: string
  role: "USER" | "ADMIN"
  reputation: number
  enrollmentNo: string | null
  branch?: string | null
  questions: number
  answers: number
  date: string
}

export default function AdminPanelPage() {
  const currentUser = useStore((s) => s.currentUser)
  const refreshQuestions = useStore((s) => s.refreshQuestions)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Recent[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch("/api/admin/stats", { credentials: "include" })
    if (res.status === 403 || res.status === 401) {
      setError("Admin access only. This console is hidden from regular members.")
      return
    }
    if (!res.ok) {
      setError("Could not load admin stats.")
      return
    }
    const json = await res.json()
    setStats(json.stats)
    setRecent(json.recent || [])
  }

  const loadUsers = async (q = query) => {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`, {
      credentials: "include",
    })
    if (!res.ok) return
    const json = await res.json()
    setUsers(json.users || [])
  }

  useEffect(() => {
    if (currentUser?.role !== "ADMIN") {
      if (currentUser) setError("Admin access only. This console is hidden from regular members.")
      else setError("Sign in as an admin to open this console.")
      return
    }
    setError("")
    void load()
    void loadUsers("")
  }, [currentUser])

  const deleteQuestion = async (id: string) => {
    if (!confirm("Delete this thread permanently?")) return
    setBusy(id)
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    setBusy(null)
    if (res.ok) {
      setRecent((r) => r.filter((x) => x.id !== id))
      void refreshQuestions()
      void load()
    }
  }

  const patchUser = async (id: string, body: { role?: "USER" | "ADMIN"; reputationDelta?: number }) => {
    setBusy(id)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setBusy(null)
    if (res.ok) void loadUsers()
  }

  if (error) {
    return (
      <div className="studio-wrap py-24 text-center">
        <Shield className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <h1 className="font-display text-2xl font-semibold mb-3">Admin</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
        <Link href="/" className="text-[hsl(var(--mesh-signal))] hover:underline">
          Return home
        </Link>
      </div>
    )
  }

  if (!stats) {
    return <div className="studio-wrap py-24 text-center text-muted-foreground">Loading admin…</div>
  }

  const cards = [
    { label: "Questions", value: stats.questions },
    { label: "Answers", value: stats.answers },
    { label: "Members", value: stats.members },
    { label: "Unanswered", value: stats.unanswered },
    { label: "Asked today", value: stats.askedToday },
    { label: "Answers today", value: stats.answeredToday },
  ]

  return (
    <div className="studio-wrap max-w-5xl py-12 md:py-16 pb-24">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[hsl(var(--mesh-signal))] mb-3">
            Ops · admin only
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight mb-2">Admin console</h1>
          <p className="text-muted-foreground">
            Moderate threads, inspect members, and tune reputation. Invisible to non-admins.
          </p>
        </div>
        <Shield className="h-8 w-8 text-[hsl(var(--mesh-signal))] shrink-0" aria-hidden />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {cards.map((s) => (
          <div key={s.label} className="studio-surface rounded-lg p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {s.label}
            </p>
            <p className="font-display text-3xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="studio-surface rounded-xl overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Moderate recent threads</h2>
        </div>
        <ul className="divide-y divide-border">
          {recent.map((q) => (
            <li key={q.id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="min-w-0">
                <Link
                  href={`/questions/${q.id}`}
                  className="font-medium truncate hover:text-[hsl(var(--mesh-signal))] block"
                >
                  {q.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {q.author} · {q.answers} answers · {formatDate(q.date, "short")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive shrink-0"
                disabled={busy === q.id}
                onClick={() => void deleteQuestion(q.id)}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="studio-surface rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <h2 className="font-display text-lg font-semibold">Members</h2>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              void loadUsers(query)
            }}
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, enrollment…"
              className="h-9 sm:w-64"
            />
            <Button type="submit" variant="outline" size="sm" className="h-9">
              Search
            </Button>
          </form>
        </div>
        <ul className="divide-y divide-border">
          {users.map((u) => (
            <li key={u.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${u.id}`} className="font-semibold hover:text-[hsl(var(--mesh-signal))]">
                    {u.name}
                  </Link>
                  {u.role === "ADMIN" && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[hsl(var(--mesh-wash))] text-[hsl(var(--mesh-signal))]">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {u.email}
                  {u.enrollmentNo ? ` · ${u.enrollmentNo}` : ""}
                  {u.branch ? ` · ${u.branch}` : ""}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {u.reputation} rep · {u.questions} asked · {u.answers} answered
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === u.id}
                  onClick={() => void patchUser(u.id, { reputationDelta: 25 })}
                >
                  +25 rep
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === u.id}
                  onClick={() => void patchUser(u.id, { reputationDelta: -10 })}
                >
                  −10 rep
                </Button>
                {u.role === "USER" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={busy === u.id}
                    onClick={() => void patchUser(u.id, { role: "ADMIN" })}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Make admin
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={busy === u.id || u.id === currentUser?.id}
                    onClick={() => void patchUser(u.id, { role: "USER" })}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    Demote
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
