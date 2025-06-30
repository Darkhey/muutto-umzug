
-- Add consent tracking for AI assistant
ALTER TABLE public.profiles ADD COLUMN ai_assistant_consent BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN ai_assistant_consent_date TIMESTAMP WITH TIME ZONE;

-- Create chat_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table if it doesn't exist  
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for chat tables
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat sessions policies
CREATE POLICY "Users can view their household chat sessions" 
  ON public.chat_sessions FOR SELECT 
  USING (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
    )
  );

CREATE POLICY "Users can create chat sessions for their households" 
  ON public.chat_sessions FOR INSERT 
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
    )
  );

-- Chat messages policies  
CREATE POLICY "Users can view messages from their household sessions" 
  ON public.chat_messages FOR SELECT 
  USING (
    session_id IN (
      SELECT id FROM public.chat_sessions 
      WHERE household_id IN (
        SELECT household_id FROM public.household_members 
        WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
      )
    )
  );

CREATE POLICY "Users can create messages in their household sessions" 
  ON public.chat_messages FOR INSERT 
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.chat_sessions 
      WHERE household_id IN (
        SELECT household_id FROM public.household_members 
        WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
      )
    )
  );
