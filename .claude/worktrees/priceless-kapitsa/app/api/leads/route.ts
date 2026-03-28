import { NextResponse } from "next/server";

import { marketingLeadSchema } from "@/lib/leads/schema";
import { createMarketingLead } from "@/lib/leads/service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = marketingLeadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "The submission is invalid.",
        },
        { status: 400 },
      );
    }

    const result = await createMarketingLead(parsed.data);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected lead submission error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
