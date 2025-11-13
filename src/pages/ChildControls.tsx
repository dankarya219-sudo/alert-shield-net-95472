import { useEffect, useState } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Clock, Lock, Smartphone, AlertCircle, ZapOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useParentalControls } from "@/hooks/useParentalControls";
import { useScreenTime } from "@/hooks/useScreenTime";
import { supabase } from "@/integrations/supabase/client";

const ChildControls = () => {
  const { user } = useAuth();
  const [parentId, setParentId] = useState<string | null>(null);
  const { controls, blockedApps, appUsage } = useParentalControls(parentId, user?.id);
  const { todayUsage, startSession, endSession, currentSession } = useScreenTime(user?.id);

  // Find parent connection
  useEffect(() => {
    const fetchParent = async () => {
      if (!user?.id) return;

      const { data } = await supabase
        .from("family_connections")
        .select("parent_id")
        .eq("child_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (data) {
        setParentId(data.parent_id);
      }
    };

    fetchParent();
  }, [user?.id]);

  // Auto-track screen time session
  useEffect(() => {
    if (user?.id && !currentSession) {
      startSession();
    }

    // End session on unmount
    return () => {
      if (currentSession) {
        endSession();
      }
    };
  }, [user?.id, currentSession, startSession, endSession]);

  const screenTimeLimit = controls?.screen_time_limit || 300;
  const screenTimeUsed = todayUsage / 60; // Convert minutes to hours
  const screenTimePercentage = (todayUsage / screenTimeLimit) * 100;
  const timeRemaining = Math.max(0, (screenTimeLimit - todayUsage) / 60);

  const isSchoolHours = () => {
    if (!controls?.school_mode_enabled) return false;
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const start = parseInt(controls.school_mode_start?.replace(":", "") || "0");
    const end = parseInt(controls.school_mode_end?.replace(":", "") || "0");
    return currentTime >= start && currentTime <= end;
  };

  const isBedtime = () => {
    if (!controls?.bedtime_mode_enabled) return false;
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const start = parseInt(controls.bedtime_start?.replace(":", "") || "0");
    const end = parseInt(controls.bedtime_end?.replace(":", "") || "0");
    return currentTime >= start || currentTime <= end;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        title="My Device Limits"
        onMenuClick={() => {}}
        onNotificationsClick={() => {}}
      />
      
      <main className="max-w-screen-sm mx-auto px-4 py-6">
        {/* Current Status Alerts */}
        {isBedtime() && (
          <Card className="mb-4 p-4 border-2 border-warning bg-warning/10">
            <div className="flex items-start gap-3">
              <ZapOff className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-semibold text-warning mb-1">Bedtime Mode Active</h3>
                <p className="text-sm text-foreground">
                  Your device is in bedtime mode. Limited access until {controls?.bedtime_end}
                </p>
              </div>
            </div>
          </Card>
        )}

        {isSchoolHours() && (
          <Card className="mb-4 p-4 border-2 border-accent bg-accent/10">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <h3 className="font-semibold text-accent mb-1">School Mode Active</h3>
                <p className="text-sm text-foreground">
                  Your device is in school mode. Limited access until {controls?.school_mode_end}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Screen Time Overview */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Screen Time Today</h3>
          <Card className="p-6 border-2 border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {screenTimeUsed.toFixed(1)}h
                </p>
                <p className="text-sm text-muted-foreground">
                  of {(screenTimeLimit / 60).toFixed(1)}h used
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                screenTimePercentage > 80 ? "bg-emergency/20" : "bg-success/20"
              }`}>
                <Clock className={`w-8 h-8 ${
                  screenTimePercentage > 80 ? "text-emergency" : "text-success"
                }`} />
              </div>
            </div>
            
            <Progress value={Math.min(screenTimePercentage, 100)} className="h-3 mb-2" />
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {timeRemaining.toFixed(1)}h remaining
              </p>
              <span className={`text-sm font-bold ${
                screenTimePercentage > 80 ? "text-emergency" : "text-success"
              }`}>
                {Math.round(Math.min(screenTimePercentage, 100))}%
              </span>
            </div>

            {screenTimePercentage >= 100 && (
              <div className="mt-4 p-3 bg-emergency/10 rounded-lg border border-emergency/30">
                <p className="text-sm text-emergency font-semibold">
                  Screen time limit reached! Please take a break.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Blocked Apps */}
        {blockedApps.filter(app => app.is_blocked).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Blocked Apps</h3>
            <div className="space-y-2">
              {blockedApps.filter(app => app.is_blocked).map((app) => (
                <Card key={app.id} className="p-4 border-2 border-emergency/30 bg-emergency/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emergency/10">
                      <Lock className="w-5 h-5 text-emergency" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{app.app_name}</p>
                      <p className="text-xs text-muted-foreground">
                        This app is currently blocked by your parent
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* App Usage Today */}
        {appUsage.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">App Usage Today</h3>
            <div className="space-y-3">
              {appUsage.map((app) => (
                <Card key={app.id} className="p-4 border-2 border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{app.app_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Opened {app.times_opened} times
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{app.duration_minutes}m</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">My Schedule</h3>
          <div className="space-y-3">
            {controls?.school_mode_enabled && (
              <Card className="p-4 border-2 border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Smartphone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">School Mode</p>
                    <p className="text-sm text-muted-foreground">
                      {controls.school_mode_start} - {controls.school_mode_end}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {controls?.bedtime_mode_enabled && (
              <Card className="p-4 border-2 border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <ZapOff className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Bedtime Mode</p>
                    <p className="text-sm text-muted-foreground">
                      {controls.bedtime_start} - {controls.bedtime_end}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {!controls?.school_mode_enabled && !controls?.bedtime_mode_enabled && (
              <Card className="p-6 text-center border-2 border-dashed border-border">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No schedules set by your parent
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ChildControls;
