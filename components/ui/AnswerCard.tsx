"use client"

import { Button } from "@/components/ui/button"
import { ThumbsUp, CheckCircle2 } from "lucide-react"
import { Answer } from "@/lib/store"
import Link from "next/link"
import { formatDate } from "@/components/ui/RelativeTime"

export default function AnswerCard({
  answer,
  isQuestionOwner,
  onVote,
  onAccept,
  onAdminDelete,
}: {
  answer: Answer
  questionId: string
  isQuestionOwner: boolean
  onVote: (answerId: string, value: number) => void
  onAccept: (answerId: string) => void
  onAdminDelete?: (answerId: string) => void
}) {
  return (
    <article
      className={`rounded-xl border overflow-hidden transition-all duration-300 ${
        answer.isAccepted
          ? "border-[hsl(var(--mesh-signal))]/50 bg-[hsl(var(--mesh-wash))] shadow-[0_2px_16px_hsl(var(--mesh-signal)/0.08)]"
          : "border-border bg-card hover:border-[hsl(var(--mesh-signal))]/25 hover:shadow-[0_2px_12px_hsl(0_0%_0%/0.05)]"
      }`}
    >
      {answer.isAccepted && (
        <div className="flex items-center gap-2 px-6 sm:px-8 py-2.5 border-b border-[hsl(var(--mesh-signal))]/20 bg-[hsl(var(--mesh-signal))]/8">
          <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--mesh-signal))]" aria-hidden />
          <span className="text-xs font-semibold text-[hsl(var(--mesh-signal))] tracking-wide uppercase">
            Accepted Answer
          </span>
        </div>
      )}

      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-5">
        <div className="flex sm:flex-col items-center gap-2 sm:min-w-[52px]">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md text-muted-foreground hover:text-[hsl(var(--mesh-signal))] hover:bg-[hsl(var(--mesh-wash))]/70 transition-all duration-200 group"
            onClick={() => onVote(answer.id, 1)}
            aria-label={`Upvote, ${answer.votes}`}
          >
            <ThumbsUp className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          </Button>
          <span
            className={`font-semibold tabular-nums text-base transition-colors duration-200 ${
              answer.isAccepted ? "text-[hsl(var(--mesh-signal))]" : "text-foreground"
            }`}
          >
            {answer.votes}
          </span>
          {answer.isAccepted && (
            <CheckCircle2
              className="h-5 w-5 text-[hsl(var(--mesh-signal))] sm:mt-1 animate-scale-in"
              aria-label="Accepted"
            />
          )}
          {!answer.isAccepted && isQuestionOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="sm:mt-1 h-9 w-9 rounded-md text-muted-foreground hover:text-[hsl(var(--mesh-signal))] hover:bg-[hsl(var(--mesh-wash))]/70 transition-all duration-200 group"
              onClick={() => onAccept(answer.id)}
              aria-label="Accept this answer"
            >
              <CheckCircle2 className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
            </Button>
          )}
        </div>
        <div
          className="flex-1 prose prose-neutral dark:prose-invert max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: answer.content }}
        />
      </div>
      <div className="border-t border-border/70 px-6 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground bg-secondary/15">
        <div className="flex flex-wrap items-center gap-2">
          <span>Answered by</span>
          <Link
            href={`/profile/${answer.authorId}`}
            className="font-semibold text-foreground hover:text-[hsl(var(--mesh-signal))] transition-colors duration-200"
          >
            {answer.author}
          </Link>
          <span aria-hidden>·</span>
          <time dateTime={answer.date}>{formatDate(answer.date, "short")}</time>
        </div>
        {onAdminDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-destructive hover:text-destructive"
            onClick={() => onAdminDelete(answer.id)}
          >
            Admin delete
          </Button>
        )}
      </div>
    </article>
  )
}
