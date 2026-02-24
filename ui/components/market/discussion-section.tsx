"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  MessageCircle,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  TrendingUp,
  Flag,
  Bookmark,
  Copy,
  Minus,
  Award,
} from "lucide-react"
import type { Comment } from "@/lib/types/market"

type SortMode = "hot" | "new" | "top"

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const AVATAR_COLORS = [
  "bg-primary/15 text-primary",
  "bg-success/15 text-success",
  "bg-chart-3/15 text-chart-3",
  "bg-warning/15 text-warning",
  "bg-destructive/15 text-destructive",
]

function getAvatarColor(userId: string) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatVotes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function countAllReplies(comments: Comment[]): number {
  let count = 0
  for (const c of comments) {
    count += 1
    if (c.replies?.length) count += countAllReplies(c.replies)
  }
  return count
}

function sortComments(comments: Comment[], mode: SortMode): Comment[] {
  const sorted = [...comments]
  switch (mode) {
    case "hot":
      sorted.sort((a, b) => (b.upvotes - b.downvotes + (b.replies?.length ?? 0) * 2) - (a.upvotes - a.downvotes + (a.replies?.length ?? 0) * 2))
      break
    case "new":
      sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      break
    case "top":
      sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
      break
  }
  return sorted
}

// --- Vote buttons (vertical, Reddit-style) ---
function VoteButtons({
  upvotes,
  downvotes,
  userVote,
  onVote,
}: {
  upvotes: number
  downvotes: number
  userVote?: "up" | "down" | null
  onVote: (dir: "up" | "down") => void
}) {
  const score = upvotes - downvotes
  return (
    <div className="flex flex-col items-center gap-0.5 pt-0.5">
      <button
        onClick={() => onVote("up")}
        className={`group flex size-7 items-center justify-center rounded-md transition-colors ${
          userVote === "up"
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
        }`}
        aria-label="Upvote"
      >
        <ArrowBigUp className={`size-5 ${userVote === "up" ? "fill-primary" : "group-hover:fill-primary/20"}`} />
      </button>
      <span
        className={`text-xs font-bold tabular-nums ${
          userVote === "up"
            ? "text-primary"
            : userVote === "down"
              ? "text-chart-3"
              : "text-foreground"
        }`}
      >
        {formatVotes(score)}
      </span>
      <button
        onClick={() => onVote("down")}
        className={`group flex size-7 items-center justify-center rounded-md transition-colors ${
          userVote === "down"
            ? "bg-chart-3/15 text-chart-3"
            : "text-muted-foreground hover:bg-chart-3/10 hover:text-chart-3"
        }`}
        aria-label="Downvote"
      >
        <ArrowBigDown className={`size-5 ${userVote === "down" ? "fill-chart-3" : "group-hover:fill-chart-3/20"}`} />
      </button>
    </div>
  )
}

// --- Inline vote (horizontal, for nested replies) ---
function InlineVoteButtons({
  upvotes,
  downvotes,
  userVote,
  onVote,
}: {
  upvotes: number
  downvotes: number
  userVote?: "up" | "down" | null
  onVote: (dir: "up" | "down") => void
}) {
  const score = upvotes - downvotes
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => onVote("up")}
        className={`flex size-6 items-center justify-center rounded transition-colors ${
          userVote === "up"
            ? "text-primary"
            : "text-muted-foreground hover:text-primary"
        }`}
        aria-label="Upvote"
      >
        <ArrowBigUp className={`size-4 ${userVote === "up" ? "fill-primary" : ""}`} />
      </button>
      <span
        className={`min-w-[1.25rem] text-center text-xs font-bold tabular-nums ${
          userVote === "up" ? "text-primary" : userVote === "down" ? "text-chart-3" : "text-muted-foreground"
        }`}
      >
        {formatVotes(score)}
      </span>
      <button
        onClick={() => onVote("down")}
        className={`flex size-6 items-center justify-center rounded transition-colors ${
          userVote === "down"
            ? "text-chart-3"
            : "text-muted-foreground hover:text-chart-3"
        }`}
        aria-label="Downvote"
      >
        <ArrowBigDown className={`size-4 ${userVote === "down" ? "fill-chart-3" : ""}`} />
      </button>
    </div>
  )
}

