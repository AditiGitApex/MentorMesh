import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireUser, jsonError } from "@/lib/auth"
import { mapQuestion, questionInclude } from "@/lib/mappers"
import { notifyUser } from "@/lib/notifications"
import { sanitizeHtml, plainToHtml } from "@/lib/sanitize"

const schema = z.object({
  content: z.string().min(5).max(20000),
})

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await requireUser(req)
  if (!user) return jsonError("Sign in to answer.", 401)
  const { id } = await ctx.params

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError("Answer content is required.")

  const question = await prisma.question.findUnique({ where: { id } })
  if (!question) return jsonError("Question not found.", 404)

  const html =
    parsed.data.content.includes("<")
      ? sanitizeHtml(parsed.data.content)
      : plainToHtml(parsed.data.content)

  await prisma.answer.create({
    data: {
      content: html,
      questionId: id,
      authorId: user.id,
    },
  })

  if (question.authorId !== user.id) {
    await notifyUser({
      userId: question.authorId,
      title: "New answer",
      message: `${user.name} answered your question "${question.title}".`,
      link: `/questions/${id}`,
      questionId: id,
    })
  }

  const updated = await prisma.question.findUniqueOrThrow({
    where: { id },
    include: questionInclude,
  })
  return NextResponse.json({ question: mapQuestion(updated) }, { status: 201 })
}
