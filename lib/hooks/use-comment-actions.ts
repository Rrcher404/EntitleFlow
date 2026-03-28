'use client';

import { useState, useCallback, useRef } from 'react';
import type { Comment } from '@/lib/types/index';

interface UseCommentActionsOptions {
  onSuccess?: (action: string) => void;
  onError?: (error: Error) => void;
  optimisticUpdates?: boolean;
}

interface CommentActionState {
  comments: Comment[];
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
}

/**
 * Hook for managing comment operations with optimistic updates
 * Provides functions to create, update, resolve, assign, and perform bulk actions on comments
 */
export function useCommentActions(
  initialComments: Comment[] = [],
  options: UseCommentActionsOptions = {}
) {
  const { onSuccess, onError, optimisticUpdates = true } = options;
  const previousStateRef = useRef<CommentActionState | null>(null);

  const [state, setState] = useState<CommentActionState>({
    comments: initialComments,
    loading: {},
    error: {},
  });

  /**
   * Helper to revert optimistic updates
   */
  const revertToSnapshot = useCallback((snapshot: CommentActionState) => {
    setState(snapshot);
  }, []);

  /**
   * Create a snapshot of current state for potential rollback
   */
  const createSnapshot = useCallback(() => {
    return {
      comments: [...state.comments],
      loading: { ...state.loading },
      error: { ...state.error },
    };
  }, [state]);

  /**
   * Resolve a comment
   */
  const resolveComment = useCallback(
    async (commentId: string, note?: string) => {
      const snapshot = createSnapshot();
      previousStateRef.current = snapshot;

      try {
        // Optimistic update
        if (optimisticUpdates) {
          setState((prev) => ({
            ...prev,
            comments: prev.comments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    is_resolved: true,
                    resolved_at: new Date().toISOString(),
                  }
                : c
            ),
            loading: { ...prev.loading, [commentId]: true },
          }));
        } else {
          setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, [commentId]: true },
          }));
        }

        const response = await fetch(`/api/comments/${commentId}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolution_note: note }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to resolve comment: ${response.statusText}`
          );
        }

        const { data } = await response.json();

        setState((prev) => ({
          ...prev,
          comments: prev.comments.map((c) => (c.id === commentId ? data : c)),
          loading: { ...prev.loading, [commentId]: false },
          error: { ...prev.error, [commentId]: null },
        }));

        onSuccess?.('resolve');
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        // Revert optimistic update
        if (optimisticUpdates && previousStateRef.current) {
          revertToSnapshot(previousStateRef.current);
        }

        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, [commentId]: false },
          error: { ...prev.error, [commentId]: err.message },
        }));

        onError?.(err);
      }
    },
    [createSnapshot, revertToSnapshot, optimisticUpdates, onSuccess, onError]
  );

  /**
   * Unresolve a comment
   */
  const unresolveComment = useCallback(
    async (commentId: string, reason?: string) => {
      const snapshot = createSnapshot();
      previousStateRef.current = snapshot;

      try {
        if (optimisticUpdates) {
          setState((prev) => ({
            ...prev,
            comments: prev.comments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    is_resolved: false,
                    resolved_at: null,
                    resolved_by: null,
                  }
                : c
            ),
            loading: { ...prev.loading, [commentId]: true },
          }));
        } else {
          setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, [commentId]: true },
          }));
        }

        const response = await fetch(`/api/comments/${commentId}/unresolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to unresolve comment: ${response.statusText}`
          );
        }

        const { data } = await response.json();

        setState((prev) => ({
          ...prev,
          comments: prev.comments.map((c) => (c.id === commentId ? data : c)),
          loading: { ...prev.loading, [commentId]: false },
          error: { ...prev.error, [commentId]: null },
        }));

        onSuccess?.('unresolve');
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (optimisticUpdates && previousStateRef.current) {
          revertToSnapshot(previousStateRef.current);
        }

        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, [commentId]: false },
          error: { ...prev.error, [commentId]: err.message },
        }));

        onError?.(err);
      }
    },
    [createSnapshot, revertToSnapshot, optimisticUpdates, onSuccess, onError]
  );

  /**
   * Assign a comment to a user
   */
  const assignComment = useCallback(
    async (commentId: string, assignedToId: string) => {
      const snapshot = createSnapshot();
      previousStateRef.current = snapshot;

      try {
        if (optimisticUpdates) {
          setState((prev) => ({
            ...prev,
            comments: prev.comments.map((c) =>
              c.id === commentId
                ? { ...c, assigned_to: assignedToId }
                : c
            ),
            loading: { ...prev.loading, [commentId]: true },
          }));
        } else {
          setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, [commentId]: true },
          }));
        }

        const response = await fetch(`/api/comments/${commentId}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assigned_to: assignedToId }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to assign comment: ${response.statusText}`
          );
        }

        const { data } = await response.json();

        setState((prev) => ({
          ...prev,
          comments: prev.comments.map((c) => (c.id === commentId ? data : c)),
          loading: { ...prev.loading, [commentId]: false },
          error: { ...prev.error, [commentId]: null },
        }));

        onSuccess?.('assign');
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (optimisticUpdates && previousStateRef.current) {
          revertToSnapshot(previousStateRef.current);
        }

        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, [commentId]: false },
          error: { ...prev.error, [commentId]: err.message },
        }));

        onError?.(err);
      }
    },
    [createSnapshot, revertToSnapshot, optimisticUpdates, onSuccess, onError]
  );

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(
    async (commentId: string) => {
      const snapshot = createSnapshot();
      previousStateRef.current = snapshot;

      try {
        if (optimisticUpdates) {
          setState((prev) => ({
            ...prev,
            comments: prev.comments.filter((c) => c.id !== commentId),
            loading: { ...prev.loading, [commentId]: true },
          }));
        } else {
          setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, [commentId]: true },
          }));
        }

        const response = await fetch(`/api/comments/${commentId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(
            `Failed to delete comment: ${response.statusText}`
          );
        }

        setState((prev) => {
          const newLoading = { ...prev.loading };
          delete newLoading[commentId];
          const newError = { ...prev.error };
          delete newError[commentId];

          return {
            ...prev,
            loading: newLoading,
            error: newError,
          };
        });

        onSuccess?.('delete');
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (optimisticUpdates && previousStateRef.current) {
          revertToSnapshot(previousStateRef.current);
        }

        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, [commentId]: false },
          error: { ...prev.error, [commentId]: err.message },
        }));

        onError?.(err);
      }
    },
    [createSnapshot, revertToSnapshot, optimisticUpdates, onSuccess, onError]
  );

  /**
   * Add a new comment
   */
  const addComment = useCallback(
    async (permitId: string, body: string, category?: string) => {
      const optimisticId = `temp-${Date.now()}`;

      try {
        if (optimisticUpdates) {
          setState((prev) => ({
            ...prev,
            comments: [
              ...prev.comments,
              {
                id: optimisticId,
                permit_id: permitId,
                body,
                category: category || null,
                is_resolved: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as Comment,
            ],
            loading: { ...prev.loading, [optimisticId]: true },
          }));
        }

        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permit_id: permitId, body, category }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create comment: ${response.statusText}`);
        }

        const { data } = await response.json();

        setState((prev) => ({
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === optimisticId ? data : c
          ),
          loading: { ...prev.loading, [optimisticId]: false },
          error: { ...prev.error, [optimisticId]: null },
        }));

        onSuccess?.('create');
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (optimisticUpdates) {
          setState((prev) => ({
            ...prev,
            comments: prev.comments.filter((c) => c.id !== optimisticId),
          }));
        }

        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, [optimisticId]: false },
          error: { ...prev.error, [optimisticId]: err.message },
        }));

        onError?.(err);
        throw err;
      }
    },
    [optimisticUpdates, onSuccess, onError]
  );

  /**
   * Perform bulk action on multiple comments
   */
  const bulkAction = useCallback(
    async (
      commentIds: string[],
      action: 'resolve' | 'assign' | 'unresolve' | 'delete',
      assignedTo?: string
    ) => {
      const snapshot = createSnapshot();
      previousStateRef.current = snapshot;

      try {
        if (optimisticUpdates) {
          setState((prev) => ({
            ...prev,
            comments:
              action === 'delete'
                ? prev.comments.filter((c) => !commentIds.includes(c.id))
                : prev.comments.map((c) =>
                    commentIds.includes(c.id)
                      ? {
                          ...c,
                          ...(action === 'resolve' && {
                            is_resolved: true,
                            resolved_at: new Date().toISOString(),
                          }),
                          ...(action === 'unresolve' && {
                            is_resolved: false,
                            resolved_at: null,
                            resolved_by: null,
                          }),
                          ...(action === 'assign' &&
                            assignedTo && {
                            assigned_to: assignedTo,
                          }),
                        }
                      : c
                  ),
            loading: Object.fromEntries(
              commentIds.map((id) => [id, true])
            ),
          }));
        }

        const response = await fetch('/api/comments/bulk-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment_ids: commentIds,
            action,
            assigned_to: assignedTo,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to perform bulk action: ${response.statusText}`
          );
        }

        const { data } = await response.json();

        setState((prev) => ({
          ...prev,
          comments: prev.comments.map((c) => {
            const updated = data.find((d: Comment) => d.id === c.id);
            return updated || c;
          }),
          loading: Object.fromEntries(commentIds.map((id) => [id, false])),
          error: Object.fromEntries(commentIds.map((id) => [id, null])),
        }));

        onSuccess?.('bulk-action');
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (optimisticUpdates && previousStateRef.current) {
          revertToSnapshot(previousStateRef.current);
        }

        const errorRecord = Object.fromEntries(
          commentIds.map((id) => [id, err.message])
        );

        setState((prev) => ({
          ...prev,
          loading: Object.fromEntries(commentIds.map((id) => [id, false])),
          error: errorRecord,
        }));

        onError?.(err);
      }
    },
    [createSnapshot, revertToSnapshot, optimisticUpdates, onSuccess, onError]
  );

  /**
   * Get AI suggestions for a comment
   */
  const getAISuggestion = useCallback(
    async (
      permitId: string,
      context: string,
      tone: 'professional' | 'friendly' | 'formal' = 'professional'
    ) => {
      try {
        const response = await fetch('/api/comments/ai-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            permit_id: permitId,
            context,
            tone,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to get suggestions: ${response.statusText}`
          );
        }

        const { data } = await response.json();
        return data.suggestions;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        throw err;
      }
    },
    [onError]
  );

  /**
   * Update comments list (for external updates)
   */
  const setComments = useCallback((newComments: Comment[]) => {
    setState((prev) => ({
      ...prev,
      comments: newComments,
    }));
  }, []);

  return {
    comments: state.comments,
    loading: state.loading,
    error: state.error,
    resolveComment,
    unresolveComment,
    assignComment,
    deleteComment,
    addComment,
    bulkAction,
    getAISuggestion,
    setComments,
  };
}
