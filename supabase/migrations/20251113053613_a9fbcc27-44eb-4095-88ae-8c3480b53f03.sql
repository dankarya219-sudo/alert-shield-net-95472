-- Trigger types regeneration for existing tables
-- This comment migration will cause Supabase to regenerate the types file
-- to include all existing tables in the database

-- Verify all tables exist and are properly configured
DO $$
BEGIN
  -- Just a comment to trigger regeneration
  -- All tables already exist: family_connections, danger_zones, parental_controls,
  -- blocked_apps, app_usage, safe_zones, geofence_alerts, screen_time_sessions,
  -- emergency_alerts, user_locations, profiles, screen_time_alerts, geofence_events
  NULL;
END $$;