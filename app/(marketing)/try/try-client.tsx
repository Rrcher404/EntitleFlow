"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileUp,
  Loader2,
  Mail,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  severityLabel,
  severityStyles,
  type TrySample,
} from "@/data/try-samples";

type UploadStatus =
  | { state: "idle" }
  | { state: "selecting" }
  | { state: "submitting" }
  | { state: "success"; email: string }
  | { state: "error"; message: string };

const MAX_BYTES = 100 * 1024 * 1024;

export function TryPageClient({ samples }: { samples: TrySample[] }) {
  const [activeSampleId, setActiveSampleId] = useState<string>(samples[0]?.id ?? "");
  const activeSample = useMemo(
    () => samples.find((s) => s.id === activeSampleId) ?? samples[0],
    [samples, activeSampleId],
  );

  return (
    <div className="bg-background">
      <TryHero />
      <div className="container-shell grid gap-8 pb-10 lg:grid-cols-[0.9fr_1.1fr]">
        <UploadCard />
        <SampleViewer
          samples={samples}
          activeSample={activeSample}
          onSelect={setActiveSampleId}
        />
      </div>
      {activeSample ? <ShareCard sample={activeSample} /> : null}
      <WalkthroughCta />
    </div>
  );
}

function TryHero() {
  return (
    <section className="pt-12 pb-10 sm:pt-16 sm:pb-12">
      <div className="container-shell max-w-3xl text-center">
        <Badge
          className="eyebrow-pill mb-4 px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
          variant="outline"
        >
          Try it with your PDF
        </Badge>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          See a reviewer redline PDF become a structured comment list.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          Browse a live sample on the right to see what your team gets back. Or drop your own
          PDF and the founder will follow up to run it through EntitleFlow for you.
        </p>
      </div>
    </section>
  );
}

