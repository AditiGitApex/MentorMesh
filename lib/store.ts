"use client"

import { create } from "zustand"
import type { ApiAnswer, ApiQuestion, ApiUser } from "@/lib/mappers"

export type User = ApiUser
export type Answer = ApiAnswer
export type Question = ApiQuestion
export type Notification = {
  id: string
  message: string
  read: boolean
  date: string
  userId?: string
  link?: string
  title?: string
}

type StoreState = {
  currentUser: User | null
  users: User[]
  questions: Question[]
  notifications: Notification[]
  hydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  refreshQuestions: (params?: { q?: string; tag?: string }) => Promise<void>
  refreshUsers: (leaderboard?: boolean) => Promise<void>
  refreshNotifications: () => Promise<void>
  login: (email: string, password: string, remember?: boolean) => Promise<{ ok: true } | { ok: false; error: string }>
  register: (input: {
    name: string
    enrollmentNo: string
    password: string
    branch: string
    division: string
    rollNo: number
    batch: string
    section: string
    avatar?: string
    bio?: string
  }) => Promise<{ ok: true } | { ok: false; error: string }>
  updateProfile: (input: {
    name?: string
    bio?: string | null
    avatar?: string
  }) => Promise<{ ok: true; user: User } | { ok: false; error: string }>
  logout: () => Promise<void>
  addQuestion: (input: {
    title: string
    description: string
    tags: string[]
    images?: string[]
  }) => Promise<{ ok: true; question: Question } | { ok: false; error: string }>
  addAnswer: (
    questionId: string,
    content: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>
  voteQuestion: (questionId: string, value: number) => Promise<void>
  voteAnswer: (questionId: string, answerId: string, value: number) => Promise<void>
  acceptAnswer: (questionId: string, answerId: string) => Promise<void>
  markNotificationsRead: (ids?: string[]) => Promise<void>
  toggleBookmark: (questionId: string) => Promise<void>
}

async function api<T>(url: string, init?: RequestInit): Promise<{ data?: T; error?: string; status: number }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      credentials: "include",
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { error: (json as { error?: string }).error || "Request failed", status: res.status }
    }
    return { data: json as T, status: res.status }
  } catch {
    return { error: "Network error", status: 0 }
  }
}

function upsertQuestion(list: Question[], question: Question) {
  const idx = list.findIndex((q) => q.id === question.id)
  if (idx === -1) return [question, ...list]
  const next = [...list]
  next[idx] = question
  return next
}

