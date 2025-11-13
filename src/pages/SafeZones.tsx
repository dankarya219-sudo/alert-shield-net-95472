import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Navigation,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSafeZones } from "@/hooks/useSafeZones";
import { SafeZoneDialog } from "@/components/SafeZoneDialog";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SafeZones = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);

  const selectedChild = children[selectedChildIndex];
  const { safeZones, alerts, loading, createSafeZone, deleteSafeZone, markAlertAsRead } =
    useSafeZones(user?.id, selectedChild?.id);

  // Demo safe zones
  const demoSafeZones = [
    {
      id: 'demo-zone-1',
      name: 'Home',
      latitude: 12.0022,
      longitude: 8.5919,
      radius_meters: 150,
      is_active: true,
      notify_on_entry: true,
      notify_on_exit: true,
    },
    {
      id: 'demo-zone-2',
      name: 'School',
      latitude: 11.9945,
      longitude: 8.5831,
      radius_meters: 200,
      is_active: true,
      notify_on_entry: true,
      notify_on_exit: true,
    },
    {
      id: 'demo-zone-3',
      name: 'Grandma House',
      latitude: 12.0156,
      longitude: 8.6023,
      radius_meters: 100,
      is_active: true,
      notify_on_entry: true,
      notify_on_exit: false,
    },
  ];

  // Use demo data if no real safe zones
  const displaySafeZones = (safeZones && safeZones.length > 0) ? safeZones : demoSafeZones;
  const displayAlerts = alerts || [];

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
            full_name
          )
        `)
        .eq("parent_id", user.id)
        .eq("status", "active");

      if (connections && connections.length > 0) {
        const childrenData = connections.map((conn: any) => ({
          id: conn.child_id,
          name: conn.profiles?.full_name || "Unknown",
          avatar: conn.profiles?.full_name
            ?.split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase() || "??",
        }));
        setChildren(childrenData);
      } else {
        // Use demo data if no real connections
        const demoChildren = [
          {
            id: 'demo-1',
            name: 'Aisha Ibrahim (Demo)',
            avatar: 'AI',
          },
          {
            id: 'demo-2',
            name: 'Yusuf Ibrahim (Demo)',
            avatar: 'YI',
          },
          {
            id: 'demo-3',
            name: 'Fatima Musa (Demo)',
            avatar: 'FM',
          },
        ];
        setChildren(demoChildren);
      }
    };

    fetchChildren();
  }, [user?.id]);

  const handleDeleteZone = async () => {
    if (!zoneToDelete) return;
    await deleteSafeZone(zoneToDelete);
    setDeleteDialogOpen(false);
    setZoneToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading safe zones...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader
          title="Safe Zones"
          onMenuClick={() => {}}
          onNotificationsClick={() => {}}
        />
        <div className="max-w-screen-sm mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">
            No children connected. Go to Family page to add connections.
          </p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        title="Safe Zones"
        onMenuClick={() => {}}
        onNotificationsClick={() => {}}
      />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        {/* Demo Mode Banner */}
        {children.length > 0 && children[0]?.name.includes('Demo') && (
          <div className="mb-4 p-4 bg-accent/10 rounded-xl border border-accent/30">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-accent mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-accent text-sm">Demo Mode Active</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Showing demo children with sample safe zones. Go to Family page to connect real accounts.
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
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedChildIndex === index ? "bg-accent" : "bg-muted"
                  }`}
                >
                  <span
                    className={`text-sm font-bold ${
                      selectedChildIndex === index
                        ? "text-accent-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {c.avatar}
                  </span>
                </div>
                <p className="font-semibold text-foreground text-sm">
                  {c.name.split(" ")[0]}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Alerts */}
        {displayAlerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Recent Alerts
            </h3>
            <div className="space-y-2">
              {displayAlerts.slice(0, 3).map((alert) => (
                <Card
                  key={alert.id}
                  className={`p-4 border-2 cursor-pointer ${
                    alert.event_type === "exit"
                      ? "border-warning/30 bg-warning/5"
                      : "border-success/30 bg-success/5"
                  }`}
                  onClick={() => markAlertAsRead(alert.id)}
                >
                  <div className="flex items-start gap-3">
                    {alert.event_type === "exit" ? (
                      <XCircle className="w-5 h-5 text-warning mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Create Zone Button */}
        <Button
          onClick={() => setDialogOpen(true)}
          className="w-full mb-6"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Safe Zone
        </Button>

        {/* Safe Zones List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Active Safe Zones ({displaySafeZones.length})
          </h3>

          {displaySafeZones.length === 0 ? (
            <Card className="p-8 text-center border-2 border-dashed border-border">
              <Navigation className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                No safe zones created yet
              </p>
              <p className="text-xs text-muted-foreground">
                Create a safe zone to get notified when {selectedChild?.name}{" "}
                enters or leaves important locations
              </p>
            </Card>
          ) : (
            displaySafeZones.map((zone) => (
              <Card key={zone.id} className="p-4 border-2 border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{zone.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Radius: {zone.radius_meters}m
                      </p>
                    </div>
                  </div>
                  <Badge variant={zone.is_active ? "default" : "secondary"}>
                    {zone.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {zone.notify_on_entry && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Entry Alerts
                    </Badge>
                  )}
                  {zone.notify_on_exit && (
                    <Badge variant="outline" className="text-xs">
                      <XCircle className="w-3 h-3 mr-1" />
                      Exit Alerts
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setZoneToDelete(zone.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <SafeZoneDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={createSafeZone}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Safe Zone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this safe zone? This action cannot be
              undone and you will no longer receive alerts for this location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteZone}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default SafeZones;
