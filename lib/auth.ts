import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import type { Role, User } from "@prisma/client"

const COOKIE = "mentormesh_session"
const SALT_ROUNDS = 10

function secret() {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 16) throw new Error("JWT_SECRET missing or too short")
  return new TextEncoder().encode(s)
}

export type SessionUser = {
  id: string
  email: string
  name: string
  avatar: string
  bio: string | null
  reputation: number
  role: Role
  enrollmentNo: string | null
  branch: string | null
  division: string | null
  bookmarks: string[]
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function signToken(userId: string, days = 14) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(secret())
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret())
  return typeof payload.sub === "string" ? payload.sub : null
}

export function setSessionCookie(res: NextResponse, token: string, days = 14) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * days,
  })
  return res
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return res
}

export async function getSessionUserId(req?: NextRequest) {
  try {
    const token = req
      ? req.cookies.get(COOKIE)?.value
      : (await cookies()).get(COOKIE)?.value
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}

export function toPublicUser(
  user: User & { bookmarks?: { questionId: string }[] }
): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio ?? null,
    reputation: user.reputation,
    role: user.role,
    enrollmentNo: user.enrollmentNo,
    branch: user.branch,
    division: user.division,
    bookmarks: user.bookmarks?.map((b) => b.questionId) ?? [],
  }
}

export async function requireUser(req?: NextRequest) {
  const userId = await getSessionUserId(req)
  if (!userId) return null
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { bookmarks: { select: { questionId: true } } },
  })
  return user
}

export async function requireAdmin(req?: NextRequest) {
  const user = await requireUser(req)
  if (!user || user.role !== "ADMIN") return null
  return user
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function avatarFor(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
}
