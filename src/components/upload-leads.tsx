"use client"

import * as React from "react"
import { UploadCloud, FileSpreadsheet, CheckCircle2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UploadLeadsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadLeadsDialog({ open, onOpenChange }: UploadLeadsDialogProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadSuccess, setUploadSuccess] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.name.endsWith('.csv') || file.type === "text/csv") {
        setSelectedFile(file)
        setUploadSuccess(false)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setUploadSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    // Simulate upload / server action
    setTimeout(() => {
      setIsUploading(false)
      setUploadSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSelectedFile(null)
        setUploadSuccess(false)
      }, 1200)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import Sourced Leads
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file containing your lead list to sync with Supabase and initiate Manyreach sequences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? "border-primary bg-primary/5 scale-[0.99]"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/40"
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-3 shadow-inner">
              <UploadCloud className="h-7 w-7 text-primary" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground flex items-center justify-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready to sync
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">
                  Drag & drop your CSV here, or{" "}
                  <span className="text-primary font-semibold hover:underline">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports .CSV with Company, Contact, Email & Phone columns
                </p>
              </>
            )}
          </div>

          {uploadSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-3 text-sm text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Leads successfully imported and synced to pipeline!</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || uploadSuccess}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Done
                </>
              ) : (
                "Upload & Sync"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
