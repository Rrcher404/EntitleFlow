'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, MapPin, Calendar, CheckCircle2, Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface Comment {
  id: string;
  author: string;
  initials: string;
  role: string;
  timestamp: string;
  text: string;
  resolved?: boolean;
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

const mockPermitsData: Permit[] = [
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
        resolved: false,
      },
      {
        id: 'c2',
        author: 'Lisa Thompson',
        initials: 'LT',
        role: 'Drainage Engineer',
        timestamp: '1 hour ago',
        text: 'Agree with David. Also, the grading plan shows a 1.5% slope near the north perimeter—verify this meets our minimum standards.',
        resolved: false,
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
        resolved: false,
      },
      {
        id: 'c4',
        author: 'Patricia Garcia',
        initials: 'PG',
        role: 'Fire Safety Inspector',
        timestamp: '2 days ago',
        text: 'Additionally, egress calculations need review. With the proposed unit count, verify sufficient stairwell width per IBC Table 1005.2.2.',
        resolved: false,
      },
      {
        id: 'c5',
        author: 'Michael Chen',
        initials: 'MC',
        role: 'Building Official',
        timestamp: '1 day ago',
        text: 'Resubmit with corrected details and we can move forward. Target review window is 5 business days after receipt.',
        resolved: false,
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
        resolved: true,
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
        resolved: true,
      },
    ],
  },
  {
    id: 'PRM-2024-0893',
    type: 'Demolition Permit',
    project: 'Parkside Senior Living',
    jurisdiction: 'Cary',
    submittedDate: '2024-03-12',
    status: 'Under Review',
    reviewer: 'Angela Price',
    comments: [
      {
        id: 'c8',
        author: 'Angela Price',
        initials: 'AP',
        role: 'Demolition Inspector',
        timestamp: '4 hours ago',
        text: 'Need asbestos survey report before permit approval. Please provide NESHAP documentation.',
        resolved: false,
      },
    ],
  },
  {
    id: 'PRM-2024-0895',
    type: 'Special Use Permit',
    project: 'Riverfront Shopping Center',
    jurisdiction: 'Chapel Hill',
    submittedDate: '2024-03-14',
    status: 'Pending',
    reviewer: 'Thomas Wright',
    comments: [
      {
        id: 'c9',
        author: 'System',
        initials: 'SY',
        role: 'Admin',
        timestamp: '2 days ago',
        text: 'Application received. Scheduled for review committee meeting on March 25.',
        resolved: false,
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
    'AP': 'bg-indigo-100 text-indigo-700',
    'TW': 'bg-pink-100 text-pink-700',
    'SY': 'bg-gray-100 text-gray-700',
  };
  return colors[initials] || 'bg-gray-100 text-gray-700';
};

export default function PermitsPage() {
  const [permits, setPermits] = useState<Permit[]>(mockPermitsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const allStatuses = Array.from(new Set(permits.map((p) => p.status)));

  const filteredPermits = useMemo(() => {
    let result = permits.filter((p) => {
      const matchesSearch =
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.project.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusTab ? p.status === statusTab : true;

      return matchesSearch && matchesStatus;
    });

    return result;
  }, [permits, searchQuery, statusTab]);

  const handleReply = (permitId: string, commentId: string) => {
    if (!replyText.trim()) return;

    setPermits(
      permits.map((permit) => {
        if (permit.id === permitId) {
          return {
            ...permit,
            comments: [
              ...permit.comments,
              {
                id: `c${Math.random()}`,
                author: 'You (Demo User)',
                initials: 'YD',
                role: 'Applicant',
                timestamp: 'just now',
                text: replyText,
                resolved: false,
              },
            ],
          };
        }
        return permit;
      })
    );

    setReplyingTo(null);
    setReplyText('');
  };

  const toggleResolveComment = (permitId: string, commentId: string) => {
    setPermits(
      permits.map((permit) => {
        if (permit.id === permitId) {
          return {
            ...permit,
            comments: permit.comments.map((comment) => {
              if (comment.id === commentId) {
                return { ...comment, resolved: !comment.resolved };
              }
              return comment;
            }),
          };
        }
        return permit;
      })
    );
  };

  const changePermitStatus = (permitId: string, newStatus: string) => {
    setPermits(
      permits.map((permit) => {
        if (permit.id === permitId) {
          return { ...permit, status: newStatus as any };
        }
        return permit;
      })
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-display font-semibold text-foreground">Permits & Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track permit applications and reviewer feedback
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
        <input
          type="text"
          placeholder="Search by permit #, type, or project..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusTab(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            statusTab === null
              ? 'bg-accent text-primary'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {allStatuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusTab(status)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusTab === status
                ? 'bg-accent text-primary'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Permit Cards */}
      <div className="space-y-4">
        {filteredPermits.map((permit, index) => (
          <motion.div
            key={permit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-border overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{permit.id}</h3>
                      <div className="flex gap-2 items-center">
                        <Badge className={getStatusColor(permit.status)}>
                          {permit.status}
                        </Badge>
                        <select
                          value={permit.status}
                          onChange={(e) => changePermitStatus(permit.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          {['Under Review', 'Approved', 'Resubmittal Required', 'Pending'].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-2">{permit.type}</p>
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
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`rounded-lg p-4 space-y-2 ${
                            comment.resolved ? 'bg-secondary/30' : 'bg-secondary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getAvatarColor(
                                  comment.initials
                                )}`}
                              >
                                {comment.initials}
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${comment.resolved ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                  {comment.author}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {comment.role} • {comment.timestamp}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleResolveComment(permit.id, comment.id)}
                              className={`p-1 rounded hover:bg-secondary transition-colors ${
                                comment.resolved ? 'text-emerald-600' : 'text-muted-foreground'
                              }`}
                              title={comment.resolved ? 'Unresolve' : 'Resolve'}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className={`text-sm ml-11 ${comment.resolved ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {comment.text}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Reply Section */}
                    <div className="ml-11 mt-4 space-y-2">
                      {replyingTo === permit.id ? (
                        <div className="space-y-2">
                          <textarea
                            autoFocus
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply..."
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReply(permit.id, '')}
                              className="px-3 py-1.5 rounded-lg bg-accent text-primary hover:bg-accent/90 text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              Send
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-secondary text-sm font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(permit.id)}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          + Add reply
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPermits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No permits found matching your search.</p>
        </div>
      )}
    </div>
  );
}
