import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { MarketingLeadSchema } from "@/lib/leads/schema";

type CreateLeadResult = {
  ok: true;
  leadId: string;
  nextStep: "book-walkthrough" | "await-follow-up";
};

type MarketingLeadInsert = {
  intent: "walkthrough" | "early-access";
  full_name: string;
  email: string;
  company: string;
  company_type: string;
  source_path: string;
  active_nc_jurisdictions: string[];
  primary_nc_jurisdiction?: string | null;
  annual_project_volume?: string | null;
  biggest_workflow_issue?: string | null;
  issue_category?: string | null;
  note?: string | null;
  metadata: Record<string, unknown>;
};

type LeadInsertClient = {
  from(table: "marketing_leads"): {
    insert(values: MarketingLeadInsert): {
      select(columns: "id"): {
        single(): Promise<{
          data: { id: string } | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

export async function createMarketingLead(payload: MarketingLeadSchema): Promise<CreateLeadResult> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const baseRow = {
    intent: payload.intent,
    full_name: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    company: payload.company.trim(),
    company_type: payload.companyType.trim(),
    source_path: payload.sourcePath,
  };

  const row: MarketingLeadInsert =
    payload.intent === "walkthrough"
      ? {
          ...baseRow,
          active_nc_jurisdictions: splitJurisdictions(payload.activeNcJurisdictions),
          primary_nc_jurisdiction: null,
          annual_project_volume: payload.annualProjectVolume.trim(),
          biggest_workflow_issue: payload.biggestWorkflowIssue.trim(),
          issue_category: payload.issueCategory,
          note: null,
          metadata: {
            rawJurisdictionText: payload.activeNcJurisdictions,
          },
        }
      : {
          ...baseRow,
          active_nc_jurisdictions: [],
          annual_project_volume: null,
          biggest_workflow_issue: null,
          issue_category: null,
          primary_nc_jurisdiction: payload.primaryNcJurisdiction.trim(),
          note: payload.note?.trim() || null,
          metadata: {},
        };

  const leadClient = supabase as unknown as LeadInsertClient;
  const { data, error } = await leadClient.from("marketing_leads").insert(row).select("id").single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.id) {
    throw new Error("Lead storage did not return an id.");
  }

  return {
    ok: true,
    leadId: data.id,
    nextStep: payload.intent === "walkthrough" ? "book-walkthrough" : "await-follow-up",
  };
}

function splitJurisdictions(value: string) {
  return value
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}