export const useStore = create<StoreState>((set, get) => ({
  currentUser: null,
  users: [],
  questions: [],
  notifications: [],
  hydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().loading) return
    set({ loading: true })
    const [me, questions, users, notifications] = await Promise.all([
      api<{ user: User }>("/api/auth/me"),
      api<{ questions: Question[] }>("/api/questions"),
      api<{ users: User[] }>("/api/users?leaderboard=1&limit=200"),
      api<{ notifications: Notification[] }>("/api/notifications"),
    ])

    set({
      currentUser: me.data?.user ?? null,
      questions: questions.data?.questions ?? [],
      users: users.data?.users ?? [],
      notifications: notifications.status === 401 ? [] : notifications.data?.notifications ?? [],
      hydrated: true,
      loading: false,
    })
  },

  refreshQuestions: async (params) => {
    const sp = new URLSearchParams()
    if (params?.q) sp.set("q", params.q)
    if (params?.tag) sp.set("tag", params.tag)
    const qs = sp.toString()
    const res = await api<{ questions: Question[] }>(`/api/questions${qs ? `?${qs}` : ""}`)
    if (res.data) set({ questions: res.data.questions })
  },

  refreshUsers: async (leaderboard = true) => {
    const res = await api<{ users: User[] }>(
      `/api/users?leaderboard=${leaderboard ? "1" : "0"}&limit=200`
    )
    if (res.data) set({ users: res.data.users })
  },

  refreshNotifications: async () => {
    const res = await api<{ notifications: Notification[] }>("/api/notifications")
    if (res.data) set({ notifications: res.data.notifications })
  },

  login: async (email, password, remember = false) => {
    const res = await api<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember }),
    })
    if (!res.data?.user) return { ok: false as const, error: res.error || "Login failed" }
    set({ currentUser: res.data.user })
    await Promise.all([get().refreshNotifications(), get().refreshUsers()])
    return { ok: true as const }
  },

  register: async (input) => {
    const res = await api<{ user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    })
    if (!res.data?.user) return { ok: false as const, error: res.error || "Registration failed" }
    set({ currentUser: res.data.user })
    await get().refreshNotifications()
    return { ok: true as const }
  },

  updateProfile: async (input) => {
    const res = await api<{ user: User }>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(input),
    })
    if (!res.data?.user) return { ok: false as const, error: res.error || "Update failed" }
    const user = res.data.user
    set((s) => ({
      currentUser: user,
      users: s.users.map((u) => (u.id === user.id ? { ...u, ...user } : u)),
    }))
    return { ok: true as const, user }
  },

  logout: async () => {
    await api("/api/auth/logout", { method: "POST" })
    set({ currentUser: null, notifications: [] })
  },

  addQuestion: async (input) => {
    const res = await api<{ question: Question }>("/api/questions", {
      method: "POST",
      body: JSON.stringify(input),
    })
    if (!res.data?.question) return { ok: false as const, error: res.error || "Could not post" }
    set((s) => ({ questions: [res.data!.question, ...s.questions] }))
    return { ok: true as const, question: res.data.question }
  },

  addAnswer: async (questionId, content) => {
    const res = await api<{ question: Question }>(`/api/questions/${questionId}/answers`, {
      method: "POST",
      body: JSON.stringify({ content }),
    })
    if (!res.data?.question) {
      return { ok: false as const, error: res.error || "Could not post answer" }
    }
    set((s) => ({ questions: upsertQuestion(s.questions, res.data!.question) }))
    return { ok: true as const }
  },

  voteQuestion: async (questionId, value) => {
    const res = await api<{ question: Question }>(`/api/questions/${questionId}/vote`, {
      method: "POST",
      body: JSON.stringify({ value }),
    })
    if (res.data?.question) {
      set((s) => ({ questions: upsertQuestion(s.questions, res.data!.question) }))
      await get().refreshUsers()
    }
  },

  voteAnswer: async (_questionId, answerId, value) => {
    const res = await api<{ question: Question }>(`/api/answers/${answerId}/vote`, {
      method: "POST",
      body: JSON.stringify({ value }),
    })
    if (res.data?.question) {
      set((s) => ({ questions: upsertQuestion(s.questions, res.data!.question) }))
      await get().refreshUsers()
    }
  },

  acceptAnswer: async (_questionId, answerId) => {
    const res = await api<{ question: Question }>(`/api/answers/${answerId}/accept`, {
      method: "POST",
    })
    if (res.data?.question) {
      set((s) => ({ questions: upsertQuestion(s.questions, res.data!.question) }))
      await get().refreshUsers()
    }
  },

  markNotificationsRead: async (ids) => {
    await api("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify(ids?.length ? { ids } : {}),
    })
    set((s) => ({
      notifications: s.notifications.map((n) =>
        !ids?.length || ids.includes(n.id) ? { ...n, read: true } : n
      ),
    }))
  },

  toggleBookmark: async (questionId) => {
    const res = await api<{ bookmarked: boolean; ids: string[] }>("/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ questionId }),
    })
    if (!res.data || !get().currentUser) return
    const currentUser = { ...get().currentUser!, bookmarks: res.data.ids }
    set((s) => ({
      currentUser,
      users: s.users.map((u) => (u.id === currentUser.id ? currentUser : u)),
    }))
  },
}))
