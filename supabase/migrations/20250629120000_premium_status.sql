/*
  # Premium Status Table

  1. New Table
    - premium_status tracks Stripe purchases

  2. Security
    - RLS policies ensure users can only read/write their own premium info
*/

-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.premium_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  premium_mode TEXT CHECK (premium_mode IN ('one-time','monthly')),
  purchase_date TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  features_enabled JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.premium_status ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their premium status" ON public.premium_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their premium status" ON public.premium_status
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their premium status" ON public.premium_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);
