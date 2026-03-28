import { z } from 'zod';

/**
 * Comment category enum - matches database comment_category enum
 */
const COMMENT_CATEGORIES = [
  'parking_access',
  'stormwater',
  'building_code',
  'zoning',
  'fire_safety',
  'landscaping',
  'traffic',
  'environmental',
  'general',
  'other',
] as const;

/**
 * Comment source enum - matches database comment_source enum
 */
const COMMENT_SOURCES = ['internal', 'jurisdiction', 'imported'] as const;

/**
 * Schema for creating a new comment
 */
export const createCommentSchema = z.object({
  permit_id: z.string().uuid('Invalid permit ID'),
  body: z.string()
    .min(1, 'Comment body is required')
    .max(10000, 'Comment must be less than 10,000 characters'),
  category: z.enum(COMMENT_CATEGORIES).optional(),
  source: z.enum(COMMENT_SOURCES).optional(),
  parent_comment_id: z.string().uuid('Invalid parent comment ID').optional().nullable(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

/**
 * Schema for updating an existing comment
 */
export const updateCommentSchema = z.object({
  body: z.string()
    .min(1, 'Comment body is required')
    .max(10000, 'Comment must be less than 10,000 characters')
    .optional(),
  category: z.enum(COMMENT_CATEGORIES).optional(),
  is_resolved: z.boolean().optional(),
  assigned_to: z.string().uuid('Invalid assignee ID').nullable().optional(),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

/**
 * Schema for resolving a comment
 */
export const resolveCommentSchema = z.object({
  resolution_note: z.string()
    .max(2000, 'Resolution note must be less than 2,000 characters')
    .optional()
    .nullable(),
});

export type ResolveCommentInput = z.infer<typeof resolveCommentSchema>;

/**
 * Schema for assigning a comment to a user
 */
export const assignCommentSchema = z.object({
  assigned_to: z.string().uuid('Invalid user ID'),
});

export type AssignCommentInput = z.infer<typeof assignCommentSchema>;

/**
 * Schema for unresolving a comment
 */
export const unresolveCommentSchema = z.object({
  reason: z.string()
    .max(2000, 'Reason must be less than 2,000 characters')
    .optional(),
});

export type UnresolveCommentInput = z.infer<typeof unresolveCommentSchema>;

/**
 * Schema for bulk comment actions
 */
export const bulkCommentActionSchema = z.object({
  comment_ids: z.array(z.string().uuid()).min(1, 'At least one comment is required').max(100, 'Maximum 100 comments per action'),
  action: z.enum(['resolve', 'assign', 'unresolve', 'delete']),
  assigned_to: z.string().uuid('Invalid user ID').optional(),
});

export type BulkCommentActionInput = z.infer<typeof bulkCommentActionSchema>;

/**
 * Schema for filtering comments
 */
export const commentFilterSchema = z.object({
  permit_id: z.string().uuid().optional(),
  category: z.array(z.enum(COMMENT_CATEGORIES)).optional(),
  is_resolved: z.boolean().optional(),
  assigned_to: z.string().uuid().optional(),
  search: z.string().max(500).optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'category']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(500).optional(),
  offset: z.number().min(0).optional(),
});

export type CommentFilterInput = z.infer<typeof commentFilterSchema>;

/**
 * Schema for AI-powered comment suggestions
 */
export const commentAISuggestionSchema = z.object({
  permit_id: z.string().uuid('Invalid permit ID'),
  context: z.string()
    .min(10, 'Context must be at least 10 characters')
    .max(5000, 'Context must be less than 5,000 characters'),
  tone: z.enum(['professional', 'friendly', 'formal']).optional().default('professional'),
});

export type CommentAISuggestionInput = z.infer<typeof commentAISuggestionSchema>;

export const commentAISuggestionResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      text: z.string(),
      category: z.enum(COMMENT_CATEGORIES).optional(),
      confidence: z.number().min(0).max(1),
    })
  ),
  generated_at: z.string().datetime(),
});

export type CommentAISuggestionResponse = z.infer<typeof commentAISuggestionResponseSchema>;
