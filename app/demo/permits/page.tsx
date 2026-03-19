'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, MapPin, Calendar } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  initials: string;
  role: string;
  timestamp: string;
  text: string;
}

interface Permit {
  id: string;
  type: string;
  project: string;
  jurisdiction: string;
  submittedDate: string;
  status: 'Under Review' | 'Approved' | 'Resubmittal Required' | 'Pending';
  reviewer: string;
  comments: Comment[];
}

const mockPermits: Permit[] = [
  {
    id: 'PRM-2024-0891',
    type: 'Site Plan Review',
    project: 'Brightwater Mixed-Use',
    jurisdiction: 'Greensboro',
    submittedDate: '2024-03-10',
    status: 'Under Review',
    reviewer: 'David Park',
    comments: [
      {
        id: 'c1',
        author: 'David Park',
        initials: 'DP',
        role: 'Senior Planner',
        timestamp: '2 hours ago',
        text: 'Please clarify the stormwater management plan in section 4.2. We need additional details on the detention basin sizing calculations.',
      },
      {
        id: 'c2',
        author: 'Lisa Thompson',
        initials: 'LT',
        role: 'Drainage Engineer',
        timestamp: '1 hour ago',
        text: 'Agree with David. Also, the grading plan shows a 1.5% slope near the north perimeter—verify this meets our minimum standards.',
      },
    ],
  },
  {
    id: 'PRM-2024-0887',
    type: 'Building Permit',
    project: 'Downtown Lofts Renovation',
    jurisdiction: 'Durham',
    submittedDate: '2024-03-08',
    status: 'Resubmittal Required',
    reviewer: 'Michael Chen',
    comments: [
      {
        id: 'c3',
        author: 'Michael Chen',
        initials: 'MC',
        role: 'Building Official',
        timestamp: '3 days ago',
        text: 'Resubmittal required. Fire-rated wall assembly details in Appendix B do not meet IBC 706 requirements. Please reference approved assemblies.',
      },
      {
        id: 'c4',
        author: 'Patricia Garcia',
        initials: 'PG',
        role: 'Fire Safety Inspector',
        timestamp: '2 days ago',
        text: 'Additionally, egress calculations need review. With the proposed unit count, verify sufficient stairwell width per IBC Table 1005.2.2.',
      },
      {
        id: 'c5',
        author: 'Michael Chen',
        initials: 'MC',
        role: 'Building Official',
        timestamp: '1 day ago',
        text: 'Resubmit with corrected details and we can move forward. Target review window is 5 business days after receipt.',
      },
    ],
  },
  {
    id: 'PRM-2024-0879',
    type: 'Zoning Variance',
    project: 'Elm Street Townhomes',
    jurisdiction: 'Greensboro',
    submittedDate: '2024-03-01',
    status: 'Approved',
    reviewer: 'Rebecca Wilson',
    comments: [
      {
        id: 'c6',
        author: 'Rebecca Wilson',
        initials: 'RW',
        role: 'Zoning Administrator',
        timestamp: '5 days ago',
        text: 'Variance approved. Setback reduction from 25ft to 20ft granted based on lot configuration constraints. Condition: landscaping buffer as specified in plan set.',
      },
    ],
  },
  {
    id: 'PRM-2024-0872',
    type: 'Stormwater Review',
    project: 'Oak Hills Subdivision Ph. 3',
    jurisdiction: 'Raleigh',
    submittedDate: '2024-02-28',
    status: 'Approved',
    reviewer: 'James Morrison',
    comments: [
      {
        id: 'c7',
        author: 'James Morrison',
        initials: 'JM',
        role: 'Stormwater Manager',
        timestamp: '1 week ago',
        text: 'Stormwater plan approved. Bioretention areas and underground detention meet post-construction standards. Final inspection required before certificate of occupancy.',
      },
    ],
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Under Review': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'Resubmittal Required': 'bg-red-100 text-red-800',
    'Pending': 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getAvatarColor = (initials: string) => {
  const colors: Record<string, string> = {
    'DP': 'bg-emerald-100 text-emerald-700',
    'LT': 'bg-sky-100 text-sky-700',
    'MC': 'bg-violet-100 text-violet-700',
    'PG': 'bg-rose-100 text-rose-700',
    'RW': 'bg-amber-100 text-amber-700',
    'JM': 'bg-cyan-100 text-cyan-700',
  };
  return colors[initials] || 'bg-gray-100 text-gray-700';
};

export default function PermitsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-display font-semibold text-foreground">
          Permits & Reviews
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track permit applications and reviewer feedback
        </p>
      </div>

      <div className="space-y-4">
        {mockPermits.map((permit) => (
          <Card key={permit.id} className="border-border overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {permit.id}
                    </h3>
                    <Badge className={getStatusColor(permit.status)}>
                      {permit.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    {permit.type}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{permit.project}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{permit.jurisdiction}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Submitted {permit.submittedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            {permit.comments.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <MessageCircle className="w-3 h-3" />
                    <span>{permit.comments.length} Comments</span>
                  </div>
                  <div className="space-y-3">
                    {permit.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-secondary/50 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getAvatarColor(comment.initials)}`}
                          >
                            {comment.initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {comment.author}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {comment.role} • {comment.timestamp}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-foreground ml-11">
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
