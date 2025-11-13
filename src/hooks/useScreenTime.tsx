import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useScreenTime = (userId?: string) => {
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [todayUsage, setTodayUsage] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Start a new screen time session
  const startSession = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("screen_time_sessions")
      .insert({
        user_id: userId,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentSession(data);
    }
  }, [userId]);

  // End the current session
  const endSession = useCallback(async () => {
    if (!currentSession) return;

    const endTime = new Date();
    const startTime = new Date(currentSession.started_at);
    const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

    await supabase
      .from("screen_time_sessions")
      .update({
        ended_at: endTime.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq("id", currentSession.id);

    setCurrentSession(null);
  }, [currentSession]);

  // Get today's total usage
  const fetchTodayUsage = useCallback(async () => {
    if (!userId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("screen_time_sessions")
      .select("duration_minutes")
      .eq("user_id", userId)
      .gte("started_at", today.toISOString());

    if (!error && data) {
      const total = data.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
      setTodayUsage(total);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTodayUsage();
  }, [fetchTodayUsage]);

  return {
    currentSession,
    todayUsage,
    loading,
    startSession,
    endSession,
    refetch: fetchTodayUsage,
  };
};
