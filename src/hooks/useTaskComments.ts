
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

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
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

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
      const { error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          comment_text: commentText
        });

      if (error) throw error;

      toast({
        title: "Kommentar hinzugefügt",
        description: "Der Kommentar wurde erfolgreich hinzugefügt."
      });

      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Fehler beim Hinzufügen des Kommentars",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  return {
    comments,
    loading,
    addComment,
    refetch: fetchComments
  };
}
