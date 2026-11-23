import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireUser, jsonError } from "@/lib/auth"
import { mapQuestion, questionInclude } from "@/lib/mappers"

export async function GET() {
  const user = await requireUser()
  if (!user) return jsonError("Unauthorized", 401)

  const myQuestions = await prisma.question.findMany({
    where: { authorId: user.id },
    include: questionInclude,
    orderBy: { createdAt: "desc" },
    take: 6,
  })

  const askedTagNames = myQuestions.flatMap((q) => q.tags.map((t) => t.tag.name))
  const followed = await prisma.tagFollow.findMany({
    where: { userId: user.id },
    include: { tag: true },
    take: 20,
  })
  const followedNames = followed.map((f) => f.tag.name)
  const focusTags = [...new Set([...followedNames, ...askedTagNames, user.branch].filter(Boolean) as string[])]

  const bookmarkIds = user.bookmarks.map((b) => b.questionId)

  const recommended =
    focusTags.length > 0
      ? await prisma.question.findMany({
          where: {
            authorId: { not: user.id },
            id: { notIn: bookmarkIds },
            tags: { some: { tag: { name: { in: focusTags } } } },
          },
          include: questionInclude,
          orderBy: [{ votes: "desc" }, { createdAt: "desc" }],
          take: 6,
        })
      : await prisma.question.findMany({
          where: { authorId: { not: user.id } },
          include: questionInclude,
          orderBy: [{ votes: "desc" }, { createdAt: "desc" }],
          take: 6,
        })

  const unanswered = await prisma.question.findMany({
    where: {
      authorId: { not: user.id },
      answers: { none: {} },
      ...(focusTags.length
        ? { tags: { some: { tag: { name: { in: focusTags } } } } }
        : {}),
    },
    include: questionInclude,
    orderBy: { createdAt: "desc" },
    take: 6,
  })

  const bookmarked =
    bookmarkIds.length > 0
      ? await prisma.question.findMany({
          where: { id: { in: bookmarkIds.slice(0, 6) } },
          include: questionInclude,
        })
      : []

  const answeredByMe = await prisma.question.findMany({
    where: {
      answers: { some: { authorId: user.id } },
    },
    include: questionInclude,
    orderBy: { updatedAt: "desc" },
    take: 4,
  })

  return NextResponse.json({
    greetingName: user.name,
    myQuestions: myQuestions.map(mapQuestion),
    recommended: recommended.map(mapQuestion),
    unanswered: unanswered.map(mapQuestion),
    bookmarked: bookmarked.map(mapQuestion),
    answeredByMe: answeredByMe.map(mapQuestion),
    focusTags: focusTags.slice(0, 8),
    followedTags: followedNames,
  })
}
