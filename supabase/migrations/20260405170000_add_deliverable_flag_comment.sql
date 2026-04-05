-- Add flag_comment column to deliverables
ALTER TABLE public.deliverables
  ADD COLUMN IF NOT EXISTS flag_comment text;

-- Replace the flag function to also handle the comment
-- Clears comment when unflagging
CREATE OR REPLACE FUNCTION public.set_deliverable_flagged(
  p_id      uuid,
  p_flagged boolean,
  p_comment text DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.deliverables
  SET flagged      = p_flagged,
      flag_comment = CASE WHEN p_flagged THEN p_comment ELSE NULL END
  WHERE id = p_id;
$$;
