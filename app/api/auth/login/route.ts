import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import {
  jsonError,
  setSessionCookie,
  signToken,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return jsonError("Valid email and password are required.")

  const email = parsed.data.email.toLowerCase().trim()
  const user = await prisma.user.findUnique({
    where: { email },
    include: { bookmarks: { select: { questionId: true } } },
  })
  if (!user) return jsonError("Invalid email or password.", 401)

  const ok = await verifyPassword(parsed.data.password, user.passwordHash)
  if (!ok) return jsonError("Invalid email or password.", 401)

  const days = parsed.data.remember ? 30 : 7
  const token = await signToken(user.id, days)
  const res = NextResponse.json({ user: toPublicUser(user) })
  return setSessionCookie(res, token, days)
}
