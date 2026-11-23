"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="studio-wrap py-24 text-center">
      <h1 className="font-display text-2xl font-semibold mb-3">Something went wrong</h1>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Refresh the page or try again. If this keeps happening, sign out and back in.
      </p>
      <Button onClick={reset} className="rounded-lg">
        Try again
      </Button>
    </div>
  )
}
