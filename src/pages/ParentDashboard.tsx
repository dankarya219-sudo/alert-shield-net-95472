import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import {
  Clock, 
  Smartphone, 
  Lock, 
  MapPin, 
  Activity, 
  AlertCircle,
  Instagram,
  MessageSquare,
  Youtube,
  ChevronRight,
  Shield,
  Trash2,
  ZapOff
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useParentalControls } from "@/hooks/useParentalControls";
import { useScreenTime } from "@/hooks/useScreenTime";

const ParentDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedChild = children[selectedChildIndex];
  const { controls, blockedApps, appUsage, toggleAppBlock, updateControls } = useParentalControls(
    user?.id,
    selectedChild?.id
  );
  const { todayUsage } = useScreenTime(selectedChild?.id);

  // Demo data for demonstration
  const demoAppUsage = [
    { id: '1', app_name: 'Instagram', package_name: 'com.instagram.android', duration_minutes: 45, times_opened: 12 },
    { id: '2', app_name: 'WhatsApp', package_name: 'com.whatsapp', duration_minutes: 60, times_opened: 25 },
    { id: '3', app_name: 'YouTube', package_name: 'com.google.android.youtube', duration_minutes: 80, times_opened: 8 },
  ];

  const demoBlockedApps = [
    { id: '1', package_name: 'com.zhiliaoapp.musically', app_name: 'TikTok', is_blocked: true },
  ];

  const demoControls = {
    screen_time_limit: 300,
    school_mode_enabled: true,
    bedtime_mode_enabled: true,
    school_mode_start: '08:00',
    school_mode_end: '15:00',
    bedtime_start: '21:00',
    bedtime_end: '06:00',
  };

  const demoTodayUsage = 180; // 3 hours

  // Use demo data if no real data
  const displayAppUsage = (appUsage && appUsage.length > 0) ? appUsage : demoAppUsage;
  const displayBlockedApps = (blockedApps && blockedApps.length > 0) ? blockedApps : demoBlockedApps;
  const displayControls = controls || demoControls;
  const displayTodayUsage = todayUsage || demoTodayUsage;

  // Fetch children connected to this parent
  useEffect(() => {
    const fetchChildren = async () => {
      if (!user?.id) return;

      const { data: connections } = await supabase
        .from("family_connections")
        .select(`
          child_id,
          profiles!family_connections_child_id_fkey (
            id,
            full_name,
            phone_number
          )
        `)
        .eq("parent_id", user.id)
        .eq("status", "active");

      if (connections && connections.length > 0) {
        const childrenData = await Promise.all(
          connections.map(async (conn: any) => {
            // Get latest location
            const { data: location } = await supabase
              .from("user_locations")
              .select("*")
              .eq("user_id", conn.child_id)
              .order("timestamp", { ascending: false })
              .limit(1)
              .maybeSingle();

            return {
              id: conn.child_id,
              name: conn.profiles?.full_name || "Unknown",
              avatar: conn.profiles?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "??",
              location: location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Unknown",
              battery: location?.battery_level || 0,
              status: "safe",
            };
          })
        );
        setChildren(childrenData);
      } else {
        // Use demo data if no real connections
        const demoChildren = [
          {
            id: 'demo-1',
            name: 'Aisha Ibrahim (Demo)',
            avatar: 'AI',
            location: 'Kano State Secondary School',
            battery: 85,
            status: 'safe',
          },
          {
            id: 'demo-2',
            name: 'Yusuf Ibrahim (Demo)',
            avatar: 'YI',
            location: 'Home',
            battery: 92,
            status: 'safe',
          },
          {
            id: 'demo-3',
            name: 'Fatima Musa (Demo)',
            avatar: 'FM',
            location: 'Grandma House',
            battery: 78,
            status: 'safe',
          },
        ];
        setChildren(demoChildren);
      }
      setLoading(false);
    };

    fetchChildren();
  }, [user?.id]);

  const screenTimeLimit = displayControls?.screen_time_limit || 300;
  const screenTimeUsed = displayTodayUsage / 60; // Convert minutes to hours
  const screenTimePercentage = (displayTodayUsage / screenTimeLimit) * 100;

  const handleLockDevice = () => {
    toast({
      title: "Device Lock Requested",
      description: `Lock request sent to ${selectedChild?.name}'s device`,
      variant: "destructive",
    });
  };

  const handleLocateChild = () => {
    toast({
      title: "Locating...",
      description: `Opening ${selectedChild?.name}'s location on map`,
    });
  };

  const handleWipeData = () => {
    toast({
      title: "Data Wipe Initiated",
      description: "This action cannot be undone",
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader
          title="Parent Dashboard"
          onMenuClick={() => {}}
          onNotificationsClick={() => {}}
        />
        <div className="max-w-screen-sm mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">No children connected. Go to Family page to add connections.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        title="Parent Dashboard"
        onMenuClick={() => {}}
        onNotificationsClick={() => {}}
      />
      
      <main className="max-w-screen-sm mx-auto px-4 py-6">
        {/* Demo Mode Banner */}
        {children.length > 0 && children[0]?.name.includes('Demo') && (
          <div className="mb-4 p-4 bg-accent/10 rounded-xl border border-accent/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-accent mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-accent text-sm">Demo Mode Active</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Showing demo children with sample data. Go to Family page to connect real accounts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Child Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {children.map((c, index) => (
            <button
              key={c.id}
              onClick={() => setSelectedChildIndex(index)}
              className={`flex-shrink-0 p-3 rounded-xl border-2 transition-all ${
                selectedChildIndex === index
                  ? "border-accent bg-accent/10"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedChildIndex === index ? "bg-accent" : "bg-muted"
                }`}>
                  <span className={`text-sm font-bold ${
                    selectedChildIndex === index ? "text-accent-foreground" : "text-foreground"
                  }`}>
                    {c.avatar}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm">{c.name.split(' ')[0]}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 border-2 border-success/30 bg-success/10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Status</span>
            </div>
            <p className="text-lg font-bold text-success capitalize">{selectedChild?.status}</p>
          </Card>

          <Card className="p-4 border-2 border-border">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Location</span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{selectedChild?.location}</p>
          </Card>

          <Card className="p-4 border-2 border-border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Screen Time</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {screenTimeUsed.toFixed(1)}h / {(screenTimeLimit / 60).toFixed(1)}h
            </p>
          </Card>

          <Card className="p-4 border-2 border-border">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Battery</span>
            </div>
            <p className="text-lg font-bold text-foreground">{selectedChild?.battery}%</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleLocateChild}
              className="p-4 bg-card rounded-xl border border-border hover:border-accent transition-colors"
            >
              <MapPin className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">Locate</p>
            </button>
            
            <button
              onClick={handleLockDevice}
              className="p-4 bg-card rounded-xl border border-warning/30 hover:border-warning transition-colors"
            >
              <Lock className="w-6 h-6 text-warning mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">Lock</p>
            </button>
            
            <button
              onClick={handleWipeData}
              className="p-4 bg-card rounded-xl border border-emergency/30 hover:border-emergency transition-colors"
            >
              <Trash2 className="w-6 h-6 text-emergency mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">Wipe</p>
            </button>
          </div>
        </div>

        {/* Screen Time Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Screen Time Today</h3>
            <span className={`text-sm font-bold ${
              screenTimePercentage > 80 ? "text-emergency" : "text-success"
            }`}>
              {Math.round(screenTimePercentage)}%
            </span>
          </div>
          <Progress value={screenTimePercentage} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">
            {((screenTimeLimit - displayTodayUsage) / 60).toFixed(1)} hours remaining
          </p>
        </div>

        {/* App Usage */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">App Usage</h3>
          <div className="space-y-3">
            {displayAppUsage.length > 0 ? (
              displayAppUsage.map((app) => {
                const appIcons: Record<string, any> = {
                  instagram: Instagram,
                  tiktok: MessageSquare,
                  whatsapp: MessageSquare,
                  youtube: Youtube,
                };
                const Icon = appIcons[app.app_name.toLowerCase()] || Smartphone;
                const isBlocked = displayBlockedApps.some((blocked) => blocked.package_name === app.package_name && blocked.is_blocked);

                return (
                  <Card key={app.id} className="p-4 border-2 border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isBlocked ? "bg-emergency/10" : "bg-accent/10"
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isBlocked ? "text-emergency" : "text-accent"
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground capitalize">{app.app_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {app.duration_minutes}m used • Opened {app.times_opened} times
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={!isBlocked}
                        onCheckedChange={(checked) => {
                          if (toggleAppBlock) {
                            toggleAppBlock(app.app_name, app.package_name, !checked);
                          } else {
                            toast({
                              title: checked ? "Demo Mode" : "Demo Mode",
                              description: "This is demo data. Connect real children to manage apps.",
                            });
                          }
                        }}
                      />
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-6 text-center border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground">No app usage data available today</p>
              </Card>
            )}
          </div>
        </div>

        {/* Schedule & Restrictions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Schedule & Restrictions</h3>
          <div className="space-y-3">
            <Card className="p-4 border-2 border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-foreground">School Mode</span>
                </div>
                <Switch
                  checked={displayControls?.school_mode_enabled || false}
                  onCheckedChange={(checked) => {
                    if (updateControls) {
                      updateControls({ school_mode_enabled: checked });
                    } else {
                      toast({
                        title: "Demo Mode",
                        description: "This is demo data. Connect real children to manage settings.",
                      });
                    }
                  }}
                />
              </div>
              {displayControls?.school_mode_enabled && (
                <p className="text-xs text-muted-foreground">
                  {displayControls.school_mode_start || "08:00"} - {displayControls.school_mode_end || "15:00"}
                </p>
              )}
            </Card>

            <Card className="p-4 border-2 border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ZapOff className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-foreground">Bedtime Mode</span>
                </div>
                <Switch
                  checked={displayControls?.bedtime_mode_enabled || false}
                  onCheckedChange={(checked) => {
                    if (updateControls) {
                      updateControls({ bedtime_mode_enabled: checked });
                    } else {
                      toast({
                        title: "Demo Mode",
                        description: "This is demo data. Connect real children to manage settings.",
                      });
                    }
                  }}
                />
              </div>
              {displayControls?.bedtime_mode_enabled && (
                <p className="text-xs text-muted-foreground">
                  {displayControls.bedtime_start || "22:00"} - {displayControls.bedtime_end || "06:00"}
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Advanced Settings</h3>
          <div className="space-y-2">
            <button 
              className="w-full p-4 bg-card rounded-xl border border-border hover:border-accent transition-colors text-left"
              onClick={() => navigate("/safe-zones")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Geofencing</p>
                    <p className="text-xs text-muted-foreground">Manage safe zones & alerts</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>

            <button 
              className="w-full p-4 bg-card rounded-xl border border-border hover:border-accent transition-colors text-left"
              onClick={() => toast({ title: "Content Filters", description: "Web filtering settings" })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Content Filters</p>
                    <p className="text-xs text-muted-foreground">Block inappropriate content</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>

            <button 
              className="w-full p-4 bg-card rounded-xl border border-border hover:border-accent transition-colors text-left"
              onClick={() => toast({ title: "Activity Reports", description: "View detailed usage" })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Activity Reports</p>
                    <p className="text-xs text-muted-foreground">Weekly usage statistics</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          </div>
        </div>

        {/* Alert Banner */}
        {screenTimePercentage > 90 && (
          <div className="mt-6 p-4 bg-warning/10 rounded-xl border border-warning/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-semibold text-warning mb-1">Screen Time Alert</h3>
                <p className="text-sm text-foreground">
                  {selectedChild?.name} has used {Math.round(screenTimePercentage)}% of their daily screen time limit
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ParentDashboard;
