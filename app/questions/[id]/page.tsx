"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import AnswerCard from "@/components/ui/AnswerCard"
import { Button } from "@/components/ui/button"
import { RelativeTime } from "@/components/ui/RelativeTime"
import { ThumbsUp, Bookmark, ArrowLeft, Trash2 } from "lucide-react"

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const questions = useStore((s) => s.questions)
  const currentUser = useStore((s) => s.currentUser)
  const refreshQuestions = useStore((s) => s.refreshQuestions)
  const addAnswer = useStore((s) => s.addAnswer)
  const voteQuestion = useStore((s) => s.voteQuestion)
  const voteAnswer = useStore((s) => s.voteAnswer)
  const acceptAnswer = useStore((s) => s.acceptAnswer)
  const toggleBookmark = useStore((s) => s.toggleBookmark)

  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [remote, setRemote] = useState<(typeof questions)[0] | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    ;(async () => {
      const res = await fetch(`/api/questions/${id}`, { credentials: "include" })
      if (cancelled) return
      if (!res.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const json = await res.json()
      setRemote(json.question)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const question = useMemo(
    () => questions.find((q) => q.id === id) || remote,
    [questions, remote, id]
  )

  if (loading && !question) {
    return (
      <div className="studio-wrap py-24 text-center text-muted-foreground">Loading thread…</div>
    )
  }

  if (notFound || !question) {
    return (
      <div className="studio-wrap py-24 text-center">
        <h1 className="font-display text-2xl font-semibold mb-3">Thread not found</h1>
        <Link href="/#feed" className="text-[hsl(var(--mesh-signal))] hover:underline">
          Back to feed
        </Link>
      </div>
    )
  }

  const isOwner = currentUser?.id === question.authorId
  const isAdmin = currentUser?.role === "ADMIN"
  const isBookmarked = currentUser?.bookmarks.includes(question.id)

  const reload = async () => {
    const res = await fetch(`/api/questions/${id}`, { credentials: "include" })
    if (res.ok) {
      const json = await res.json()
      setRemote(json.question)
    }
  }

  const deleteThread = async () => {
    if (!confirm("Delete this entire thread? This cannot be undone.")) return
    const res = await fetch(`/api/admin/questions/${question.id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      await refreshQuestions()
      router.push("/#feed")
    }
  }

  const deleteAnswer = async (answerId: string) => {
    if (!confirm("Delete this answer?")) return
    const res = await fetch(`/api/admin/answers/${answerId}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      await reload()
      await refreshQuestions()
    }
  }

  const onAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      setError("Sign in to answer.")
      return
    }
    if (content.trim().length < 5) {
      setError("Write a bit more detail.")
      return
    }
    setPending(true)
    setError("")
    const result = await addAnswer(question.id, content.trim())
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setContent("")
    const res = await fetch(`/api/questions/${id}`, { credentials: "include" })
    if (res.ok) {
      const json = await res.json()
      setRemote(json.question)
    }
  }

  return (
    <div className="studio-wrap max-w-3xl py-10 md:py-14 pb-24">
      <Link
        href="/#feed"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[hsl(var(--mesh-signal))] mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>

      <article className="bg-card border border-border rounded-xl p-6 sm:p-8 mb-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link
            href={`/profile/${question.authorId}`}
            className="font-medium text-foreground hover:text-[hsl(var(--mesh-signal))]"
          >
            {question.author}
          </Link>
          <span aria-hidden>·</span>
          <RelativeTime date={question.date} />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          {question.title}
        </h1>
        <div
          className="prose prose-neutral dark:prose-invert max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: question.description }}
        />
        <div className="flex flex-wrap gap-2 mb-6">
          {question.tags.map((tag) => (
            <Link
              key={tag}
              href={`/?tag=${encodeURIComponent(tag)}#feed`}
              className="tag-pill"
            >
              {tag}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-md gap-2"
            onClick={() => voteQuestion(question.id, 1)}
            disabled={!currentUser}
          >
            <ThumbsUp className="h-4 w-4" />
            {question.votes}
          </Button>
          {currentUser && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-md gap-2"
              onClick={() => toggleBookmark(question.id)}
            >
              <Bookmark
                className="h-4 w-4"
                fill={isBookmarked ? "currentColor" : "none"}
              />
              {isBookmarked ? "Saved" : "Save"}
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-md gap-2 text-destructive hover:text-destructive ml-auto"
              onClick={() => void deleteThread()}
            >
              <Trash2 className="h-4 w-4" />
              Admin delete thread
            </Button>
          )}
        </div>
      </article>

      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold mb-4">
          {question.answers.length} {question.answers.length === 1 ? "Answer" : "Answers"}
        </h2>
        <div className="flex flex-col gap-4">
          {question.answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              questionId={question.id}
              isQuestionOwner={!!isOwner}
              onVote={(answerId, value) => voteAnswer(question.id, answerId, value)}
              onAccept={(answerId) => acceptAnswer(question.id, answerId)}
              onAdminDelete={isAdmin ? (answerId) => void deleteAnswer(answerId) : undefined}
            />
          ))}
          {question.answers.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
              No answers yet — be the first edge in this thread.
            </div>
          )}
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold mb-4">Your answer</h2>
        {!currentUser ? (
          <p className="text-muted-foreground">
            <Link href="/login" className="text-[hsl(var(--mesh-signal))] hover:underline">
              Sign in
            </Link>{" "}
            to contribute an answer.
          </p>
        ) : (
          <form onSubmit={onAnswer} className="grid gap-4">
            {error && (
              <div role="alert" className="text-sm text-destructive">
                {error}
              </div>
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="rounded-lg px-3.5 py-3.5 border border-input bg-background text-sm leading-relaxed resize-y w-full"
              placeholder="Share a clear, helpful answer…"
              required
            />
            <Button
              type="submit"
              disabled={pending}
              className="place-self-start rounded-lg h-11 px-6 font-semibold bg-foreground text-background"
            >
              {pending ? "Posting…" : "Post answer"}
            </Button>
          </form>
        )}
      </section>
    </div>
  )
}
