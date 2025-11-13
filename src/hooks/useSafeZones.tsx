import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSafeZones = (parentId?: string, childId?: string) => {
  const [safeZones, setSafeZones] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch safe zones
  const fetchSafeZones = useCallback(async () => {
    if (!parentId || !childId) return;

    const { data, error } = await supabase
      .from("safe_zones")
      .select("*")
      .eq("parent_id", parentId)
      .eq("child_id", childId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSafeZones(data);
    }
    setLoading(false);
  }, [parentId, childId]);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    if (!parentId) return;

    const { data, error } = await supabase
      .from("geofence_alerts")
      .select(`
        *,
        safe_zones (name),
        profiles!geofence_alerts_child_id_fkey (full_name)
      `)
      .eq("parent_id", parentId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setAlerts(data);
    }
  }, [parentId]);

  // Create safe zone
  const createSafeZone = useCallback(async (zoneData: {
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    notify_on_entry?: boolean;
    notify_on_exit?: boolean;
  }) => {
    if (!parentId || !childId) return;

    const { data, error } = await supabase
      .from("safe_zones")
      .insert({
        parent_id: parentId,
        child_id: childId,
        ...zoneData,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create safe zone",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Safe Zone Created",
      description: `${zoneData.name} has been added`,
    });

    fetchSafeZones();
    return data;
  }, [parentId, childId, toast, fetchSafeZones]);

  // Update safe zone
  const updateSafeZone = useCallback(async (zoneId: string, updates: any) => {
    const { error } = await supabase
      .from("safe_zones")
      .update(updates)
      .eq("id", zoneId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update safe zone",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Safe Zone Updated",
      description: "Settings have been saved",
    });

    fetchSafeZones();
    return true;
  }, [toast, fetchSafeZones]);

  // Delete safe zone
  const deleteSafeZone = useCallback(async (zoneId: string) => {
    const { error } = await supabase
      .from("safe_zones")
      .delete()
      .eq("id", zoneId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete safe zone",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Safe Zone Deleted",
      description: "Zone has been removed",
    });

    fetchSafeZones();
    return true;
  }, [toast, fetchSafeZones]);

  // Mark alert as read
  const markAlertAsRead = useCallback(async (alertId: string) => {
    await supabase
      .from("geofence_alerts")
      .update({ is_read: true })
      .eq("id", alertId);

    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    fetchSafeZones();
    fetchAlerts();
  }, [fetchSafeZones, fetchAlerts]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!parentId || !childId) return;

    const zonesChannel = supabase
      .channel('safe-zones-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'safe_zones',
          filter: `child_id=eq.${childId}`,
        },
        () => {
          fetchSafeZones();
        }
      )
      .subscribe();

    const alertsChannel = supabase
      .channel('geofence-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'geofence_alerts',
          filter: `parent_id=eq.${parentId}`,
        },
        (payload) => {
          fetchAlerts();
          // Show toast notification for new alert
          const alert = payload.new as any;
          toast({
            title: "Geofence Alert",
            description: alert.message,
            variant: alert.event_type === 'exit' ? "destructive" : "default",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(zonesChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [parentId, childId, fetchSafeZones, fetchAlerts, toast]);

  return {
    safeZones,
    alerts,
    loading,
    createSafeZone,
    updateSafeZone,
    deleteSafeZone,
    markAlertAsRead,
    refetch: () => {
      fetchSafeZones();
      fetchAlerts();
    },
  };
};
