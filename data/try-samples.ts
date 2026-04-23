export type TryCommentSeverity = "info" | "revision" | "blocker";

export type TryParsedComment = {
  id: string;
  comment: string;
  page: number;
  owner: string;
  discipline: string;
  severity: TryCommentSeverity;
};

export type TrySample = {
  id: string;
  label: string;
  jurisdiction: string;
  projectType: string;
  parseTimeSeconds: number;
  pageCount: number;
  comments: TryParsedComment[];
};

export const trySamples: TrySample[] = [
  {
    id: "sample-mixed-use",
    label: "Mixed-use infill — city review",
    jurisdiction: "Greensboro, NC · First review",
    projectType: "Four-story mixed-use",
    parseTimeSeconds: 97,
    pageCount: 14,
    comments: [
      {
        id: "s1-c1",
        comment:
          "Provide clear turning radii at the primary entrance to demonstrate AASHTO WB-50 compliance for delivery vehicles.",
        page: 3,
        owner: "Civil lead",
        discipline: "Traffic / access",
        severity: "revision",
      },
      {
        id: "s1-c2",
        comment:
          "Stormwater narrative references the 2019 UDO. Update to current UDO §8.2 and include revised peak flow calculations for the 10-year event.",
        page: 5,
        owner: "Civil lead",
        discipline: "Stormwater",
        severity: "blocker",
      },
      {
        id: "s1-c3",
        comment:
          "Building height plus parapet exceeds the 55 ft limit for this zoning overlay by 1'-4\". Confirm measurement datum or apply for variance.",
        page: 7,
        owner: "Project architect",
        discipline: "Zoning",
        severity: "blocker",
      },
      {
        id: "s1-c4",
        comment:
          "Fire apparatus access road shown at 18' clear width. NC Fire Code §503.2.1 requires minimum 20'. Revise or add hammerhead turnaround.",
        page: 9,
        owner: "Civil lead",
        discipline: "Fire safety",
        severity: "blocker",
      },
      {
        id: "s1-c5",
        comment:
          "Tree protection plan missing canopy survey for the three 24\"+ oaks flagged in the arborist report. Add to sheet L-1.02.",
        page: 11,
        owner: "Landscape architect",
        discipline: "Landscape",
        severity: "revision",
      },
      {
        id: "s1-c6",
        comment:
          "Please provide a narrative describing how loading zone conflicts with adjacent pedestrian way are mitigated during peak delivery windows.",
        page: 12,
        owner: "Project architect",
        discipline: "Zoning",
        severity: "info",
      },
      {
        id: "s1-c7",
        comment:
          "Accessible parking count (8) meets ADA minimum but van-accessible stall is not van-specific per ADA §502.2. Update striping and signage.",
        page: 4,
        owner: "Project architect",
        discipline: "Building code",
        severity: "revision",
      },
      {
        id: "s1-c8",
        comment:
          "Grading at northeast corner encroaches 2' into the riparian buffer. Revise or include a buffer impact justification per UDO §8.4.7.",
        page: 6,
        owner: "Civil lead",
        discipline: "Environmental",
        severity: "blocker",
      },
    ],
  },
  {
    id: "sample-adu-infill",
    label: "ADU addition — residential review",
    jurisdiction: "Raleigh, NC · Residential plans examiner",
    projectType: "Detached ADU on existing lot",
    parseTimeSeconds: 42,
    pageCount: 6,
    comments: [
      {
        id: "s2-c1",
        comment:
          "Setback from rear property line shown at 4'-6\". Residential code requires minimum 5' for detached ADU under this overlay. Adjust footprint.",
        page: 2,
        owner: "Project architect",
        discipline: "Zoning",
        severity: "blocker",
      },
      {
        id: "s2-c2",
        comment:
          "Energy compliance form (Res Check) missing from submittal package. Include with next resubmittal.",
        page: 4,
        owner: "Project architect",
        discipline: "Building code",
        severity: "revision",
      },
      {
        id: "s2-c3",
        comment:
          "Provide stair riser and tread dimensions for the mezzanine access. Current detail is incomplete per IRC R311.7.",
        page: 5,
        owner: "Project architect",
        discipline: "Building code",
        severity: "revision",
      },
      {
        id: "s2-c4",
        comment:
          "Foundation drainage not shown. Add perimeter drain detail for the crawlspace portion.",
        page: 3,
        owner: "Structural",
        discipline: "Building code",
        severity: "revision",
      },
      {
        id: "s2-c5",
        comment:
          "Impervious surface calculation not provided. Confirm the addition keeps the lot under the 40% impervious cap.",
        page: 2,
        owner: "Civil lead",
        discipline: "Stormwater",
        severity: "revision",
      },
    ],
  },
  {
    id: "sample-warehouse",
    label: "Light industrial warehouse — second review",
    jurisdiction: "Mecklenburg County, NC · Follow-up review",
    projectType: "22,000 sf distribution warehouse",
    parseTimeSeconds: 113,
    pageCount: 22,
    comments: [
      {
        id: "s3-c1",
        comment:
          "Previous comment on truck loading dock turning movements was not addressed. Provide a swept-path analysis for WB-67 at all three dock positions.",
        page: 4,
        owner: "Civil lead",
        discipline: "Traffic / access",
        severity: "blocker",
      },
      {
        id: "s3-c2",
        comment:
          "Fire riser room remains undersized per 2021 NC Fire Code. Increase to 8' x 10' minimum clear interior dimension.",
        page: 8,
        owner: "Project architect",
        discipline: "Fire safety",
        severity: "blocker",
      },
      {
        id: "s3-c3",
        comment:
          "Stormwater control measure (SCM) #2 draft now shows bioretention but sizing calculation still references the previous wet pond design. Update calc sheet.",
        page: 13,
        owner: "Civil lead",
        discipline: "Stormwater",
        severity: "blocker",
      },
      {
        id: "s3-c4",
        comment:
          "Exterior lighting photometric plan still exceeds 0.5 fc at the east property line. Adjust fixture selection or add shielding.",
        page: 17,
        owner: "Electrical",
        discipline: "Environmental",
        severity: "revision",
      },
      {
        id: "s3-c5",
        comment:
          "Accessible route from public way to main entrance not continuously shown. Add plan callouts for the full accessible path.",
        page: 6,
        owner: "Project architect",
        discipline: "Building code",
        severity: "revision",
      },
      {
        id: "s3-c6",
        comment:
          "Landscape buffer along south property line short by 6 required canopy trees. Revise planting schedule.",
        page: 19,
        owner: "Landscape architect",
        discipline: "Landscape",
        severity: "revision",
      },
      {
        id: "s3-c7",
        comment:
          "Confirm grease interceptor is not required given there is no food service tenant. Add narrative to cover sheet.",
        page: 11,
        owner: "Project architect",
        discipline: "General",
        severity: "info",
      },
      {
        id: "s3-c8",
        comment:
          "Sprinkler calculations reference NFPA 13R for storage occupancy. Confirm intended use classification and update to NFPA 13 if needed.",
        page: 10,
        owner: "Project architect",
        discipline: "Fire safety",
        severity: "blocker",
      },
      {
        id: "s3-c9",
        comment:
          "Signage plan missing monument sign elevation. Include details matching UDO §11.7 size and illumination limits.",
        page: 21,
        owner: "Project architect",
        discipline: "Zoning",
        severity: "info",
      },
    ],
  },
];

export const severityLabel: Record<TryCommentSeverity, string> = {
  blocker: "Blocker",
  revision: "Needs revision",
  info: "For info",
};

export const severityStyles: Record<TryCommentSeverity, { chip: string; dot: string }> = {
  blocker: {
    chip: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  revision: {
    chip: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  info: {
    chip: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
};
