"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Home, PlusCircle, Trophy, Hash, Bookmark, Menu, X, Shield } from "lucide-react"
import NotificationDropdown from "../ui/NotificationDropdown"
import { usePathname, useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "../ui/ThemeToggle"
import { MeshMark } from "../ui/MeshMark"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/tags", label: "Tags", icon: Hash },
  { href: "/ask", label: "Ask", icon: PlusCircle },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const currentUser = useStore((s) => s.currentUser)
  const logout = useStore((s) => s.logout)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  if (pathname === "/login" || pathname === "/register") return null

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const isAdmin = currentUser?.role === "ADMIN"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-border/80 bg-background/92 backdrop-blur-xl shadow-sm"
          : "border-border/50 bg-background/72 backdrop-blur-md"
      )}
    >
      <div className="studio-wrap flex h-14 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="MentorMesh home">
          <MeshMark size={22} className="text-[hsl(var(--mesh-signal))] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          <span className="font-display text-lg font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-[hsl(var(--mesh-signal))]">
            MentorMesh
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5" aria-label="Primary">
          {links.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link key={href} href={href} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "h-9 gap-2 rounded-md px-3 text-sm font-medium transition-all duration-200",
                    active
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </Button>
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[hsl(var(--mesh-signal))] animate-scale-in" aria-hidden />
                )}
              </Link>
            )
          })}
          {isAdmin && (
            <Link href="/admin" className="relative">
              <Button
                variant="ghost"
                size="sm"
                aria-current={isActive("/admin") ? "page" : undefined}
                className={cn(
                  "h-9 gap-2 rounded-md px-3 text-sm font-medium transition-all duration-200",
                  isActive("/admin")
                    ? "text-[hsl(var(--mesh-signal))] bg-[hsl(var(--mesh-wash))]"
                    : "text-muted-foreground hover:text-[hsl(var(--mesh-signal))] hover:bg-[hsl(var(--mesh-wash))]/70"
                )}
              >
                <Shield className="h-4 w-4" aria-hidden />
                Admin
              </Button>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1">
          {currentUser ? (
            <>
              <div className="hidden sm:block"><NotificationDropdown /></div>
              <Link href="/bookmarks" className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-9 w-9 rounded-md text-muted-foreground hover:text-foreground transition-colors duration-200", isActive("/bookmarks") && "bg-secondary text-foreground")}
                  aria-label="Bookmarks"
                >
                  <Bookmark className="h-[17px] w-[17px]" />
                </Button>
              </Link>
              <Link href={`/profile/${currentUser.id}`} className="hidden sm:flex" aria-label={`Profile: ${currentUser.name}`}>
                <Avatar className="h-7 w-7 border border-border hover:border-[hsl(var(--mesh-signal))]/50 transition-all duration-200 hover:ring-2 hover:ring-[hsl(var(--mesh-signal))]/20 hover:ring-offset-1">
                  <AvatarImage src={currentUser.avatar} alt="" />
                  <AvatarFallback className="bg-secondary text-xs font-semibold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={() => {
                  void logout().then(() => router.push("/login"))
                }}
                className="hidden sm:inline-flex h-9 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-1.5" aria-hidden />
                Log out
              </Button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" className="h-9 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="h-9 rounded-md px-4 text-sm font-semibold bg-foreground text-background hover:opacity-85 transition-opacity duration-200">
                  Sign up
                </Button>
              </Link>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-md transition-colors duration-200"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5 animate-scale-in" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1 animate-fade-up" aria-label="Mobile">
          {links.map(({ href, label, icon: Icon }, i) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 animate-fade-up",
                isActive(href) ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60",
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
          {currentUser && (
            <>
              <div className="px-2 py-1">
                <NotificationDropdown />
              </div>
              <Link href="/bookmarks" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-md text-muted-foreground hover:bg-secondary/60 transition-colors duration-200 animate-fade-up delay-200">
                <Bookmark className="h-4 w-4" /> Bookmarks
              </Link>
              <Link href={`/profile/${currentUser.id}`} onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm rounded-md text-muted-foreground hover:bg-secondary/60 transition-colors duration-200 animate-fade-up delay-300">
                Profile
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-md text-[hsl(var(--mesh-signal))] hover:bg-[hsl(var(--mesh-wash))] transition-colors duration-200"
                >
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  void logout().then(() => router.push("/login"))
                }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-md text-muted-foreground hover:bg-secondary/60 transition-colors duration-200 text-left"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
