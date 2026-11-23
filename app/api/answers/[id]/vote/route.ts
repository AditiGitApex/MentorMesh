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

  const answer = await prisma.answer.findUnique({ where: { id } })
  if (!answer) return jsonError("Answer not found.", 404)
  if (answer.authorId === user.id) return jsonError("You cannot vote on your own answer.")

  await prisma.$transaction(async (tx) => {
    const existing = await tx.answerVote.findUnique({
      where: { userId_answerId: { userId: user.id, answerId: id } },
    })

    let delta = parsed.data.value
    if (existing) {
      if (existing.value === parsed.data.value) {
        await tx.answerVote.delete({ where: { id: existing.id } })
        delta = -existing.value as 1 | -1
      } else {
        await tx.answerVote.update({
          where: { id: existing.id },
          data: { value: parsed.data.value },
        })
        delta = parsed.data.value - existing.value
      }
    } else {
      await tx.answerVote.create({
        data: { userId: user.id, answerId: id, value: parsed.data.value },
      })
    }

    await tx.answer.update({
      where: { id },
      data: { votes: { increment: delta } },
    })

    const repDelta = delta > 0 ? delta * 10 : delta * 2
    await tx.user.update({
      where: { id: answer.authorId },
      data: { reputation: { increment: repDelta } },
    })
  })

  const updated = await prisma.question.findUniqueOrThrow({
    where: { id: answer.questionId },
    include: questionInclude,
  })
  return NextResponse.json({ question: mapQuestion(updated) })
}
