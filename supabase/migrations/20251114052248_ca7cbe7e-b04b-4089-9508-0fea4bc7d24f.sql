-- Add power button gesture option to profiles
ALTER TABLE public.profiles 
ADD COLUMN power_button_gesture_enabled BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.profiles.power_button_gesture_enabled IS 'Whether power button gesture (3 quick presses) is enabled for emergency trigger';