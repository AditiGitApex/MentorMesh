import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { mapQuestion, questionInclude } from "@/lib/mappers"
import { jsonError } from "@/lib/auth"

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const question = await prisma.question.findUnique({
    where: { id },
    include: questionInclude,
  })
  if (!question) return jsonError("Question not found.", 404)
  return NextResponse.json({ question: mapQuestion(question) })
}
