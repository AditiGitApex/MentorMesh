import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import {
  avatarFor,
  hashPassword,
  jsonError,
  setSessionCookie,
  signToken,
  toPublicUser,
} from "@/lib/auth"

const BRANCHES = ["AIDS", "AIML", "CE", "CEA", "CSD", "CSE", "CSIT", "CST", "IT", "RAI"] as const
const BATCHES = ["WEEKDAYS", "WEEKEND"] as const
const SECTIONS = ["TY1", "TY2", "TY3", "TY4"] as const

const schema = z.object({
  name: z.string().min(2).max(120),
  password: z.string().min(6).max(100),
  enrollmentNo: z
    .string()
    .regex(/^\d{10,16}$/, "Enrollment number should be 10–16 digits"),
  branch: z.enum(BRANCHES),
  division: z.string().min(1).max(20),
  rollNo: z.coerce.number().int().min(1).max(999),
  batch: z.enum(BATCHES),
  section: z.enum(SECTIONS),
  avatar: z.string().min(1).optional(),
  bio: z.string().max(280).optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Please fill all required fields correctly."
    return jsonError(msg)
  }

  const enrollmentNo = parsed.data.enrollmentNo.trim()
  const email = `${enrollmentNo}@mentormail.com`.toLowerCase()

  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) {
    return jsonError("This enrollment is already registered. Please sign in instead.", 409)
  }

  const existingEnrollment = await prisma.user.findUnique({ where: { enrollmentNo } })
  if (existingEnrollment) {
    return jsonError("This enrollment number is already in use. Please sign in instead.", 409)
  }

  let avatar = parsed.data.avatar || avatarFor(enrollmentNo)
  if (avatar.startsWith("data:image/")) {
    if (avatar.length > 350_000) {
      return jsonError("Avatar image is too large. Pick a style or a smaller photo.")
    }
  } else if (
    !avatar.startsWith("https://api.dicebear.com/") &&
    !avatar.startsWith("/uploads/avatars/")
  ) {
    avatar = avatarFor(enrollmentNo)
  }

  const passwordHash = await hashPassword(parsed.data.password)
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      enrollmentNo,
      passwordHash,
      avatar,
      bio: parsed.data.bio?.trim() || null,
      branch: parsed.data.branch,
      division: parsed.data.division.trim().toUpperCase(),
      rollNo: parsed.data.rollNo,
      batch: parsed.data.batch,
      section: parsed.data.section,
      reputation: 1,
      role: "USER",
    },
    include: { bookmarks: { select: { questionId: true } } },
  })

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Welcome to MentorMesh",
      message: `Your campus mail is ${email}. Ask questions, follow tags, and earn reputation.`,
      link: "/tags",
    },
  })

  const branchTag = await prisma.tag.upsert({
    where: { name: parsed.data.branch },
    update: {},
    create: { name: parsed.data.branch },
  })
  await prisma.tagFollow.create({
    data: { userId: user.id, tagId: branchTag.id },
  })
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: `Following ${parsed.data.branch}`,
      message: `You’re now following ${parsed.data.branch} threads. Manage follows anytime on Tags.`,
      link: "/tags",
    },
  })

  const token = await signToken(user.id)
  const res = NextResponse.json({ user: toPublicUser(user) }, { status: 201 })
  return setSessionCookie(res, token)
}
