import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireUser, jsonError } from "@/lib/auth"
import { mapQuestion, questionInclude } from "@/lib/mappers"
import { notifyUser } from "@/lib/notifications"

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await requireUser(req)
  if (!user) return jsonError("Sign in required.", 401)
  const { id } = await ctx.params

  const answer = await prisma.answer.findUnique({
    where: { id },
    include: { question: true },
  })
  if (!answer) return jsonError("Answer not found.", 404)
  if (answer.question.authorId !== user.id) {
    return jsonError("Only the question author can accept an answer.", 403)
  }
  if (answer.authorId === user.id) {
    return jsonError("You can’t accept your own answer.", 400)
  }

  await prisma.$transaction(async (tx) => {
    const previouslyAccepted = await tx.answer.findFirst({
      where: { questionId: answer.questionId, isAccepted: true },
    })

    await tx.answer.updateMany({
      where: { questionId: answer.questionId },
      data: { isAccepted: false },
    })

    await tx.answer.update({
      where: { id },
      data: { isAccepted: true },
    })

    if (!previouslyAccepted || previouslyAccepted.id !== id) {
      if (previouslyAccepted && previouslyAccepted.authorId !== answer.authorId) {
        const prev = await tx.user.findUnique({
          where: { id: previouslyAccepted.authorId },
          select: { reputation: true },
        })
        await tx.user.update({
          where: { id: previouslyAccepted.authorId },
          data: { reputation: Math.max(0, (prev?.reputation ?? 0) - 15) },
        })
      }
      if (!previouslyAccepted || previouslyAccepted.authorId !== answer.authorId) {
        await tx.user.update({
          where: { id: answer.authorId },
          data: { reputation: { increment: 15 } },
        })
      }
    }
  })

  if (answer.authorId !== user.id) {
    await notifyUser({
      userId: answer.authorId,
      title: "Answer accepted",
      message: `Your answer on “${answer.question.title}” was accepted.`,
      link: `/questions/${answer.questionId}`,
      questionId: answer.questionId,
    })
  }

  const updated = await prisma.question.findUniqueOrThrow({
    where: { id: answer.questionId },
    include: questionInclude,
  })
  return NextResponse.json({ question: mapQuestion(updated) })
}
