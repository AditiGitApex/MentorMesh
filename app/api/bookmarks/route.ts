import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireUser, jsonError } from "@/lib/auth"
import { mapQuestion, questionInclude } from "@/lib/mappers"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const user = await requireUser(req)
  if (!user) return jsonError("Unauthorized", 401)

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    include: {
      question: { include: questionInclude },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    questions: bookmarks.map((b) => mapQuestion(b.question)),
    ids: bookmarks.map((b) => b.questionId),
  })
}

const schema = z.object({ questionId: z.string().min(1) })

export async function POST(req: NextRequest) {
  const user = await requireUser(req)
  if (!user) return jsonError("Unauthorized", 401)
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError("questionId required.")

  const question = await prisma.question.findUnique({
    where: { id: parsed.data.questionId },
  })
  if (!question) return jsonError("Question not found.", 404)

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_questionId: {
        userId: user.id,
        questionId: parsed.data.questionId,
      },
    },
  })

  if (existing) {
    await prisma.bookmark.delete({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: parsed.data.questionId,
        },
      },
    })
  } else {
    await prisma.bookmark.create({
      data: { userId: user.id, questionId: parsed.data.questionId },
    })
  }

  const ids = (
    await prisma.bookmark.findMany({
      where: { userId: user.id },
      select: { questionId: true },
    })
  ).map((b) => b.questionId)

  return NextResponse.json({ bookmarked: !existing, ids })
}
