import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

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

    const { latitude, longitude } = await req.json();

    console.log(`Checking geofences for user ${user.id} at location: ${latitude}, ${longitude}`);

    // Get all active safe zones for this user
    const { data: safeZones, error: zonesError } = await supabase
      .from('safe_zones')
      .select('*')
      .eq('child_id', user.id)
      .eq('is_active', true);

    if (zonesError) {
      throw zonesError;
    }

    if (!safeZones || safeZones.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No safe zones configured', events: [] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Get the last known events for each zone
    const { data: lastEvents } = await supabase
      .from('geofence_events')
      .select('safe_zone_id, event_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const lastEventsByZone = new Map();
    lastEvents?.forEach((event) => {
      if (!lastEventsByZone.has(event.safe_zone_id)) {
        lastEventsByZone.set(event.safe_zone_id, event);
      }
    });

    const eventsToCreate = [];
    const alertsToCreate = [];

    // Check each safe zone
    for (const zone of safeZones) {
      const distance = calculateDistance(
        latitude,
        longitude,
        zone.latitude,
        zone.longitude
      );

      const isInside = distance <= zone.radius_meters;
      const lastEvent = lastEventsByZone.get(zone.id);
      const wasInside = lastEvent?.event_type === 'entry';

      // Detect entry
      if (isInside && !wasInside) {
        console.log(`Entry detected for zone ${zone.name}`);
        
        eventsToCreate.push({
          safe_zone_id: zone.id,
          user_id: user.id,
          event_type: 'entry',
          location_latitude: latitude,
          location_longitude: longitude,
        });

        if (zone.notify_on_entry) {
          alertsToCreate.push({
            parent_id: zone.parent_id,
            child_id: zone.child_id,
            safe_zone_id: zone.id,
            event_type: 'entry',
            message: `Child entered ${zone.name}`,
          });
        }
      }
      // Detect exit
      else if (!isInside && wasInside) {
        console.log(`Exit detected for zone ${zone.name}`);
        
        eventsToCreate.push({
          safe_zone_id: zone.id,
          user_id: user.id,
          event_type: 'exit',
          location_latitude: latitude,
          location_longitude: longitude,
        });

        if (zone.notify_on_exit) {
          alertsToCreate.push({
            parent_id: zone.parent_id,
            child_id: zone.child_id,
            safe_zone_id: zone.id,
            event_type: 'exit',
            message: `Child left ${zone.name}`,
          });
        }
      }
    }

    // Insert events and alerts
    if (eventsToCreate.length > 0) {
      await supabase.from('geofence_events').insert(eventsToCreate);
    }

    if (alertsToCreate.length > 0) {
      await supabase.from('geofence_alerts').insert(alertsToCreate);
    }

    return new Response(
      JSON.stringify({
        message: 'Geofence check completed',
        events: eventsToCreate.length,
        alerts: alertsToCreate.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error checking geofences:', error);
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
