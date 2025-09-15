'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { strings } from '@/shared/language/en'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export default function Home() {
  const [file, setFile] = React.useState<File | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [taskOpen, setTaskOpen] = React.useState(false)
  // Placeholder for extracted results (to be filled after API integration)
  const [extracted, setExtracted] = React.useState<Record<string, string> | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) {
      toast.warning(strings.upload.missingFile)
      return
    }
    try {
      setSubmitting(true)
      toast.info(strings.upload.uploading)
      // TODO: Wire upload & extraction
      // After implementing: setExtracted({ field: 'value', ... })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen w-full flex items-start justify-center p-6">
      <div className="w-full max-w-3xl space-y-4">
        {/* Header with a button to show/hide the Task panel */}
        <div className="w-full flex items-center justify-end">
          <Button variant="outline" onClick={() => setTaskOpen((o) => !o)}>
            {taskOpen ? strings.taskPanel.close : strings.taskPanel.open}
          </Button>
        </div>

        {/* Main content stays focused on Upload */}
        <Card>
          <CardHeader>
            <CardTitle>{strings.upload.heading}</CardTitle>
            <CardDescription>{strings.upload.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="file">{strings.upload.fileLabel}</Label>
                <Input
                  id="file"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-sm text-muted-foreground">{strings.upload.fileHelp}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={submitting}>
                  {strings.upload.submit}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Placeholder container for extracted results */}
        <Card>
          <CardHeader>
            <CardTitle>{strings.results.heading}</CardTitle>
            <CardDescription>{strings.results.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {extracted ? (
              <div className="grid gap-3">
                {Object.entries(extracted).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 items-center gap-3">
                    <div className="text-sm text-muted-foreground col-span-1 break-words">
                      {key}
                    </div>
                    <div className="col-span-2">
                      <Input defaultValue={value} aria-label={`${key} value`} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button variant="default">Save changes</Button>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                TODO: Implement extraction and visualisation
                <br />
                <br />
                {strings.results.empty}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task description in a side sheet */}
        <Sheet open={taskOpen} onOpenChange={setTaskOpen}>
          <SheetContent side="right" className="w-[560px] max-w-[90vw]">
            <SheetHeader>
              <SheetTitle>{strings.task.heading}</SheetTitle>
            </SheetHeader>
            {/* The Sheet itself now handles scrolling; keep content container simple */}
            <div className="mt-4 prose max-w-none dark:prose-invert text-sm">
              <pre className="whitespace-pre-wrap font-sans">{strings.task.descriptionMd}</pre>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </main>
  )
}
