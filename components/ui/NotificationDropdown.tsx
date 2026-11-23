"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MessageCircle, Bell, CheckCheck } from "lucide-react"
import { useStore, Notification } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate } from "@/components/ui/RelativeTime"

export default function NotificationDropdown() {
  const currentUser = useStore((state) => state.currentUser)
  const notifications = useStore((state) => state.notifications)
  const refreshNotifications = useStore((state) => state.refreshNotifications)
  const markRead = useStore((state) => state.markNotificationsRead)
  const unreadCount = notifications.filter((n) => !n.read).length
  const router = useRouter()

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    void refreshNotifications()
    const id = window.setInterval(() => {
      void refreshNotifications()
    }, 45_000)
    return () => window.clearInterval(id)
  }, [currentUser?.id, refreshNotifications])

  const handleOpenChange = (open: boolean) => {
    setDropdownOpen(open)
    if (open) void refreshNotifications()
  }

  const handleNotificationClick = async (notification: Notification) => {
    setDropdownOpen(false)
    if (!notification.read) {
      await markRead([notification.id])
    }
    if (notification.link) {
      router.push(notification.link)
    } else {
      setSelectedNotification(notification)
    }
  }

  if (!currentUser) return null

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-md h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary"
            aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[hsl(var(--mesh-signal))] text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-80 rounded-lg p-2 mt-2 studio-surface shadow-lg"
        >
          <div className="flex items-center justify-between px-2">
            <DropdownMenuLabel className="font-display font-semibold px-1 py-2 text-sm">
              Notifications
            </DropdownMenuLabel>
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 text-muted-foreground"
                onClick={() => void markRead()}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <DropdownMenuItem className="text-muted-foreground text-sm px-3 py-4 justify-center cursor-default focus:bg-transparent">
              No notifications yet. Follow tags to get alerts.
            </DropdownMenuItem>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 py-3 px-3 rounded-md cursor-pointer ${
                    notification.read ? "opacity-70" : "bg-[hsl(var(--mesh-wash))]"
                  }`}
                  onSelect={(e) => {
                    e.preventDefault()
                    void handleNotificationClick(notification)
                  }}
                >
                  <MessageCircle
                    className={`h-4 w-4 mt-0.5 shrink-0 ${
                      notification.read
                        ? "text-muted-foreground"
                        : "text-[hsl(var(--mesh-signal))]"
                    }`}
                  />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div
                      className={`text-sm leading-snug ${
                        notification.read ? "font-medium" : "font-semibold"
                      }`}
                    >
                      {notification.title || "Notification"}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {formatDate(notification.date, "short")}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={!!selectedNotification}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent className="sm:max-w-[425px] studio-surface rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-semibold">
              {selectedNotification?.title || "Notification"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed py-2">
            {selectedNotification?.message}
          </p>
          {selectedNotification?.date && (
            <p className="text-xs text-muted-foreground text-right">
              {formatDate(selectedNotification.date, "long")}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
