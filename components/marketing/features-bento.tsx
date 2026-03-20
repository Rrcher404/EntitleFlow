"use client"

import {
  MessageSquare,
  GitBranch,
  MapPin,
  Users,
  FileText,
} from "lucide-react"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"

export function FeaturesBento() {
  const features = [
    {
      name: "Comment Mapping & Tracking",
      description:
        "Automatically map and track all reviewer comments across permits and projects in one unified view.",
      icon: <MessageSquare className="h-6 w-6" />,
    },
    {
      name: "Permit Workflow Automation",
      description:
        "Streamline permit workflows with automated routing, status updates, and resubmittal tracking.",
      icon: <GitBranch className="h-6 w-6" />,
    },
    {
      name: "Jurisdiction-Specific Guides",
      description:
        "Access tailored guides and checklists for North Carolina jurisdictions to accelerate approvals.",
      icon: <MapPin className="h-6 w-6" />,
    },
    {
      name: "Real-Time Collaboration",
      description:
        "Keep your team aligned with live visibility into permit status, comments, and action items.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      name: "Document Management",
      description:
        "Centralize all permit documents, submittals, and correspondence in one searchable repository.",
      icon: <FileText className="h-6 w-6" />,
    },
  ]

  return (
    <section className="w-full py-12 lg:py-16">
      <div className="container-shell">
        <div className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Core capabilities built for NC permit teams.
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to transform permit workflows from chaos to clarity.
            </p>
          </div>

          <BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <BentoCard
                key={feature.name}
                name={feature.name}
                description={feature.description}
                icon={feature.icon}
                className="min-h-[200px]"
              />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  )
}
