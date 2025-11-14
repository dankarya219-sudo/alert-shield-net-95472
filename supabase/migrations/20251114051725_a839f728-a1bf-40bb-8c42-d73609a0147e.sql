-- Add emergency_password field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN emergency_password TEXT,
ADD COLUMN emergency_gesture_enabled BOOLEAN DEFAULT false;

-- Add comment explaining the fields
COMMENT ON COLUMN public.profiles.emergency_password IS 'Hashed password for emergency mode confirmation';
COMMENT ON COLUMN public.profiles.emergency_gesture_enabled IS 'Whether gesture-based emergency trigger is enabled';