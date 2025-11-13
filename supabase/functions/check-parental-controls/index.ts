import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { appPackageName, action } = await req.json();

    console.log(`Checking parental controls for user ${user.id}, app: ${appPackageName}, action: ${action}`);

    // Get parental controls for this user
    const { data: controls, error: controlsError } = await supabase
      .from('parental_controls')
      .select('*')
      .eq('child_id', user.id)
      .maybeSingle();

    if (controlsError) {
      throw controlsError;
    }

    // Check if app is blocked
    const { data: blockedApps } = await supabase
      .from('blocked_apps')
      .select('*')
      .eq('child_id', user.id)
      .eq('package_name', appPackageName)
      .eq('is_blocked', true);

    const isAppBlocked = blockedApps && blockedApps.length > 0;

    // Check screen time limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: sessions } = await supabase
      .from('screen_time_sessions')
      .select('duration_minutes')
      .eq('user_id', user.id)
      .gte('started_at', today.toISOString());

    const totalMinutesToday = sessions?.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) || 0;
    const limitMinutes = controls?.screen_time_limit || 300;
    const hasExceededScreenTime = totalMinutesToday >= limitMinutes;

    // Check if in school mode
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const schoolStart = parseInt(controls?.school_mode_start?.replace(':', '') || '0');
    const schoolEnd = parseInt(controls?.school_mode_end?.replace(':', '') || '0');
    const isSchoolHours = controls?.school_mode_enabled && currentTime >= schoolStart && currentTime <= schoolEnd;

    // Check if bedtime
    const bedtimeStart = parseInt(controls?.bedtime_start?.replace(':', '') || '0');
    const bedtimeEnd = parseInt(controls?.bedtime_end?.replace(':', '') || '0');
    const isBedtime = controls?.bedtime_mode_enabled && (currentTime >= bedtimeStart || currentTime <= bedtimeEnd);

    // Determine if action is allowed
    const isAllowed = !isAppBlocked && !hasExceededScreenTime && !isSchoolHours && !isBedtime;

    // Send alert if needed
    if (!isAllowed && action === 'open') {
      const alertMessage = isAppBlocked 
        ? `${appPackageName} is blocked`
        : hasExceededScreenTime
        ? 'Screen time limit exceeded'
        : isSchoolHours
        ? 'School mode is active'
        : 'Bedtime mode is active';

      await supabase.from('screen_time_alerts').insert({
        user_id: user.id,
        alert_type: 'restriction',
        message: alertMessage,
      });
    }

    return new Response(
      JSON.stringify({
        allowed: isAllowed,
        reason: !isAllowed 
          ? (isAppBlocked ? 'app_blocked' : hasExceededScreenTime ? 'screen_time_exceeded' : isSchoolHours ? 'school_mode' : 'bedtime_mode')
          : null,
        screenTime: {
          used: totalMinutesToday,
          limit: limitMinutes,
          remaining: Math.max(0, limitMinutes - totalMinutesToday),
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error checking parental controls:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
