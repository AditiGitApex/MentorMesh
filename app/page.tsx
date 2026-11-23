"use client"

import { useStore } from "@/lib/store"
import GuestHome from "@/components/home/GuestHome"
import MemberHome from "@/components/home/MemberHome"

export default function HomePage() {
  const currentUser = useStore((s) => s.currentUser)
  const hydrated = useStore((s) => s.hydrated)

  if (!hydrated) {
    return (
      <div className="studio-wrap py-24 text-center text-muted-foreground">
        Loading MentorMesh…
      </div>
    )
  }

  if (currentUser) return <MemberHome user={currentUser} />
  return <GuestHome />
}
