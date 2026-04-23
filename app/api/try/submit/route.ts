import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB — matches /api/documents/upload

const tryParseRequestSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("upload"),
    email: z.email("Enter a valid email."),
    fileName: z.string().trim().min(1, "File name is required.").max(256),
    fileSize: z.number().int().positive().max(MAX_FILE_SIZE_BYTES, "File exceeds 100MB limit."),
    fileType: z.string().trim().max(128).optional(),
  }),
  z.object({
    kind: z.literal("share-sample"),
    email: z.email("Enter a valid email."),
    sampleId: z.string().trim().min(1).max(64),
  }),
]);

type TryParseInsert = {
  intent: "early-access";
  full_name: string;
  email: string;
  company: string;
  company_type: string;
  active_nc_jurisdictions: string[];
  primary_nc_jurisdiction: string | null;
  note: string | null;
  source_path: string;
  metadata: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = tryParseRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid submission." },
        { status: 400 },
      );
    }

    const input = parsed.data;

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Storage is not configured. Please try again shortly." },
        { status: 500 },
      );
    }

    const namePrefix = input.email.split("@")[0]?.replace(/[._-]/g, " ").trim() || "Visitor";

    const row: TryParseInsert =
      input.kind === "upload"
        ? {
            intent: "early-access",
            full_name: namePrefix,
            email: input.email.trim().toLowerCase(),
            company: "(submitted via /try)",
            company_type: "Unknown",
            active_nc_jurisdictions: [],
            primary_nc_jurisdiction: null,
            note: `Parse request: ${input.fileName} (${Math.round(input.fileSize / 1024)} KB)`,
            source_path: "/try",
            metadata: {
              source: "try-parse-request",
              fileName: input.fileName,
              fileSize: input.fileSize,
              fileType: input.fileType || "application/pdf",
              submittedAt: new Date().toISOString(),
            },
          }
        : {
            intent: "early-access",
            full_name: namePrefix,
            email: input.email.trim().toLowerCase(),
            company: "(shared via /try)",
            company_type: "Unknown",
            active_nc_jurisdictions: [],
            primary_nc_jurisdiction: null,
            note: `Sample list share: ${input.sampleId}`,
            source_path: "/try",
            metadata: {
              source: "try-sample-share",
              sampleId: input.sampleId,
              submittedAt: new Date().toISOString(),
            },
          };

    const client = supabase as unknown as {
      from(table: "marketing_leads"): {
        insert(values: TryParseInsert): {
          select(columns: "id"): {
            single(): Promise<{ data: { id: string } | null; error: { message: string } | null }>;
          };
        };
      };
    };

    const { data: inserted, error } = await client
      .from("marketing_leads")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error("[try/submit] insert error:", error);
      return NextResponse.json({ error: "Could not save your request." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, leadId: inserted?.id ?? null }, { status: 200 });
  } catch (error) {
    console.error("[try/submit] unexpected error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
