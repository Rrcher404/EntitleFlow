import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function DisclaimerBlock() {
  return (
    <Card className="border-amber-200 bg-amber-50 shadow-none">
      <CardContent className="flex gap-4 p-5">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
        <div className="space-y-2">
          <div className="text-sm font-semibold text-amber-900">Informational workflow guidance only</div>
          <p className="text-sm leading-6 text-amber-900/85">
            EntitleFlow organizes workflow intelligence and research notes. It does not replace official jurisdiction guidance, legal advice, zoning determinations, or permit review.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
