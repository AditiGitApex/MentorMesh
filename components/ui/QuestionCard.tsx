"use client"

import { MessageCircle, ThumbsUp, Bookmark } from "lucide-react"
import Link from "next/link"
import { Question, useStore } from "@/lib/store"
import { Button } from "./button"
import { RelativeTime } from "./RelativeTime"

export default function QuestionCard({ question }: { question: Question }) {
  const currentUser = useStore((s) => s.currentUser)
  const toggleBookmark = useStore((s) => s.toggleBookmark)
  const isBookmarked = currentUser?.bookmarks.includes(question.id)

  return (
    <article
      className="group relative bg-card border border-border rounded-xl p-5 sm:p-6 transition-all duration-300 hover:border-[hsl(var(--mesh-signal))]/35 hover:shadow-[0_4px_24px_hsl(var(--mesh-signal)/0.06),0_1px_4px_hsl(0_0%_0%/0.04)] hover:-translate-y-0.5"
      style={{ willChange: "transform, box-shadow" }}
    >
      <Link href={`/questions/${question.id}`} className="absolute inset-0 z-0 rounded-xl" aria-label={`View question: ${question.title}`} />
      <span className="absolute top-0 left-6 right-6 h-px bg-transparent group-hover:bg-[hsl(var(--mesh-signal))]/20 transition-colors duration-300 rounded-full" aria-hidden />

      <div className="relative z-10 flex gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Link href={`/profile/${question.authorId}`} className="relative z-20 flex items-center gap-2 group/author">
                <span className="flex h-6 w-6 items-center justify-center border border-border bg-secondary text-[10px] font-bold rounded-md group-hover/author:border-[hsl(var(--mesh-signal))]/40 transition-colors duration-200">
                  {question.author.charAt(0)}
                </span>
                <span className="text-sm font-medium text-muted-foreground hover:text-[hsl(var(--mesh-signal))] truncate transition-colors duration-200">
                  {question.author}
                </span>
              </Link>
              <span className="text-xs text-muted-foreground/70 shrink-0">
                · <RelativeTime date={question.date} />
              </span>
            </div>
            {currentUser && (
              <Button
                variant="ghost"
                size="icon"
                className={`relative z-20 h-8 w-8 rounded-md transition-all duration-200 ${
                  isBookmarked
                    ? "text-[hsl(var(--mesh-signal))] bg-[hsl(var(--mesh-wash))] scale-105"
                    : "text-muted-foreground/60 hover:text-[hsl(var(--mesh-signal))] hover:bg-[hsl(var(--mesh-wash))]/60 sm:opacity-0 sm:group-hover:opacity-100"
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  void toggleBookmark(question.id)
                }}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
              >
                <Bookmark className="h-4 w-4 transition-transform duration-200" fill={isBookmarked ? "currentColor" : "none"} />
              </Button>
            )}
          </div>

          <Link href={`/questions/${question.id}`} className="relative z-20 block group/title">
            <h3 className="font-display text-lg sm:text-xl font-semibold tracking-tight leading-snug mb-2.5 line-clamp-2 group-hover/title:text-[hsl(var(--mesh-signal))] transition-colors duration-200">
              {question.title}
            </h3>
          </Link>

          <div
            className="text-sm text-muted-foreground line-clamp-2 mb-3.5 pointer-events-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.description }}
          />

          <div className="flex flex-wrap gap-1.5">
            {question.tags.map((tag) => (
              <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}#feed`} className="relative z-20 tag-pill">
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-3 shrink-0 text-sm text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5 group/votes">
            <span className="font-semibold text-foreground tabular-nums group-hover/votes:text-[hsl(var(--mesh-signal))] transition-colors duration-200">
              {question.votes}
            </span>
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
          </div>
          <div className="flex items-center gap-1.5 group/answers">
            <span className="font-semibold text-foreground tabular-nums group-hover/answers:text-[hsl(var(--mesh-signal))] transition-colors duration-200">
              {question.answers?.length || 0}
            </span>
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          </div>
        </div>
      </div>
    </article>
  )
}
