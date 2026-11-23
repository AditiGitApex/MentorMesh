"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import Link from "next/link"
import { MeshMark } from "@/components/ui/MeshMark"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import AvatarPicker from "@/components/ui/AvatarPicker"
import { buildAvatarUrl } from "@/lib/avatars"

const BRANCHES = ["AIDS", "AIML", "CE", "CEA", "CSD", "CSE", "CSIT", "CST", "IT", "RAI"]
const BATCHES = ["WEEKDAYS", "WEEKEND"] as const
const SECTIONS = ["TY1", "TY2", "TY3", "TY4"] as const
const DIVISIONS = ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2", "D3", "WE"]

const fieldClass =
  "h-11 rounded-lg bg-background border border-border px-3 text-sm w-full focus-visible:outline-none focus-visible:border-[hsl(var(--mesh-signal))]/55"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [enrollmentNo, setEnrollmentNo] = useState("")
  const [password, setPassword] = useState("")
  const [branch, setBranch] = useState("")
  const [division, setDivision] = useState("")
  const [rollNo, setRollNo] = useState("")
  const [batch, setBatch] = useState<(typeof BATCHES)[number] | "">("")
  const [section, setSection] = useState<(typeof SECTIONS)[number] | "">("")
  const [bio, setBio] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const seed = useMemo(
    () => enrollmentNo.trim() || name.trim() || `guest-${Date.now()}`,
    [enrollmentNo, name]
  )
  const [avatar, setAvatar] = useState(() => buildAvatarUrl("avataaars", "mentormesh-new"))
  const campusEmail = enrollmentNo.trim()
    ? `${enrollmentNo.trim()}@mentormail.com`
    : "enrollmentno@mentormail.com"

  const router = useRouter()
  const register = useStore((s) => s.register)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !enrollmentNo || !password || !branch || !division || !rollNo || !batch || !section) {
      setError("Please fill every required field.")
      return
    }
    if (!/^\d{10,16}$/.test(enrollmentNo.trim())) {
      setError("Enrollment number should be 10–16 digits.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    const roll = Number(rollNo)
    if (!Number.isInteger(roll) || roll < 1) {
      setError("Roll number must be a positive integer.")
      return
    }

    setPending(true)
    setError("")
    const result = await register({
      name: name.trim(),
      enrollmentNo: enrollmentNo.trim(),
      password,
      branch,
      division: division.trim().toUpperCase(),
      rollNo: roll,
      batch,
      section,
      avatar,
      bio: bio.trim() || undefined,
    })
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    router.push("/")
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 py-16 studio-atmosphere">
      <div className="studio-grain" aria-hidden />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Link href="/" className="mb-8 flex flex-col items-center gap-2.5 group animate-fade-up">
        <div className="flex items-center gap-2.5">
          <MeshMark
            size={30}
            className="text-[hsl(var(--mesh-signal))] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
          />
          <span className="font-display text-xl font-semibold group-hover:text-[hsl(var(--mesh-signal))] transition-colors duration-200">
            MentorMesh
          </span>
        </div>
      </Link>

      <div className="w-full max-w-2xl animate-fade-up delay-100">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold mb-2">Join the mesh</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Create your campus profile. Email is generated from your enrollment as{" "}
            <span className="font-medium text-foreground">enrollment@mentormail.com</span>.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          {error && (
            <div
              role="alert"
              className="mb-5 text-sm text-center text-destructive bg-destructive/8 border border-destructive/20 rounded-lg p-3 animate-scale-in"
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="grid gap-6">
            <AvatarPicker value={avatar} onChange={setAvatar} seedHint={seed} size="lg" />

            <section className="grid gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Identity
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-lg bg-background"
                    placeholder="As on the roll list"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="enrollmentNo">Enrollment number</Label>
                  <Input
                    id="enrollmentNo"
                    inputMode="numeric"
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    className="h-11 rounded-lg bg-background font-mono"
                    placeholder="23002171410006"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Campus email</Label>
                  <Input
                    id="email"
                    value={campusEmail}
                    readOnly
                    className="h-11 rounded-lg bg-secondary/50 text-muted-foreground cursor-not-allowed"
                    aria-describedby="email-hint"
                  />
                  <p id="email-hint" className="text-xs text-muted-foreground">
                    Auto-created from enrollment
                  </p>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-lg bg-background pr-10"
                      placeholder="Min. 6 characters"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                      onClick={() => setShow(!show)}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{show ? "Hide" : "Show"} password</span>
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Academic details
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="branch">Branch</Label>
                  <select
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className={fieldClass}
                    required
                  >
                    <option value="">Select branch</option>
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="section">Section</Label>
                  <select
                    id="section"
                    value={section}
                    onChange={(e) => setSection(e.target.value as (typeof SECTIONS)[number] | "")}
                    className={fieldClass}
                    required
                  >
                    <option value="">Select section</option>
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="batch">Batch</Label>
                  <select
                    id="batch"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value as (typeof BATCHES)[number] | "")}
                    className={fieldClass}
                    required
                  >
                    <option value="">Select batch</option>
                    {BATCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="division">Division</Label>
                  <select
                    id="division"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className={fieldClass}
                    required
                  >
                    <option value="">Select division</option>
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="rollNo">Roll number</Label>
                  <Input
                    id="rollNo"
                    inputMode="numeric"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    className="h-11 rounded-lg bg-background"
                    placeholder="e.g. 18"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-2">
              <Label htmlFor="bio">
                Bio <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 280))}
                rows={3}
                className="rounded-lg px-3.5 py-3 border border-input bg-background text-sm leading-relaxed resize-y w-full"
                placeholder="What you study, what you can help with…"
              />
              <p className="text-xs text-muted-foreground text-right">{bio.length}/280</p>
            </section>

            <Button
              type="submit"
              disabled={pending}
              className="h-11 rounded-lg font-semibold bg-foreground text-background hover:opacity-85 group gap-2"
            >
              {pending ? "Creating…" : "Create account"}
              {!pending && (
                <ArrowRight
                  className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200"
                  aria-hidden
                />
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            Already on the roster?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground hover:text-[hsl(var(--mesh-signal))] transition-colors duration-200"
            >
              Sign in with your campus mail
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