// --- Bet position flair ---
function BetFlair({ position, amount }: { position?: "yes" | "no" | null; amount?: number }) {
  if (!position) return null
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={`h-5 gap-1 rounded-full px-1.5 text-[10px] font-bold uppercase leading-none ${
            position === "yes"
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {position === "yes" ? "YES" : "NO"}
          {amount != null && (
            <span className="font-normal opacity-80">{amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount}</span>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        Staked {amount?.toLocaleString() ?? "?"} CHZ on {position.toUpperCase()}
      </TooltipContent>
    </Tooltip>
  )
}

// --- Comment compose box ---
function CommentComposer({
  onSubmit,
  placeholder = "What are your thoughts?",
  autoFocus = false,
  onCancel,
  compact = false,
}: {
  onSubmit: (text: string) => void
  placeholder?: string
  autoFocus?: boolean
  onCancel?: () => void
  compact?: boolean
}) {
  const [text, setText] = useState("")
  const [focused, setFocused] = useState(autoFocus)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    onSubmit(text.trim())
    setText("")
    setFocused(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div
        className={`rounded-lg border transition-colors ${
          focused ? "border-primary/50 bg-background shadow-sm" : "border-border bg-muted/50 hover:border-muted-foreground/30"
        }`}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={focused ? (compact ? 2 : 3) : 1}
          className={`w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none ${
            compact ? "text-[13px]" : ""
          }`}
        />
        {focused && (
          <div className="flex items-center justify-between border-t border-border/50 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">
              {text.length > 0 && <span className="tabular-nums">{text.length}</span>}
            </p>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs text-muted-foreground"
                  onClick={() => {
                    setText("")
                    setFocused(false)
                    onCancel()
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={!text.trim()}
                className="h-7 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                {onCancel ? "Reply" : "Comment"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}

// --- Single comment thread ---
function CommentThread({
  comment,
  depth = 0,
  onVote,
  onReply,
  isTopLevel = false,
}: {
  comment: Comment
  depth?: number
  onVote: (commentId: string, dir: "up" | "down") => void
  onReply: (parentId: string, text: string) => void
  isTopLevel?: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const replyCount = comment.replies?.length ?? 0
  const maxDepth = 4

  function handleReply(text: string) {
    onReply(comment.id, text)
    setShowReply(false)
  }

  if (collapsed) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Expand thread"
        >
          <ChevronDown className="size-3.5" />
        </button>
        <Avatar className="size-5">
          <AvatarFallback className={`text-[9px] font-semibold ${getAvatarColor(comment.userId)}`}>
            {getInitials(comment.userName)}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium text-muted-foreground">{comment.userName}</span>
        <span className="text-[11px] text-muted-foreground/60">{timeAgo(comment.timestamp)}</span>
        <span className="text-[11px] text-muted-foreground/60">
          ({formatVotes(comment.upvotes - comment.downvotes)} pts, {replyCount} {replyCount === 1 ? "reply" : "replies"})
        </span>
      </div>
    )
  }

  return (
    <div className={`group/thread ${isTopLevel ? "" : "relative"}`}>
      <div className="flex gap-2.5">
        {/* Left: votes (top-level) or thread line (nested) */}
        {isTopLevel ? (
          <VoteButtons
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            userVote={comment.userVote}
            onVote={(dir) => onVote(comment.id, dir)}
          />
        ) : (
          <div className="flex flex-col items-center">
            <Avatar className="size-6 shrink-0">
              <AvatarFallback className={`text-[9px] font-semibold ${getAvatarColor(comment.userId)}`}>
                {getInitials(comment.userName)}
              </AvatarFallback>
            </Avatar>
            {(replyCount > 0 || showReply) && (
              <button
                onClick={() => setCollapsed(true)}
                className="mt-1 flex w-px flex-1 justify-center group/line"
                aria-label="Collapse thread"
              >
                <div className="w-px bg-border group-hover/line:bg-primary transition-colors" />
              </button>
            )}
          </div>
        )}

        {/* Right: content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pb-1">
          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-1.5">
            {isTopLevel && (
              <Avatar className="size-6 shrink-0">
                <AvatarFallback className={`text-[9px] font-semibold ${getAvatarColor(comment.userId)}`}>
                  {getInitials(comment.userName)}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="text-[13px] font-semibold text-foreground">{comment.userName}</span>
            {comment.isOP && (
              <Badge variant="outline" className="h-4 rounded-sm border-primary/30 bg-primary/10 px-1 text-[9px] font-bold uppercase text-primary">
                OP
              </Badge>
            )}
            <BetFlair position={comment.betPosition} amount={comment.betAmount} />
            {comment.betAmount != null && comment.betAmount >= 5000 && (
              <Tooltip>
                <TooltipTrigger>
                  <Award className="size-3.5 text-warning" />
                </TooltipTrigger>
                <TooltipContent>High-value staker</TooltipContent>
              </Tooltip>
            )}
            <span className="text-[11px] text-muted-foreground">{timeAgo(comment.timestamp)}</span>
            {comment.edited && (
              <span className="text-[11px] italic text-muted-foreground/60">(edited)</span>
            )}
          </div>

          {/* Body */}
          <div className="text-[13px] leading-relaxed text-foreground/90 whitespace-pre-line">
            {comment.text}
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-1 -ml-1.5">
            {!isTopLevel && (
              <InlineVoteButtons
                upvotes={comment.upvotes}
                downvotes={comment.downvotes}
                userVote={comment.userVote}
                onVote={(dir) => onVote(comment.id, dir)}
              />
            )}
            <button
              onClick={() => setShowReply(!showReply)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                showReply
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <MessageSquare className="size-3.5" />
              Reply
            </button>
            <button
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(comment.text)
              }}
            >
              <Share2 className="size-3.5" />
              Share
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <MoreHorizontal className="size-3.5" />
                  <span className="sr-only">More options</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[140px]">
                <DropdownMenuItem className="gap-2 text-xs">
                  <Bookmark className="size-3.5" />
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs">
                  <Copy className="size-3.5" />
                  Copy text
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-xs" variant="destructive">
                  <Flag className="size-3.5" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reply composer */}
          {showReply && (
            <div className="mt-1">
              <CommentComposer
                onSubmit={handleReply}
                placeholder={`Reply to ${comment.userName}...`}
                autoFocus
                onCancel={() => setShowReply(false)}
                compact
              />
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-1 flex flex-col gap-3">
              {comment.replies.map((reply) =>
                depth + 1 >= maxDepth ? (
                  <a
                    key={reply.id}
                    href="#"
                    className="flex items-center gap-1.5 py-1 text-xs font-medium text-primary hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Continue this thread &rarr;
                  </a>
                ) : (
                  <CommentThread
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    onVote={onVote}
                    onReply={onReply}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Main discussion section ---
export function DiscussionSection({ comments: initialComments }: { comments: Comment[] }) {
  const [comments, setComments] = useState(initialComments)
  const [sortMode, setSortMode] = useState<SortMode>("hot")

  const totalComments = countAllReplies(comments)
  const sortedComments = sortComments(comments, sortMode)

  const handleVote = useCallback((commentId: string, dir: "up" | "down") => {
    function updateVoteInTree(list: Comment[]): Comment[] {
      return list.map((c) => {
        if (c.id === commentId) {
          const wasUp = c.userVote === "up"
          const wasDown = c.userVote === "down"
          let newVote: "up" | "down" | null = dir
          let upDelta = 0
          let downDelta = 0

          if (dir === "up") {
            if (wasUp) { newVote = null; upDelta = -1 }
            else { upDelta = 1; if (wasDown) downDelta = -1 }
          } else {
            if (wasDown) { newVote = null; downDelta = -1 }
            else { downDelta = 1; if (wasUp) upDelta = -1 }
          }

          return {
            ...c,
            userVote: newVote,
            upvotes: c.upvotes + upDelta,
            downvotes: c.downvotes + downDelta,
          }
        }
        if (c.replies?.length) {
          return { ...c, replies: updateVoteInTree(c.replies) }
        }
        return c
      })
    }
    setComments((prev) => updateVoteInTree(prev))
  }, [])

  const handleReply = useCallback((parentId: string, text: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      userId: "current-user",
      userName: "You",
      text,
      timestamp: new Date().toISOString(),
      upvotes: 1,
      downvotes: 0,
      userVote: "up",
      replies: [],
    }

    function addReplyInTree(list: Comment[]): Comment[] {
      return list.map((c) => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies ?? []), newComment] }
        }
        if (c.replies?.length) {
          return { ...c, replies: addReplyInTree(c.replies) }
        }
        return c
      })
    }
    setComments((prev) => addReplyInTree(prev))
  }, [])

  function handleTopLevelComment(text: string) {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      userId: "current-user",
      userName: "You",
      text,
      timestamp: new Date().toISOString(),
      upvotes: 1,
      downvotes: 0,
      userVote: "up",
      replies: [],
    }
    setComments((prev) => [newComment, ...prev])
  }

  const sortOptions: { key: SortMode; label: string; icon: React.ReactNode }[] = [
    { key: "hot", label: "Hot", icon: <Flame className="size-3.5" /> },
    { key: "new", label: "New", icon: <Clock className="size-3.5" /> },
    { key: "top", label: "Top", icon: <TrendingUp className="size-3.5" /> },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <MessageCircle className="size-5 text-muted-foreground" />
            Discussion
            <span className="ml-0.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
              {totalComments}
            </span>
          </CardTitle>

          {/* Sort tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-0.5">
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortMode(opt.key)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  sortMode === opt.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Top-level composer */}
        <CommentComposer
          onSubmit={handleTopLevelComment}
          placeholder="What are your thoughts?"
        />

        <Separator />

        {/* Comment threads */}
        <div className="flex flex-col gap-5">
          {sortedComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              onVote={handleVote}
              onReply={handleReply}
              isTopLevel
            />
          ))}
        </div>

        {/* Load more */}
        {sortedComments.length >= 5 && (
          <Button variant="ghost" className="mx-auto gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Minus className="size-4" />
            View more comments
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
