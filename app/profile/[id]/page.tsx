"use client"

import { useEffect, useState } from "react"
import { useStore, type Question, type User } from "@/lib/store"
import {
  Star,
  MessageCircle,
  FileQuestion,
  Pencil,
  Check,
  X,
  Mail,
  GraduationCap,
  Hash,
} from "lucide-react"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import QuestionCard from "@/components/ui/QuestionCard"
import AvatarPicker from "@/components/ui/AvatarPicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buildAvatarUrl } from "@/lib/avatars"

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const currentUser = useStore((s) => s.currentUser)
  const users = useStore((s) => s.users)
  const questions = useStore((s) => s.questions)
  const updateProfile = useStore((s) => s.updateProfile)

  const [user, setUser] = useState<User | undefined>(users.find((u) => u.id === userId))
  const [asked, setAsked] = useState<Question[]>([])
  const [answered, setAnswered] = useState<Question[]>([])
  const [tab, setTab] = useState<"asked" | "answered">("asked")
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [avatar, setAvatar] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [savedFlash, setSavedFlash] = useState(false)

  const isOwn = currentUser?.id === userId

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch(`/api/users/${userId}`)
      if (!res.ok) return
      const json = await res.json()
      if (!cancelled) setUser(json.user)
    })()
    return () => {
      cancelled = true
    }
  }, [userId, currentUser?.avatar, currentUser?.name, currentUser?.bio])

  useEffect(() => {
    if (!user) return
    const mine = questions.filter((q) => q.authorId === user.id)
    const ans = questions.filter((q) => q.answers.some((a) => a.authorId === user.id))
    setAsked(mine)
    setAnswered(ans)

    // Prefer server lists if client cache is thin
    ;(async () => {
      const [a, b] = await Promise.all([
        fetch(`/api/questions?authorId=${user.id}`),
        fetch(`/api/questions`),
      ])
      if (a.ok) {
        const ja = await a.json()
        setAsked(ja.questions || [])
      }
      if (b.ok) {
        const jb = await b.json()
        const list = (jb.questions || []) as Question[]
        setAnswered(list.filter((q) => q.answers.some((ans) => ans.authorId === user.id)))
      }
    })()
  }, [user?.id, questions])

  useEffect(() => {
    if (user && editing) {
      setName(user.name)
      setBio(user.bio || "")
      setAvatar(user.avatar)
    }
  }, [user, editing])

  if (!user) {
    return (
      <div className="studio-wrap flex flex-col items-center py-24">
        <h1 className="font-display text-2xl font-semibold mb-4">User not found</h1>
        <Link href="/" className="text-[hsl(var(--mesh-signal))] hover:underline">
          Return home
        </Link>
      </div>
    )
  }

  const startEdit = () => {
    setName(user.name)
    setBio(user.bio || "")
    setAvatar(user.avatar || buildAvatarUrl("avataaars", user.email))
    setError("")
    setEditing(true)
  }

  const save = async () => {
    if (name.trim().length < 2) {
      setError("Name needs at least 2 characters.")
      return
    }
    setPending(true)
    setError("")
    const result = await updateProfile({
      name: name.trim(),
      bio: bio.trim() || null,
      avatar,
    })
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setUser(result.user)
    setEditing(false)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }

  const list = tab === "asked" ? asked : answered

  return (
    <div className="w-full pb-24">
      {/* Banner */}
      <div className="relative h-36 sm:h-44 w-full overflow-hidden border-b border-border">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 120% at 20% 0%, hsl(var(--mesh-wash)) 0%, transparent 55%), radial-gradient(ellipse 70% 100% at 90% 30%, hsl(var(--mesh-wash) / 0.7) 0%, transparent 50%), hsl(var(--secondary))",
          }}
        />
        <div className="absolute inset-0 studio-grain opacity-40" aria-hidden />
      </div>

      <div className="studio-wrap max-w-5xl">
        {/* Header row */}
        <div className="relative -mt-14 sm:-mt-16 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-8">
            <div className="relative shrink-0 self-start sm:self-auto">
              <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-[5px] border-background shadow-md rounded-2xl">
                <AvatarImage src={user.avatar} alt="" className="object-cover" />
                <AvatarFallback className="bg-secondary text-3xl font-bold rounded-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOwn && !editing && (
                <button
                  type="button"
                  onClick={startEdit}
                  className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center shadow-md hover:opacity-90"
                  aria-label="Edit profile picture"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight truncate">
                      {user.name}
                    </h1>
                    {user.role === "ADMIN" && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-[hsl(var(--mesh-wash))] text-[hsl(var(--mesh-signal))] border border-[hsl(var(--mesh-signal))]/20">
                        Admin
                      </span>
                    )}
                    {savedFlash && (
                      <span className="text-xs font-medium text-[hsl(var(--mesh-signal))] animate-scale-in">
                        Saved
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground leading-relaxed max-w-xl">
                    {user.bio?.trim() ||
                      (isOwn
                        ? "Add a short bio so peers know how you can help."
                        : "Member of the MentorMesh campus studio.")}
                  </p>
                </div>

                {isOwn && !editing && (
                  <Button
                    variant="outline"
                    className="rounded-lg shrink-0 gap-2 self-start"
                    onClick={startEdit}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit panel */}
        {editing && isOwn && (
          <div className="studio-surface rounded-2xl p-6 sm:p-8 mb-8 animate-fade-up">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="font-display text-xl font-semibold">Edit your profile</h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg gap-1.5"
                  onClick={() => setEditing(false)}
                  disabled={pending}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg gap-1.5 bg-foreground text-background"
                  onClick={() => void save()}
                  disabled={pending}
                >
                  <Check className="h-4 w-4" />
                  {pending ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
              <AvatarPicker
                value={avatar}
                onChange={setAvatar}
                seedHint={user.email || user.name}
                size="lg"
              />
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="profile-name">Display name</Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile-bio">
                    Bio <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 280))}
                    rows={4}
                    className="rounded-lg px-3.5 py-3 border border-input bg-background text-sm leading-relaxed resize-y w-full"
                    placeholder="What you’re studying, topics you help with…"
                  />
                  <p className="text-xs text-muted-foreground text-right">{bio.length}/280</p>
                </div>
                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Meta + stats */}
        <div className="grid lg:grid-cols-12 gap-6 mb-10">
          <aside className="lg:col-span-4">
            <div className="studio-surface rounded-2xl p-5 sm:p-6 h-full">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-4">
                Details
              </h2>
              <ul className="space-y-3.5 text-sm">
                <li className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-0.5 text-[hsl(var(--mesh-signal))] shrink-0" />
                  <span className="break-all text-foreground/90">{user.email}</span>
                </li>
                {user.enrollmentNo && (
                  <li className="flex items-start gap-3">
                    <Hash className="h-4 w-4 mt-0.5 text-[hsl(var(--mesh-signal))] shrink-0" />
                    <span>{user.enrollmentNo}</span>
                  </li>
                )}
                {(user.branch || user.division || user.section) && (
                  <li className="flex items-start gap-3">
                    <GraduationCap className="h-4 w-4 mt-0.5 text-[hsl(var(--mesh-signal))] shrink-0" />
                    <span>
                      {[user.branch, user.division, user.section, user.batch]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-8 grid grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              icon={<Star className="h-4 w-4" />}
              label="Reputation"
              value={user.reputation.toLocaleString("en-US")}
              accent
            />
            <StatCard
              icon={<FileQuestion className="h-4 w-4" />}
              label="Asked"
              value={String(asked.length)}
            />
            <StatCard
              icon={<MessageCircle className="h-4 w-4" />}
              label="Answered"
              value={String(answered.length)}
            />
          </div>
        </div>

        {/* Activity */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Activity</h2>
            <div className="inline-flex rounded-lg border border-border bg-card p-1">
              <button
                type="button"
                onClick={() => setTab("asked")}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tab === "asked"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Questions
              </button>
              <button
                type="button"
                onClick={() => setTab("answered")}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tab === "answered"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Answers
              </button>
            </div>
          </div>

          <div className="grid gap-3 max-w-3xl">
            {list.length > 0 ? (
              list.map((q) => <QuestionCard key={`${tab}-${q.id}`} question={q} />)
            ) : (
              <div className="studio-surface rounded-2xl p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {tab === "asked" ? "No questions yet." : "No answers yet."}
                </p>
                {isOwn && tab === "asked" && (
                  <Link href="/ask">
                    <Button className="rounded-lg bg-foreground text-background">Ask a question</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between min-h-[108px] ${
        accent
          ? "border-[hsl(var(--mesh-signal))]/25 bg-[hsl(var(--mesh-wash))]"
          : "border-border bg-card"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${
          accent ? "text-[hsl(var(--mesh-signal))]" : "text-muted-foreground"
        }`}
      >
        {icon}
        {label}
      </div>
      <p
        className={`font-display text-2xl sm:text-3xl font-semibold tabular-nums mt-3 ${
          accent ? "text-[hsl(var(--mesh-signal))]" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  )
}
