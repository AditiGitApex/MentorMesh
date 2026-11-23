import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireUser, jsonError } from "@/lib/auth"
import { mapQuestion, questionInclude } from "@/lib/mappers"

const schema = z.object({ value: z.union([z.literal(1), z.literal(-1)]) })

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await requireUser(req)
  if (!user) return jsonError("Sign in to vote.", 401)
  const { id } = await ctx.params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError("Vote value must be 1 or -1.")

  const question = await prisma.question.findUnique({ where: { id } })
  if (!question) return jsonError("Question not found.", 404)
  if (question.authorId === user.id) return jsonError("You cannot vote on your own question.")

  await prisma.$transaction(async (tx) => {
    const existing = await tx.questionVote.findUnique({
      where: { userId_questionId: { userId: user.id, questionId: id } },
    })

    let delta = parsed.data.value
    if (existing) {
      if (existing.value === parsed.data.value) {
        await tx.questionVote.delete({ where: { id: existing.id } })
        delta = -existing.value as 1 | -1
      } else {
        await tx.questionVote.update({
          where: { id: existing.id },
          data: { value: parsed.data.value },
        })
        delta = parsed.data.value - existing.value
      }
    } else {
      await tx.questionVote.create({
        data: { userId: user.id, questionId: id, value: parsed.data.value },
      })
    }

    await tx.question.update({
      where: { id },
      data: { votes: { increment: delta } },
    })

    const repDelta = delta > 0 ? delta * 5 : delta * 2
    await tx.user.update({
      where: { id: question.authorId },
      data: { reputation: { increment: repDelta } },
    })
  })

  const updated = await prisma.question.findUniqueOrThrow({
    where: { id },
    include: questionInclude,
  })
  return NextResponse.json({ question: mapQuestion(updated) })
}
