import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { MapPin, AlertTriangle, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { ReportDangerZone } from "@/components/ReportDangerZone";
import { useAuth } from "@/hooks/useAuth";
import { useSafeZones } from "@/hooks/useSafeZones";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Fix for default marker icons in Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const safeZoneCirclesRef = useRef<L.Circle[]>([]);
  const [dangerZones, setDangerZones] = useState<any[]>([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [trackingLocation, setTrackingLocation] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  const selectedChild = children[selectedChildIndex];
  const { safeZones } = useSafeZones(user?.id, selectedChild?.id);

  const handleMenuClick = () => {
    toast({
      title: "Menu",
      description: "Menu functionality coming soon",
    });
  };

  const handleNotificationsClick = () => {
    navigate("/safe-zones");
  };

  // Fetch children
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

      if (connections) {
        const childrenData = connections.map((conn: any) => ({
          id: conn.child_id,
          name: conn.profiles?.full_name || "Unknown",
        }));
        setChildren(childrenData);
      }
    };

    fetchChildren();
  }, [user?.id]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map centered on Kano, Nigeria
    const map = L.map(mapContainerRef.current).setView([12.0022, 8.5919], 11);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add click handler for reporting
    map.on("click", (e) => {
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login to report danger zones",
        });
        navigate("/auth");
        return;
      }
      setSelectedLocation(e.latlng);
      setReportDialogOpen(true);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [user, toast, navigate]);

  // Fetch danger zones
  useEffect(() => {
    const fetchDangerZones = async () => {
      const { data, error } = await supabase
        .from("danger_zones")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching danger zones:", error);
        return;
      }

      setDangerZones(data || []);
    };

    fetchDangerZones();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("danger-zones-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "danger_zones",
        },
        () => {
          fetchDangerZones();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!mapRef.current || dangerZones.length === 0) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add markers for each danger zone
    dangerZones.forEach((zone) => {
      if (!mapRef.current) return;

      const severityColors: Record<string, string> = {
        low: "#22c55e",
        medium: "#eab308",
        high: "#ef4444",
      };

      const color = severityColors[zone.severity] || "#eab308";

      const marker = L.circleMarker([zone.latitude, zone.longitude], {
        radius: 8,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapRef.current);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <strong>${zone.incident_type}</strong><br/>
          <span style="color: ${color}; text-transform: capitalize;">${zone.severity} severity</span><br/>
          ${zone.description || "No description"}<br/>
          <small>${new Date(zone.created_at).toLocaleDateString()}</small>
        </div>
      `);
    });
  }, [dangerZones]);

  // Display safe zones on map
  useEffect(() => {
    if (!mapRef.current || !safeZones) return;

    // Remove existing safe zone circles
    safeZoneCirclesRef.current.forEach((circle) => {
      mapRef.current?.removeLayer(circle);
    });
    safeZoneCirclesRef.current = [];

    // Add new safe zone circles
    safeZones.forEach((zone) => {
      if (!mapRef.current || !zone.is_active) return;

      const circle = L.circle([zone.latitude, zone.longitude], {
        radius: zone.radius_meters,
        fillColor: "#3b82f6",
        color: "#3b82f6",
        weight: 2,
        opacity: 0.6,
        fillOpacity: 0.2,
      }).addTo(mapRef.current);

      circle.bindPopup(`
        <div style="min-width: 200px;">
          <strong>🛡️ ${zone.name}</strong><br/>
          Safe Zone - ${zone.radius_meters}m radius<br/>
          <small>Entry alerts: ${zone.notify_on_entry ? "✅" : "❌"}</small><br/>
          <small>Exit alerts: ${zone.notify_on_exit ? "✅" : "❌"}</small>
        </div>
      `);

      safeZoneCirclesRef.current.push(circle);
    });
  }, [safeZones]);

  // Location tracking
  const startLocationTracking = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to use location tracking",
      });
      navigate("/auth");
      return;
    }

    if (!navigator.geolocation) {
      toast({
        title: "Not supported",
        description: "Location tracking is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setTrackingLocation(true);

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Update user marker on map
        if (mapRef.current) {
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const userIcon = L.divIcon({
              html: `<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });

            userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
              .addTo(mapRef.current)
              .bindPopup("Your location");
          }

          mapRef.current.setView([latitude, longitude], 13);
        }

        // Store location in database
        try {
          const { error } = await supabase.from("user_locations").insert({
            user_id: user.id,
            latitude,
            longitude,
            accuracy,
            battery_level: (navigator as any).getBattery?.().then((b: any) => Math.round(b.level * 100)),
          });

          if (error) throw error;

          // Check geofences
          await supabase.functions.invoke("check-geofence", {
            body: { latitude, longitude },
          });
        } catch (error) {
          console.error("Error storing location:", error);
        }
      },
      (error) => {
        toast({
          title: "Location error",
          description: error.message,
          variant: "destructive",
        });
        setTrackingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setTrackingLocation(false);
    };
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        title="Danger Zones"
        onMenuClick={handleMenuClick}
        onNotificationsClick={handleNotificationsClick}
      />
      
      <main className="max-w-screen-sm mx-auto px-4 py-6">
        {/* Safe Zones Info */}
        {children.length > 0 && safeZones && safeZones.length > 0 && (
          <div className="mb-4 p-4 bg-accent/10 rounded-xl border border-accent/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                <span className="font-semibold text-foreground">
                  {safeZones.length} Safe Zone{safeZones.length !== 1 ? "s" : ""} Active
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/safe-zones")}
              >
                Manage
              </Button>
            </div>
          </div>
        )}

        {/* Location Tracking Button */}
        <div className="mb-4">
          <Button
            onClick={startLocationTracking}
            disabled={trackingLocation}
            variant={trackingLocation ? "secondary" : "default"}
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {trackingLocation ? "Tracking Location..." : "Start Location Tracking"}
          </Button>
        </div>

        {/* Map Container */}
        <div 
          ref={mapContainerRef}
          className="relative h-96 bg-card rounded-2xl border border-border overflow-hidden mb-6"
          style={{ zIndex: 0 }}
        />

        {/* Legend */}
        <div className="bg-card p-4 rounded-xl border border-border mb-6">
          <h3 className="font-semibold text-foreground mb-3">Safety Zones</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-success" />
              <span className="text-sm text-foreground">Safe Zone (0-2 incidents)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-warning" />
              <span className="text-sm text-foreground">Caution Zone (3-5 incidents)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emergency" />
              <span className="text-sm text-foreground">Danger Zone (6+ incidents)</span>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Recent Reports</h3>
          <div className="space-y-3">
            <div className="p-4 bg-card rounded-xl border border-emergency/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-emergency mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Phone theft reported</p>
                  <p className="text-sm text-muted-foreground">Sabon Gari, Kano • 2 hours ago</p>
                  <p className="text-xs text-muted-foreground mt-1">5 similar incidents this week</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-card rounded-xl border border-warning/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Suspicious activity</p>
                  <p className="text-sm text-muted-foreground">Nassarawa, Kano • 5 hours ago</p>
                  <p className="text-xs text-muted-foreground mt-1">2 similar incidents this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />

      {selectedLocation && (
        <ReportDangerZone
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          latitude={selectedLocation.lat}
          longitude={selectedLocation.lng}
        />
      )}
    </div>
  );
};

export default Map;
