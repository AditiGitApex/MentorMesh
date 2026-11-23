import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireUser, jsonError } from "@/lib/auth"

const schema = z.object({
  tag: z.string().min(1).max(40).optional(),
  tagId: z.string().min(1).optional(),
})

export async function POST(req: NextRequest) {
  const user = await requireUser(req)
  if (!user) return jsonError("Sign in to follow tags.", 401)

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError("tag or tagId required.")

  let tag = parsed.data.tagId
    ? await prisma.tag.findUnique({ where: { id: parsed.data.tagId } })
    : await prisma.tag.findFirst({
        where: { name: { equals: parsed.data.tag!, mode: "insensitive" } },
      })

  if (!tag && parsed.data.tag) {
    return jsonError("Tag not found. Pick an existing tag from the Tags page.", 404)
  }
  if (!tag) return jsonError("Tag not found.", 404)

  const existing = await prisma.tagFollow.findUnique({
    where: { userId_tagId: { userId: user.id, tagId: tag.id } },
  })

  if (existing) {
    await prisma.tagFollow.delete({
      where: { userId_tagId: { userId: user.id, tagId: tag.id } },
    })
    return NextResponse.json({ following: false, tag: tag.name, tagId: tag.id })
  }

  await prisma.tagFollow.create({
    data: { userId: user.id, tagId: tag.id },
  })
  return NextResponse.json({ following: true, tag: tag.name, tagId: tag.id })
}

export async function GET(req: NextRequest) {
  const user = await requireUser(req)
  if (!user) return jsonError("Unauthorized", 401)

  const follows = await prisma.tagFollow.findMany({
    where: { userId: user.id },
    include: {
      tag: { include: { _count: { select: { questions: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    tags: follows.map((f) => ({
      id: f.tag.id,
      name: f.tag.name,
      count: f.tag._count.questions,
      following: true,
    })),
  })
}
