import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useParentalControls = (parentId?: string, childId?: string) => {
  const [controls, setControls] = useState<any>(null);
  const [blockedApps, setBlockedApps] = useState<any[]>([]);
  const [appUsage, setAppUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch parental controls
  const fetchControls = useCallback(async () => {
    if (!parentId || !childId) return;

    const { data, error } = await supabase
      .from("parental_controls")
      .select("*")
      .eq("parent_id", parentId)
      .eq("child_id", childId)
      .maybeSingle();

    if (!error) {
      if (!data) {
        // Create default controls if none exist
        const { data: newControls } = await supabase
          .from("parental_controls")
          .insert({
            parent_id: parentId,
            child_id: childId,
            screen_time_limit: 300, // 5 hours default
            bedtime_mode_enabled: false,
            school_mode_enabled: false,
            location_tracking_enabled: true,
          })
          .select()
          .single();
        setControls(newControls);
      } else {
        setControls(data);
      }
    }
    setLoading(false);
  }, [parentId, childId]);

  // Fetch blocked apps
  const fetchBlockedApps = useCallback(async () => {
    if (!childId) return;

    const { data, error } = await supabase
      .from("blocked_apps")
      .select("*")
      .eq("child_id", childId);

    if (!error && data) {
      setBlockedApps(data);
    }
  }, [childId]);

  // Fetch app usage for today
  const fetchAppUsage = useCallback(async () => {
    if (!childId) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from("app_usage")
      .select("*")
      .eq("user_id", childId)
      .eq("usage_date", today);

    if (!error && data) {
      setAppUsage(data);
    }
  }, [childId]);

  // Update control settings
  const updateControls = useCallback(async (updates: any) => {
    if (!controls) return;

    const { error } = await supabase
      .from("parental_controls")
      .update(updates)
      .eq("id", controls.id);

    if (!error) {
      setControls({ ...controls, ...updates });
      toast({
        title: "Settings Updated",
        description: "Parental control settings have been saved",
      });
    }
  }, [controls, toast]);

  // Block/unblock an app
  const toggleAppBlock = useCallback(async (appName: string, packageName: string, isBlocked: boolean) => {
    if (!parentId || !childId) return;

    if (isBlocked) {
      // Block the app
      const { error } = await supabase
        .from("blocked_apps")
        .insert({
          parent_id: parentId,
          child_id: childId,
          app_name: appName,
          package_name: packageName,
          is_blocked: true,
        });

      if (!error) {
        toast({
          title: "App Blocked",
          description: `${appName} has been blocked`,
          variant: "destructive",
        });
        fetchBlockedApps();
      }
    } else {
      // Unblock the app
      const { error } = await supabase
        .from("blocked_apps")
        .delete()
        .eq("child_id", childId)
        .eq("package_name", packageName);

      if (!error) {
        toast({
          title: "App Unblocked",
          description: `${appName} has been unblocked`,
        });
        fetchBlockedApps();
      }
    }
  }, [parentId, childId, toast, fetchBlockedApps]);

  // Track app usage
  const trackAppUsage = useCallback(async (appName: string, packageName: string, durationMinutes: number) => {
    if (!childId) return;

    const today = new Date().toISOString().split('T')[0];

    // Check if usage record exists
    const { data: existing } = await supabase
      .from("app_usage")
      .select("*")
      .eq("user_id", childId)
      .eq("package_name", packageName)
      .eq("usage_date", today)
      .maybeSingle();

    if (existing) {
      // Update existing record
      await supabase
        .from("app_usage")
        .update({
          duration_minutes: existing.duration_minutes + durationMinutes,
          times_opened: existing.times_opened + 1,
          last_used: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Create new record
      await supabase
        .from("app_usage")
        .insert({
          user_id: childId,
          app_name: appName,
          package_name: packageName,
          usage_date: today,
          duration_minutes: durationMinutes,
          times_opened: 1,
          last_used: new Date().toISOString(),
        });
    }

    fetchAppUsage();
  }, [childId, fetchAppUsage]);

  useEffect(() => {
    fetchControls();
    fetchBlockedApps();
    fetchAppUsage();
  }, [fetchControls, fetchBlockedApps, fetchAppUsage]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!childId) return;

    const channel = supabase
      .channel('parental-controls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parental_controls',
          filter: `child_id=eq.${childId}`,
        },
        () => {
          fetchControls();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blocked_apps',
          filter: `child_id=eq.${childId}`,
        },
        () => {
          fetchBlockedApps();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childId, fetchControls, fetchBlockedApps]);

  return {
    controls,
    blockedApps,
    appUsage,
    loading,
    updateControls,
    toggleAppBlock,
    trackAppUsage,
    refetch: () => {
      fetchControls();
      fetchBlockedApps();
      fetchAppUsage();
    },
  };
};
