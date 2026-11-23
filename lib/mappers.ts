import type { Answer, Question, Tag, User } from "@prisma/client"

export type ApiAnswer = {
  id: string
  author: string
  authorId: string
  date: string
  content: string
  votes: number
  isAccepted?: boolean
}

export type ApiQuestion = {
  id: string
  title: string
  description: string
  tags: string[]
  votes: number
  answers: ApiAnswer[]
  author: string
  authorId: string
  date: string
}

export type ApiUser = {
  id: string
  name: string
  email: string
  avatar: string
  bio?: string | null
  reputation: number
  bookmarks: string[]
  role?: "USER" | "ADMIN"
  enrollmentNo?: string | null
  branch?: string | null
  division?: string | null
  batch?: string | null
  section?: string | null
}

type QWithRelations = Question & {
  author: Pick<User, "id" | "name">
  tags: { tag: Pick<Tag, "name"> }[]
  answers: (Pick<Answer, "id" | "authorId" | "content" | "votes" | "isAccepted" | "createdAt"> & {
    author: Pick<User, "id" | "name">
  })[]
}

export function mapAnswer(
  a: Pick<Answer, "id" | "authorId" | "content" | "votes" | "isAccepted" | "createdAt"> & {
    author: Pick<User, "id" | "name">
  }
): ApiAnswer {
  return {
    id: a.id,
    author: a.author.name,
    authorId: a.authorId,
    date: a.createdAt.toISOString(),
    content: a.content,
    votes: a.votes,
    isAccepted: a.isAccepted,
  }
}

export function mapQuestion(q: QWithRelations): ApiQuestion {
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    tags: q.tags.map((t) => t.tag.name),
    votes: q.votes,
    answers: [...q.answers]
      .sort((a, b) => Number(b.isAccepted) - Number(a.isAccepted) || b.votes - a.votes)
      .map(mapAnswer),
    author: q.author.name,
    authorId: q.authorId,
    date: q.createdAt.toISOString(),
  }
}

/** Public profile card — hide email & bookmarks from other users. */
export function mapUserPublic(
  u: User & { bookmarks?: { questionId: string }[] }
): ApiUser {
  return {
    id: u.id,
    name: u.name,
    email: "",
    avatar: u.avatar,
    bio: u.bio ?? null,
    reputation: u.reputation,
    bookmarks: [],
    role: u.role,
    enrollmentNo: u.enrollmentNo,
    branch: u.branch,
    division: u.division,
    batch: u.batch,
    section: u.section,
  }
}

/** Full user for self / admin contexts. */
export function mapUser(
  u: User & { bookmarks?: { questionId: string }[] }
): ApiUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    bio: u.bio ?? null,
    reputation: u.reputation,
    bookmarks: u.bookmarks?.map((b) => b.questionId) ?? [],
    role: u.role,
    enrollmentNo: u.enrollmentNo,
    branch: u.branch,
    division: u.division,
    batch: u.batch,
    section: u.section,
  }
}

/** Feed list: answers counted via _count, not nested bodies. */
export const questionInclude = {
  author: { select: { id: true, name: true } },
  tags: { include: { tag: { select: { name: true } } } },
  answers: {
    include: { author: { select: { id: true, name: true } } },
    orderBy: [
      { isAccepted: "desc" as const },
      { votes: "desc" as const },
      { createdAt: "asc" as const },
    ],
  },
}

/** List mapper uses _count when answers were truncated. */
export function mapQuestionList(
  q: Question & {
    author: Pick<User, "id" | "name">
    tags: { tag: Pick<Tag, "name"> }[]
    _count?: { answers: number }
    answers?: QWithRelations["answers"]
  }
): ApiQuestion {
  const answerCount = q._count?.answers ?? q.answers?.length ?? 0
  const stubAnswers = Array.from({ length: answerCount }, (_, i) => ({
    id: `stub-${q.id}-${i}`,
    author: "",
    authorId: "",
    date: q.createdAt.toISOString(),
    content: "",
    votes: 0,
  }))
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    tags: q.tags.map((t) => t.tag.name),
    votes: q.votes,
    answers: stubAnswers,
    author: q.author.name,
    authorId: q.authorId,
    date: q.createdAt.toISOString(),
  }
}
