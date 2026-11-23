"use client"

import { useRef, useState } from "react"
import { Camera, RefreshCw, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { avatarPresets, buildAvatarUrl, type AvatarStyle } from "@/lib/avatars"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (url: string) => void
  seedHint?: string
  size?: "md" | "lg"
  className?: string
}

async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const max = 512
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unsupported")
  ctx.drawImage(bitmap, 0, 0, w, h)
  return canvas.toDataURL("image/jpeg", 0.86)
}

export default function AvatarPicker({
  value,
  onChange,
  seedHint = "mentor",
  size = "md",
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [seed, setSeed] = useState(seedHint)
  const [error, setError] = useState("")
  const presets = avatarPresets(seed)
  const px = size === "lg" ? "h-28 w-28" : "h-24 w-24"

  const shuffle = () => {
    const next = `${seedHint}-${Math.random().toString(36).slice(2, 8)}`
    setSeed(next)
    onChange(buildAvatarUrl("avataaars", next))
  }

  const onUpload = async (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.")
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be under 4MB.")
      return
    }
    try {
      setError("")
      const dataUrl = await fileToDataUrl(file)
      onChange(dataUrl)
    } catch {
      setError("Could not process that image.")
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative">
        <div
          className={cn(
            px,
            "rounded-2xl overflow-hidden border-2 border-border bg-secondary shadow-sm ring-4 ring-[hsl(var(--mesh-wash))]"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Profile preview" className="h-full w-full object-cover" />
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
          aria-label="Upload profile picture"
        >
          <Camera className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => void onUpload(e.target.files?.[0])}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={shuffle}>
          <RefreshCw className="h-3.5 w-3.5" />
          Shuffle
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg gap-1.5"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </Button>
      </div>

      <div className="w-full">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-2.5">
          Or pick a style
        </p>
        <div className="grid grid-cols-6 gap-2 max-w-sm mx-auto">
          {presets.map((p) => {
            const selected = value === p.url
            return (
              <button
                key={p.style}
                type="button"
                title={p.label}
                onClick={() => onChange(p.url)}
                className={cn(
                  "aspect-square rounded-xl overflow-hidden border bg-card transition-all duration-200",
                  selected
                    ? "border-[hsl(var(--mesh-signal))] ring-2 ring-[hsl(var(--mesh-signal))]/25 scale-[1.03]"
                    : "border-border hover:border-[hsl(var(--mesh-signal))]/40"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.label} className="h-full w-full object-cover" />
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function pickStyleAvatar(style: AvatarStyle, seed: string) {
  return buildAvatarUrl(style, seed)
}
