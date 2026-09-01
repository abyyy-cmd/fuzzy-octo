"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Send, User, Clock, CheckCircle2 } from "lucide-react"
import type { LeadRecord } from "@/db/queries"

interface SlideOutPanelProps {
  lead: LeadRecord | null
  onClose: () => void
}

export function SlideOutPanel({ lead, onClose }: SlideOutPanelProps) {
  const [replyText, setReplyText] = React.useState("")
  const [sentReplies, setSentReplies] = React.useState<string[]>([])

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setSentReplies((prev) => [...prev, replyText.trim()])
    setReplyText("")
  }

  // If no lead is selected, do not open / render
  if (!lead) return null

  const isOpen = lead !== null
  const status = lead.leadStatus || "prospecting"

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col p-0 overflow-hidden bg-background">
        {/* Header */}
        <div className="p-6 border-b border-border/80 bg-muted/20">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono">
                Lead ID #{lead.id.slice(0, 8)}
              </Badge>
              <Badge
                variant="outline"
                className={
                  status === "booked"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 capitalize"
                    : status === "replied"
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 capitalize"
                    : status === "contacted"
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 capitalize"
                    : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 capitalize"
                }
              >
                {status === "booked" ? "Meeting Booked" : status}
              </Badge>
            </div>
            <SheetTitle className="text-xl font-bold mt-2">
              {lead.companyName}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <User className="h-3.5 w-3.5" /> {lead.primaryContact || "No contact specified"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {lead.lastInteractionAt
                  ? `Last touch ${new Date(lead.lastInteractionAt).toLocaleDateString()}`
                  : "No touches yet"}
              </span>
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Timeline Activity */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Omnichannel Activity History</span>
            <span className="text-[10px] font-normal text-muted-foreground/80 font-mono">
              {lead.email || "No email"}
            </span>
          </div>

          {/* Lead Status Timeline Step */}
          <div className="relative pl-6 pb-2 before:absolute before:left-2 before:top-3 before:bottom-0 before:w-0.5 before:bg-border">
            <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center ring-4 ring-background">
              <Mail className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
            <div className="rounded-lg border border-border/80 bg-card p-4 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-primary flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Outbound Sequence ({lead.channel || "manyreach"})
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "Recently"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Lead imported and staged for automated sequence execution.
              </p>
            </div>
          </div>

          {/* Additional details if status is replied / booked */}
          {(status === "replied" || status === "booked") && (
            <div className="relative pl-6 pb-2 before:absolute before:left-2 before:top-3 before:bottom-0 before:w-0.5 before:bg-border">
              <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-background">
                <CheckCircle2 className="h-2.5 w-2.5 text-white" />
              </div>
              <div className="rounded-lg border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Inbound Response Logged
                  </span>
                </div>
                <p className="text-xs text-foreground font-medium">
                  Prospect responded and expressed interest in reviewing workflows.
                </p>
              </div>
            </div>
          )}

          {/* Dynamically sent replies */}
          {sentReplies.map((reply, idx) => (
            <div key={idx} className="relative pl-6 pt-1">
              <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center ring-4 ring-background">
                <Send className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Your Reply (Sent)</span>
                  <span className="text-muted-foreground text-[10px]">Just now</span>
                </div>
                <p className="text-xs text-foreground">{reply}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action Footer */}
        <form onSubmit={handleSendReply} className="p-4 border-t border-border bg-muted/30 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder={`Send reply to ${lead.primaryContact ? lead.primaryContact.split(' ')[0] : 'prospect'}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary pr-20"
            />
            <Button type="submit" size="sm" className="absolute right-1 top-1 h-7 text-xs gap-1 cursor-pointer">
              <Send className="h-3 w-3" />
              Reply
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
