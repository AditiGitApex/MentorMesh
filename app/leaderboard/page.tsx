"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"
import { Crown, Medal, Star } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

const rankIcon = (i: number) => {
  if (i === 0) return <Crown className="w-4 h-4 text-amber-500" aria-hidden />
  if (i === 1) return <Medal className="w-4 h-4 text-slate-400" aria-hidden />
  if (i === 2) return <Medal className="w-4 h-4 text-amber-700" aria-hidden />
  return null
}

const rankBg = (i: number) => {
  if (i === 0) return "bg-amber-500/8 dark:bg-amber-500/10"
  if (i === 1) return "bg-slate-400/6 dark:bg-slate-400/8"
  if (i === 2) return "bg-amber-700/6 dark:bg-amber-700/8"
  return ""
}

export default function LeaderboardPage() {
  const refreshUsers = useStore((s) => s.refreshUsers)
  const users = useStore((s) => s.users)
  const currentUser = useStore((s) => s.currentUser)

  useEffect(() => {
    void refreshUsers(true)
  }, [refreshUsers])

  const sorted = [...users].sort((a, b) => b.reputation - a.reputation)

  return (
    <div className="studio-wrap py-12 md:py-16 pb-24">
      <div className="animate-fade-up">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[hsl(var(--mesh-signal))] mb-3">
          Density
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">
          Leaderboard
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl">
          Contributors ranked by reputation.
        </p>
      </div>

      <div className="max-w-3xl">
        {/* Top 3 podium cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {sorted.slice(0, 3).map((user, i) => {
            const order = [1, 0, 2][i] // center = rank 1
            return (
              <motion.div
                key={user.id}
                className={`rounded-xl border border-border bg-card p-4 text-center transition-all duration-300 hover:border-[hsl(var(--mesh-signal))]/30 hover:shadow-md animate-fade-up ${rankBg(order)}`}
                style={{ animationDelay: `${i * 80}ms`, order }}
                whileHover={{ y: -2 }}
              >
                <Link href={`/profile/${user.id}`} className="flex flex-col items-center gap-2">
                  <span className="text-2xl font-display font-bold text-muted-foreground/60">#{order + 1}</span>
                  {rankIcon(order)}
                  <Avatar className={`border-2 border-border ${order === 0 ? "h-12 w-12 border-amber-500/40" : "h-10 w-10"}`}>
                    <AvatarImage src={user.avatar} alt="" />
                    <AvatarFallback className="bg-secondary text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-semibold truncate w-full">{user.name}</p>
                  <p className="text-xs text-[hsl(var(--mesh-signal))] font-semibold">
                    {user.reputation.toLocaleString("en-US")} rep
                  </p>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Full table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up delay-300">
          <div className="grid grid-cols-12 gap-4 px-5 sm:px-6 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-2 sm:col-span-1">#</div>
            <div className="col-span-7 sm:col-span-8">Member</div>
            <div className="col-span-3 text-right">Rep</div>
          </div>
          <div className="divide-y divide-border">
            {sorted.map((user, i) => {
              const isYou = currentUser?.id === user.id
              return (
                <div
                  key={user.id}
                  className={`grid grid-cols-12 gap-4 px-5 sm:px-6 py-4 items-center transition-colors duration-200 ${
                    isYou
                      ? "bg-[hsl(var(--mesh-wash))]"
                      : "hover:bg-secondary/35"
                  }`}
                >
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5">
                    <span className="font-display font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
                    {rankIcon(i)}
                  </div>
                  <div className="col-span-7 sm:col-span-8">
                    <Link href={`/profile/${user.id}`} className="flex items-center gap-3 group">
                      <Avatar className="h-9 w-9 border border-border group-hover:border-[hsl(var(--mesh-signal))]/40 transition-colors duration-200">
                        <AvatarImage src={user.avatar} alt="" />
                        <AvatarFallback className="bg-secondary text-xs font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold group-hover:text-[hsl(var(--mesh-signal))] transition-colors duration-200">
                        {user.name}
                        {isYou && (
                          <span className="ml-2 text-xs font-medium text-[hsl(var(--mesh-signal))] bg-[hsl(var(--mesh-wash))] px-1.5 py-0.5 rounded-md">you</span>
                        )}
                      </span>
                    </Link>
                  </div>
                  <div className="col-span-3 flex justify-end items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-[hsl(var(--mesh-signal))]" aria-hidden />
                    <span className="font-semibold tabular-nums">{user.reputation.toLocaleString("en-US")}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
