
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

type TaskComment = Database['public']['Tables']['task_comments']['Row'];
type TaskCommentInsert = Database['public']['Tables']['task_comments']['Insert'];

export function useTaskComments(taskId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_comments')
        .select('*, profiles(full_name)')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Fehler beim Laden der Kommentare",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (commentText: string) => {
    if (!taskId || !user) return;

    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          comment_text: commentText,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Kommentar hinzugefügt",
        description: "Ihr Kommentar wurde erfolgreich hinzugefügt."
      });

      await fetchComments(); // Refetch comments to include the new one
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Fehler beim Hinzufügen des Kommentars",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  return {
    comments,
    loading,
    addComment,
    refetch: fetchComments,
  };
}
