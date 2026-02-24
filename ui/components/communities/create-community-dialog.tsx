"use client"

import { useState, useRef } from "react"
import { Plus, Users, Trophy, FileText, ChevronRight, ChevronLeft, Loader2, CheckCircle2, Sparkles, Paintbrush, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const SPORT_OPTIONS = [
  { value: "Football", icon: "\u26BD" },
  { value: "Basketball", icon: "\uD83C\uDFC0" },
  { value: "Tennis", icon: "\uD83C\uDFBE" },
  { value: "Motorsport", icon: "\uD83C\uDFCE\uFE0F" },
  { value: "MMA", icon: "\uD83E\u94CA" },
  { value: "Cricket", icon: "\uD83C\uDFCF" },
  { value: "Golf", icon: "\u26F3" },
  { value: "Cycling", icon: "\uD83D\uDEB4" },
  { value: "Baseball", icon: "\u26BE" },
  { value: "Hockey", icon: "\uD83C\uDFD2" },
]

const BANNER_COLORS = [
  { value: "#3D195B", label: "Purple" },
  { value: "#1D428A", label: "Navy" },
  { value: "#E10600", label: "Red" },
  { value: "#00703C", label: "Green" },
  { value: "#EE8707", label: "Orange" },
  { value: "#D20A0A", label: "Crimson" },
  { value: "#0D1541", label: "Dark Blue" },
  { value: "#024494", label: "Blue" },
  { value: "#1A5276", label: "Teal" },
  { value: "#006847", label: "Forest" },
  { value: "#FFD700", label: "Gold" },
  { value: "#FF6B35", label: "Primary" },
]

type Step = "details" | "branding" | "review"

interface FormData {
  name: string
  sport: string
  description: string
  bannerColor: string
  avatarPreview: string | null
}

interface FormErrors {
  name?: string
  sport?: string
  description?: string
  bannerColor?: string
}

export function CreateCommunityDialog() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("details")
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormData>({
    name: "",
    sport: "",
    description: "",
    bannerColor: "#FF6B35",
    avatarPreview: null,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  function resetForm() {
    setForm({ name: "", sport: "", description: "", bannerColor: "#FF6B35", avatarPreview: null })
    setErrors({})
    setStep("details")
    setSubmitting(false)
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm()
    setOpen(next)
  }

  function validateDetails(): boolean {
    const newErrors: FormErrors = {}
    if (!form.name.trim()) newErrors.name = "Community name is required"
    else if (form.name.trim().length < 3) newErrors.name = "Name must be at least 3 characters"
    else if (form.name.trim().length > 40) newErrors.name = "Name must be under 40 characters"
    if (!form.sport) newErrors.sport = "Select a sport focus"
    if (!form.description.trim()) newErrors.description = "Add a short description"
    else if (form.description.trim().length < 10) newErrors.description = "Description must be at least 10 characters"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (step === "details" && validateDetails()) setStep("branding")
    else if (step === "branding") setStep("review")
  }

  function handleBack() {
    if (step === "branding") setStep("details")
    else if (step === "review") setStep("branding")
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((f) => ({ ...f, avatarPreview: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1800))
    setSubmitting(false)
    setOpen(false)
    toast.success("Community created!", {
      description: `${form.name} is now live. Start adding prediction markets.`,
    })
    resetForm()
  }

  const nameCharCount = form.name.trim().length
  const descCharCount = form.description.trim().length
  const stepIndex = step === "details" ? 0 : step === "branding" ? 1 : 2

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-primary hover:bg-primary-dark text-primary-foreground gap-2 shadow-sm"
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">Create Community</span>
        <span className="sm:hidden">Create</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
          {/* Progress indicator */}
          <div className="flex items-center gap-0 px-6 pt-6 pb-2">
            <StepDot active={stepIndex === 0} done={stepIndex > 0} label="Details" index={1} />
            <div className={cn("h-px flex-1 mx-2 transition-colors", stepIndex > 0 ? "bg-primary" : "bg-border")} />
            <StepDot active={stepIndex === 1} done={stepIndex > 1} label="Branding" index={2} />
            <div className={cn("h-px flex-1 mx-2 transition-colors", stepIndex > 1 ? "bg-primary" : "bg-border")} />
            <StepDot active={stepIndex === 2} done={false} label="Review" index={3} />
          </div>

          {/* Step 1: Details */}
          {step === "details" && (
            <div className="px-6 pt-4 pb-6">
              <DialogHeader className="mb-5">
                <DialogTitle className="text-lg font-semibold text-foreground">Create a Community</DialogTitle>
                <DialogDescription>
                  Set up a prediction room for your sport. You can add markets after.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-5">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="community-name" className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-muted-foreground" />
                      Community Name
                    </Label>
                    <span className={cn("text-xs tabular-nums", nameCharCount > 40 ? "text-destructive" : "text-muted-foreground")}>
                      {nameCharCount}/40
                    </span>
                  </div>
                  <Input
                    id="community-name"
                    placeholder="e.g. Premier League Predictors"
                    value={form.name}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, name: e.target.value }))
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
                    }}
                    className={cn(errors.name && "border-destructive focus-visible:ring-destructive/20")}
                    maxLength={50}
                    autoFocus
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                {/* Sport */}
                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-1.5">
                    <Trophy className="size-3.5 text-muted-foreground" />
                    Sport Focus
                  </Label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {SPORT_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, sport: s.value }))
                          if (errors.sport) setErrors((prev) => ({ ...prev, sport: undefined }))
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs font-medium transition-all",
                          form.sport === s.value
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                            : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/50"
                        )}
                      >
                        <span className="text-base leading-none">{s.icon}</span>
                        <span className="truncate w-full text-center text-[10px] leading-tight">{s.value}</span>
                      </button>
                    ))}
                  </div>
                  {errors.sport && <p className="text-xs text-destructive">{errors.sport}</p>}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="community-desc" className="flex items-center gap-1.5">
                      <FileText className="size-3.5 text-muted-foreground" />
                      Description
                    </Label>
                    <span className={cn("text-xs tabular-nums", descCharCount > 160 ? "text-destructive" : "text-muted-foreground")}>
                      {descCharCount}/160
                    </span>
                  </div>
                  <Textarea
                    id="community-desc"
                    placeholder="What kind of predictions will your community focus on?"
                    value={form.description}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, description: e.target.value }))
                      if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }))
                    }}
                    className={cn(
                      "min-h-20 resize-none text-sm",
                      errors.description && "border-destructive focus-visible:ring-destructive/20"
                    )}
                    maxLength={200}
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleNext} className="bg-primary hover:bg-primary-dark text-primary-foreground gap-1.5">
                  Continue
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {step === "branding" && (
            <div className="px-6 pt-4 pb-6">
              <DialogHeader className="mb-5">
                <DialogTitle className="text-lg font-semibold text-foreground">Customize Appearance</DialogTitle>
                <DialogDescription>
                  Choose a banner color and optional avatar image for your community.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-6">
                {/* Live preview */}
                <div className="rounded-xl border overflow-hidden">
                  <div
                    className="h-16 w-full relative"
                    style={{ backgroundColor: form.bannerColor }}
                  >
                    <div className="absolute inset-0 opacity-15" style={{
                      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
                    }} />
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent" />
                  </div>
                  <div className="px-4 pb-3 -mt-5 relative z-10">
                    <div className="flex items-end gap-3">
                      <Avatar className="size-12 ring-2 ring-card rounded-xl shadow">
                        {form.avatarPreview ? (
                          <AvatarImage src={form.avatarPreview} className="rounded-xl object-cover" />
                        ) : null}
                        <AvatarFallback
                          className="rounded-xl text-sm font-bold text-white"
                          style={{ backgroundColor: form.bannerColor }}
                        >
                          {form.name.trim().charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 pb-0.5">
                        <p className="text-sm font-semibold text-foreground truncate">{form.name.trim() || "Community Name"}</p>
                        {form.sport && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-[16px] font-medium text-muted-foreground mt-0.5">
                            {form.sport}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner color */}
                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-1.5">
                    <Paintbrush className="size-3.5 text-muted-foreground" />
                    Banner Color
                  </Label>
                  <div className="grid grid-cols-6 gap-2">
                    {BANNER_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, bannerColor: c.value }))}
                        className={cn(
                          "relative size-10 rounded-lg transition-all",
                          form.bannerColor === c.value
                            ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                            : "hover:scale-105"
                        )}
                        style={{ backgroundColor: c.value }}
                        aria-label={c.label}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Avatar upload */}
                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-1.5">
                    <ImagePlus className="size-3.5 text-muted-foreground" />
                    Community Avatar
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <Avatar className="size-14 rounded-xl border-2 border-dashed border-border">
                      {form.avatarPreview ? (
                        <AvatarImage src={form.avatarPreview} className="rounded-xl object-cover" />
                      ) : null}
                      <AvatarFallback
                        className="rounded-xl text-lg font-bold text-white"
                        style={{ backgroundColor: form.bannerColor }}
                      >
                        {form.name.trim().charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-1.5 text-xs"
                      >
                        <ImagePlus className="size-3.5" />
                        {form.avatarPreview ? "Change Image" : "Upload Image"}
                      </Button>
                      {form.avatarPreview && (
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, avatarPreview: null }))}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors text-left"
                        >
                          Remove image
                        </button>
                      )}
                      <p className="text-[10px] text-muted-foreground">JPG, PNG. Max 2MB.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1 text-muted-foreground">
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
                <Button onClick={handleNext} className="bg-primary hover:bg-primary-dark text-primary-foreground gap-1.5">
                  Continue
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === "review" && (
            <div className="px-6 pt-4 pb-6">
              <DialogHeader className="mb-5">
                <DialogTitle className="text-lg font-semibold text-foreground">Review & Create</DialogTitle>
                <DialogDescription>
                  Confirm your community details before going live.
                </DialogDescription>
              </DialogHeader>

              {/* Full preview card */}
              <div className="rounded-xl border overflow-hidden bg-muted/30">
                <div
                  className="h-20 w-full relative"
                  style={{ backgroundColor: form.bannerColor }}
                >
                  <div className="absolute inset-0 opacity-15" style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
                  }} />
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-muted/30 to-transparent" />
                </div>
                <div className="px-4 pb-4 -mt-6 relative z-10">
                  <Avatar className="size-14 ring-3 ring-card rounded-xl shadow-md mb-3">
                    {form.avatarPreview ? (
                      <AvatarImage src={form.avatarPreview} className="rounded-xl object-cover" />
                    ) : null}
                    <AvatarFallback
                      className="rounded-xl text-lg font-bold text-white"
                      style={{ backgroundColor: form.bannerColor }}
                    >
                      {form.name.trim().charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-foreground text-sm">{form.name.trim()}</h3>
                  <Badge variant="secondary" className="mt-1 text-[10px] py-0 px-1.5 gap-1 bg-muted text-muted-foreground border-0">
                    {SPORT_OPTIONS.find((s) => s.value === form.sport)?.icon}{" "}
                    {form.sport}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {form.description.trim()}
                  </p>
                </div>
              </div>

              {/* Info callout */}
              <div className="flex items-start gap-2.5 rounded-lg bg-primary/8 border border-primary/15 p-3 mt-4">
                <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You will be the community creator and can add prediction markets, manage members, and configure settings after creation.
                </p>
              </div>

              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="gap-1 text-muted-foreground"
                  disabled={submitting}
                >
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground gap-2 min-w-[140px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Create Community
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function StepDot({ active, done, label, index }: { active: boolean; done: boolean; label: string; index: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center justify-center size-6 rounded-full text-xs font-semibold transition-all",
          active
            ? "bg-primary text-primary-foreground"
            : done
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
        )}
      >
        {done ? <CheckCircle2 className="size-3.5" /> : index}
      </div>
      <span className={cn("text-xs font-medium hidden sm:inline", active || done ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  )
}
