import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { mapQuestionList } from "@/lib/mappers"
import { requireUser, jsonError, getSessionUserId } from "@/lib/auth"
import { sanitizeHtml, plainToHtml, buildQuestionHtml, isSafeImageSrc } from "@/lib/sanitize"
import { notifyTagFollowers } from "@/lib/notifications"
import { mapQuestion, questionInclude } from "@/lib/mappers"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() || ""
  const tag = searchParams.get("tag")?.trim() || ""
  const authorId = searchParams.get("authorId")?.trim() || ""
  const bookmarkedBy = searchParams.get("bookmarkedBy")?.trim() || ""
  const following = searchParams.get("following") === "1"

  let followedTagIds: string[] | null = null
  if (following) {
    const user = await requireUser(req)
    if (!user) return jsonError("Sign in to view followed tags.", 401)
    const follows = await prisma.tagFollow.findMany({
      where: { userId: user.id },
      select: { tagId: true },
    })
    followedTagIds = follows.map((f) => f.tagId)
  }

  if (bookmarkedBy) {
    const sessionId = await getSessionUserId(req)
    if (!sessionId || sessionId !== bookmarkedBy) {
      return jsonError("You can only view your own bookmarks.", 403)
    }
  }

  const questions = await prisma.question.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
              ],
            }
          : {},
        tag
          ? {
              tags: {
                some: {
                  tag: {
                    name: { contains: tag, mode: "insensitive" },
                  },
                },
              },
            }
          : {},
        followedTagIds
          ? followedTagIds.length
            ? { tags: { some: { tagId: { in: followedTagIds } } } }
            : { id: "__none__" }
          : {},
        authorId ? { authorId } : {},
        bookmarkedBy
          ? { bookmarks: { some: { userId: bookmarkedBy } } }
          : {},
      ],
    },
    include: {
      author: { select: { id: true, name: true } },
      tags: { include: { tag: { select: { name: true } } } },
      _count: { select: { answers: true } },
    },
    orderBy: { createdAt: "desc" },
    // Keep feed light for a campus demo (~100 recent threads)
    take: authorId || bookmarkedBy ? 50 : 100,
  })

  return NextResponse.json({ questions: questions.map(mapQuestionList) })
}

const createSchema = z.object({
  title: z.string().min(8).max(200),
  description: z.string().min(10).max(20000),
  tags: z.array(z.string().min(1).max(40)).min(1).max(8),
  images: z.array(z.string().min(1).max(500)).max(6).optional(),
})

export async function POST(req: NextRequest) {
  const user = await requireUser(req)
  if (!user) return jsonError("Sign in to ask a question.", 401)

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return jsonError("Title (8+ chars), details, and 1–8 tags are required.")

  const tags = [...new Set(parsed.data.tags.map((t) => t.trim()).filter(Boolean))]
  const images = (parsed.data.images || []).filter(isSafeImageSrc)

  let html: string
  if (parsed.data.description.includes("<")) {
    html = sanitizeHtml(parsed.data.description)
    if (images.length) {
      html += images
        .map(
          (src) =>
            `<figure class="question-figure"><img src="${src}" alt="Attached image" loading="lazy" class="question-image" /></figure>`
        )
        .join("")
    }
  } else {
    html = buildQuestionHtml(parsed.data.description, images)
  }

  const tagRows = await Promise.all(
    tags.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  )

  const question = await prisma.question.create({
    data: {
      title: parsed.data.title.trim(),
      description: html,
      authorId: user.id,
      tags: {
        create: tagRows.map((t) => ({ tagId: t.id })),
      },
    },
    include: questionInclude,
  })

  await notifyTagFollowers({
    tagIds: tagRows.map((t) => t.id),
    excludeUserId: user.id,
    title: "New thread in a tag you follow",
    message: `${user.name} posted “${question.title}”.`,
    link: `/questions/${question.id}`,
    questionId: question.id,
  })

  return NextResponse.json({ question: mapQuestion(question) }, { status: 201 })
}