function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<UploadStatus>({ state: "idle" });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((candidate: File): string | null => {
    const isPdf =
      candidate.type === "application/pdf" ||
      candidate.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return "Please drop a PDF. Other formats are not supported yet.";
    if (candidate.size > MAX_BYTES) return "File exceeds the 100MB limit.";
    if (candidate.size === 0) return "That file looks empty. Try again with the full PDF.";
    return null;
  }, []);

  const handleFileSelect = useCallback(
    (candidate: File) => {
      const err = validateFile(candidate);
      if (err) {
        setStatus({ state: "error", message: err });
        setFile(null);
        return;
      }
      setStatus({ state: "selecting" });
      setFile(candidate);
    },
    [validateFile],
  );

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    if (picked) handleFileSelect(picked);
  };

  const handleClear = () => {
    setFile(null);
    setStatus({ state: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setStatus({ state: "error", message: "Pick a reviewer PDF first." });
      return;
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus({ state: "error", message: "Enter a valid email." });
      return;
    }

    setStatus({ state: "submitting" });
    try {
      const response = await fetch("/api/try/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "upload",
          email,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || "application/pdf",
        }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus({
          state: "error",
          message: body.error || "Could not save your request. Please try again.",
        });
        return;
      }
      setStatus({ state: "success", email });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Unexpected error.",
      });
    }
  };

  const isSubmitting = status.state === "submitting";

  if (status.state === "success") {
    return (
      <Card className="h-fit">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold text-foreground">
                Got it
              </div>
              <p className="text-sm text-muted-foreground">Founder follow-up within one business day.</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Jene will reach out to <strong>{status.email}</strong> to pick up your PDF and send
            the structured comment list back. In the meantime, browse the live sample on the
            right.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleClear} variant="outline" size="sm">
              Submit another PDF
            </Button>
            <Button asChild size="sm">
              <Link href="/walkthrough">Book a 15-min walkthrough</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-1">
          <div className="font-display text-xl font-semibold text-foreground">
            Want to try this on your own PDF?
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Drop it here and leave your email. The founder will follow up to pull it through
            EntitleFlow and send the structured list back.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label
            htmlFor="try-file"
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={cn(
              "flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card px-4 py-6 text-center transition-colors hover:border-primary/60 hover:bg-accent/30",
              dragActive && "border-primary bg-accent/50",
              file && "border-primary/70 bg-accent/40",
            )}
          >
            {file ? (
              <FileSelectedPreview file={file} onClear={handleClear} />
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileUp className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium text-foreground">
                  Drop your PDF here or click to select
                </div>
                <div className="text-xs text-muted-foreground">
                  Reviewer redlines, resubmittal comments, plan-review letters
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              id="try-file"
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={handleInputChange}
            />
          </label>

          <div className="space-y-2">
            <Label htmlFor="try-email">Your email</Label>
            <Input
              id="try-email"
              type="email"
              placeholder="you@firm.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              We use this to follow up with your parsed list. No list-selling, ever.
            </p>
          </div>

          {status.state === "error" ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{status.message}</span>
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending your request...
              </>
            ) : (
              <>
                Send me a follow-up
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function FileSelectedPreview({ file, onClear }: { file: File; onClear: () => void }) {
  const sizeLabel = file.size > 1024 * 1024
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(file.size / 1024)} KB`;

  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <FileUp className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate text-sm font-medium text-foreground">{file.name}</div>
        <div className="text-xs text-muted-foreground">{sizeLabel} · Ready to submit</div>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClear();
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Remove file"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function SampleViewer({
  samples,
  activeSample,
  onSelect,
}: {
  samples: TrySample[];
  activeSample: TrySample | undefined;
  onSelect: (id: string) => void;
}) {
  if (!activeSample) return null;

  return (
    <Card className="h-fit">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success" className="gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live sample parse
            </Badge>
            <span className="text-xs text-muted-foreground">
              Parsed in {activeSample.parseTimeSeconds}s · {activeSample.pageCount} pages ·{" "}
              {activeSample.comments.length} comments
            </span>
          </div>
          <div className="font-display text-xl font-semibold text-foreground">
            {activeSample.projectType}
          </div>
          <p className="text-sm text-muted-foreground">{activeSample.jurisdiction}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {samples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelect(sample.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                sample.id === activeSample.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {sample.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {activeSample.comments.map((comment) => {
            const style = severityStyles[comment.severity];
            return (
              <div
                key={comment.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      style.chip,
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                    {severityLabel[comment.severity]}
                  </span>
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Page {comment.page}
                  </span>
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {comment.discipline}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground">{comment.comment}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Suggested owner:</span>
                  <span>{comment.owner}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ShareCard({ sample }: { sample: TrySample }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "submitting" }
    | { status: "success"; email: string }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setState({ status: "error", message: "Enter a valid email." });
      return;
    }

    setState({ status: "submitting" });
    try {
      const response = await fetch("/api/try/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "share-sample", email, sampleId: sample.id }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setState({
          status: "error",
          message: body.error || "Could not send. Please try again.",
        });
        return;
      }
      setState({ status: "success", email });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Unexpected error.",
      });
    }
  };

  return (
    <section className="py-8">
      <div className="container-shell max-w-3xl">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="grid gap-5 p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 opacity-80" />
                <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                  Share this list
                </span>
              </div>
              <div className="font-display text-xl font-semibold">
                Want this sample list by email?
              </div>
              <p className="text-sm leading-6 text-primary-foreground/80">
                Leave your email — Jene will follow up with a shareable copy of this{" "}
                {sample.comments.length}-comment sample.
              </p>
            </div>
            {state.status === "success" ? (
              <div className="flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-4 py-3 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Thanks — Jene will follow up to <strong>{state.email}</strong>.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  placeholder="you@firm.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-w-[220px] border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60"
                  required
                />
                <Button
                  type="submit"
                  disabled={state.status === "submitting"}
                  variant="secondary"
                  className="bg-white text-foreground hover:bg-white/90"
                >
                  {state.status === "submitting" ? "Sending..." : "Send me a copy"}
                </Button>
              </form>
            )}
            {state.status === "error" ? (
              <p className="md:col-span-2 text-sm text-red-100">{state.message}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function WalkthroughCta() {
  return (
    <section className="pb-20 pt-6">
      <div className="container-shell max-w-3xl text-center">
        <p className="text-sm text-muted-foreground">
          Ready to see the full workflow, not just the parse?
        </p>
        <Button asChild size="lg" className="mt-3">
          <Link href="/walkthrough">
            Book a 15-minute walkthrough
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
