import Link from "next/link"
import { MeshMark } from "@/components/ui/MeshMark"

export default function SiteFooter() {
  return (
    <footer className="border-t border-border mt-auto w-full bg-background/80 backdrop-blur-sm">
      <div className="studio-wrap py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <MeshMark size={18} className="text-[hsl(var(--mesh-signal))]" />
            <div>
              <p className="font-display text-base font-semibold tracking-tight text-foreground">
                MentorMesh
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Knowledge, woven with care.</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Footer">
            {[
              { href: "/#feed", label: "Threads" },
              { href: "/tags", label: "Tags" },
              { href: "/leaderboard", label: "Leaderboard" },
              { href: "/ask", label: "Ask" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="hover:text-[hsl(var(--mesh-signal))] transition-colors duration-200 relative group"
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[hsl(var(--mesh-signal))]/50 group-hover:w-full transition-all duration-300 rounded-full" aria-hidden />
              </Link>
            ))}
          </nav>
        </div>
        <div className="gradient-rule mt-8 mb-4" />
        <p className="text-xs text-muted-foreground/60 text-center">
          Built with intent. Questions asked, knowledge shared.
        </p>
      </div>
    </footer>
  )
}
