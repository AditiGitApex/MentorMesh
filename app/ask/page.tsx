"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X, Send, ImagePlus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import Link from "next/link"

export default function AskQuestionPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const currentUser = useStore((s) => s.currentUser)
  const hydrated = useStore((s) => s.hydrated)
  const addQuestion = useStore((s) => s.addQuestion)

  if (!hydrated) {
    return (
      <div className="studio-wrap py-24 text-center text-muted-foreground">Loading…</div>
    )
  }

  if (!currentUser) {
    return (
      <div className="studio-wrap flex flex-col items-center justify-center min-h-[50vh] text-center py-20">
        <div className="animate-fade-up">
          <h1 className="font-display text-2xl font-semibold mb-3">Sign in to ask</h1>
          <p className="text-muted-foreground mb-6">Only members can add nodes to the mesh.</p>
          <Link href="/login">
            <Button className="rounded-lg h-11 px-6 font-semibold bg-foreground text-background hover:opacity-85 transition-all duration-200">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files)
    if (!list.length) return
    if (images.length + list.length > 6) {
      setError("You can attach up to 6 images.")
      return
    }
    setUploading(true)
    setError("")
    try {
      const uploaded: string[] = []
      for (const file of list) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed.")
          continue
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be under 5MB.")
          continue
        }
        const form = new FormData()
        form.append("file", file)
        const res = await fetch("/api/uploads", {
          method: "POST",
          body: form,
          credentials: "include",
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(json.error || "Upload failed.")
          break
        }
        if (json.url) uploaded.push(json.url as string)
      }
      if (uploaded.length) setImages((prev) => [...prev, ...uploaded].slice(0, 6))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || title.trim().length < 8) {
      setError("Title needs at least 8 characters.")
      return
    }
    if (!description || description.trim().length < 10) {
      setError("Add a bit more detail (10+ characters).")
      return
    }
    if (tags.length === 0) {
      setError("Add at least one tag.")
      return
    }
    if (tags.length > 8) {
      setError("You can add up to 8 tags.")
      return
    }
    setPending(true)
    setError("")
    const result = await addQuestion({
      title,
      description,
      tags,
      images,
    })
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    router.push(`/questions/${result.question.id}`)
  }

  return (
    <div className="studio-wrap max-w-3xl py-12 md:py-16 pb-24">
      <div className="animate-fade-up">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[hsl(var(--mesh-signal))] mb-3">
          New node
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">
          Ask the mesh
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Be specific — ask as if speaking to one expert. Screenshots help a lot.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm animate-fade-up delay-100">
        {error && (
          <div
            role="alert"
            className="mb-6 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg p-3 animate-scale-in"
          >
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="grid gap-8">
          <div className="grid gap-2.5">
            <Label htmlFor="title" className="text-sm font-semibold">
              Title
              <span className="ml-1 text-xs text-muted-foreground font-normal">(be specific)</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-lg bg-background border-border transition-colors duration-200"
              placeholder="e.g. How do I handle async errors in React?"
              required
            />
          </div>
          <div className="grid gap-2.5">
            <Label htmlFor="description" className="text-sm font-semibold">
              Details
              <span className="ml-1 text-xs text-muted-foreground font-normal">(provide context)</span>
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
              className="rounded-lg px-3.5 py-3.5 border border-input bg-background text-sm leading-relaxed resize-y transition-colors duration-200 w-full"
              placeholder="Describe your problem with enough context for experts to help…"
              required
              onPaste={(e) => {
                const items = e.clipboardData?.files
                if (items && items.length) void uploadFiles(items)
              }}
            />
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files) void uploadFiles(e.target.files)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg gap-2"
                disabled={uploading || images.length >= 6}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {uploading ? "Uploading…" : "Add images"}
              </Button>
              <span className="text-xs text-muted-foreground">
                PNG, JPEG, WebP, or GIF · up to 6 · 5MB each
              </span>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {images.map((src) => (
                  <div
                    key={src}
                    className="relative aspect-video rounded-lg overflow-hidden border border-border bg-secondary"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remove image"
                      className="absolute top-1.5 right-1.5 h-7 w-7 rounded-md bg-background/90 border border-border flex items-center justify-center hover:bg-background"
                      onClick={() => setImages((prev) => prev.filter((u) => u !== src))}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-2.5">
            <Label htmlFor="tags" className="text-sm font-semibold">
              Tags
              <span className="ml-1 text-xs text-muted-foreground font-normal">(press Enter to add)</span>
            </Label>
            <Input
              id="tags"
              placeholder="e.g. AIML, React, DSA"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === "Enter" && tagsInput.trim()) {
                  e.preventDefault()
                  if (tags.length >= 8) {
                    setError("You can add up to 8 tags.")
                    return
                  }
                  const t = tagsInput.trim()
                  if (!tags.includes(t)) setTags([...tags, t])
                  setTagsInput("")
                }
              }}
              className="h-12 rounded-lg bg-background border-border transition-colors duration-200"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm border border-[hsl(var(--mesh-signal))]/25 rounded-lg bg-[hsl(var(--mesh-wash))] text-[hsl(var(--mesh-signal))] animate-scale-in"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== tag))}
                      aria-label={`Remove ${tag}`}
                      className="opacity-60 hover:opacity-100 transition-opacity duration-150"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={pending || uploading}
            className="place-self-start h-11 px-7 rounded-lg font-semibold bg-foreground text-background hover:opacity-85 transition-all duration-200 group gap-2"
          >
            {pending ? "Posting…" : "Post question"}
            {!pending && (
              <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
