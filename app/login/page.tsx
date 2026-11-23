"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import Link from "next/link"
import { MeshMark } from "@/components/ui/MeshMark"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const router = useRouter()
  const login = useStore((s) => s.login)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Email and password are required.")
      return
    }
    setPending(true)
    setError("")
    const result = await login(email.trim(), password, remember)
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

      <Link href="/" className="mb-10 flex flex-col items-center gap-2.5 group animate-fade-up">
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

      <div className="w-full max-w-md animate-fade-up delay-100">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">
            Use your campus mail:{" "}
            <span className="font-medium text-foreground">enrollment@mentormail.com</span>
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {error && (
            <div
              role="alert"
              className="mb-5 text-sm text-center text-destructive bg-destructive/8 border border-destructive/20 rounded-lg p-3 animate-scale-in"
            >
              {error}
            </div>
          )}
          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg bg-background border-border transition-colors duration-200"
                placeholder="23002171410006@mentormail.com"
                required
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg bg-background border-border pr-10 transition-colors duration-200"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{show ? "Hide" : "Show"} password</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(c) => setRemember(c === true)}
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground font-normal">
                Keep me signed in on this device
              </Label>
            </div>
            <Button
              type="submit"
              disabled={pending}
              className="h-11 rounded-lg font-semibold bg-foreground text-background hover:opacity-85 transition-all duration-200 group gap-2"
            >
              {pending ? "Signing in…" : "Sign in"}
              {!pending && (
                <ArrowRight
                  className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200"
                  aria-hidden
                />
              )}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            Guest account?{" "}
            <Link
              href="/register"
              className="font-semibold text-foreground hover:text-[hsl(var(--mesh-signal))] transition-colors duration-200"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
