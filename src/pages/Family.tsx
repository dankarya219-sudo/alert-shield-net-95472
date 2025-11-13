import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Users, MapPin, Shield, Clock, Plus, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FamilyConnectionDialog } from "@/components/FamilyConnectionDialog";

const Family = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Demo members data
  const demoMembers = [
    {
      id: 'demo-1',
      profiles: {
        full_name: 'Aisha Ibrahim (Demo)',
        phone_number: '+234 803 456 7890'
      },
      parent_id: user?.id,
      child_id: 'demo-child-1',
      status: 'active',
      isDemo: true,
    },
    {
      id: 'demo-2',
      profiles: {
        full_name: 'Yusuf Ibrahim (Demo)',
        phone_number: '+234 805 123 4567'
      },
      parent_id: user?.id,
      child_id: 'demo-child-2',
      status: 'active',
      isDemo: true,
    },
    {
      id: 'demo-3',
      profiles: {
        full_name: 'Fatima Musa (Demo)',
        phone_number: '+234 807 987 6543'
      },
      parent_id: user?.id,
      child_id: 'demo-child-3',
      status: 'active',
      isDemo: true,
    },
  ];

  const fetchConnections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("family_connections")
        .select("*, profiles!family_connections_child_id_fkey(full_name, phone_number)")
        .or(`parent_id.eq.${user.id},child_id.eq.${user.id}`)
        .eq("status", "active");

      if (error) throw error;
      
      // Use demo data if no real connections exist
      if (!data || data.length === 0) {
        setConnections(demoMembers);
      } else {
        setConnections(data || []);
      }
    } catch (error: any) {
      console.error("Error fetching connections:", error);
      // On error, show demo data
      setConnections(demoMembers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("family-connections-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "family_connections",
        },
        () => {
          fetchConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        title="Family Safety"
        onMenuClick={() => {}}
        onNotificationsClick={() => {}}
      />
      
      <main className="max-w-screen-sm mx-auto px-4 py-6">
        {/* Demo Mode Banner */}
        {connections.length > 0 && connections[0]?.isDemo && (
          <div className="mb-4 p-4 bg-accent/10 rounded-xl border border-accent/30">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-accent mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-accent text-sm">Demo Mode Active</p>
                <p className="text-xs text-muted-foreground mt-1">
                  These are sample family members for demonstration. Click "Add Member" to connect real accounts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            className="bg-accent hover:bg-accent/90"
            onClick={() => setConnectionDialogOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Member
          </Button>
          <Button 
            variant="outline"
            className="border-accent text-accent hover:bg-accent/10"
            onClick={() => navigate("/parent-dashboard")}
          >
            <SettingsIcon className="w-5 h-5 mr-2" />
            Parent Controls
          </Button>
        </div>

        {/* Family Members */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading family members...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => {
              const isParent = connection.parent_id === user?.id;
              const memberName = connection.profiles?.full_name || "Family Member";
              const isDemo = connection.isDemo;
              
              return (
                <div key={connection.id} className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                        <Users className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{memberName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {isParent ? "Child" : "Parent"} {isDemo && "(Demo)"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-success" />
                      <span className="text-sm font-semibold text-success">Safe</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Location shared</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Active</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => navigate("/map")}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    View on Map
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Parental Controls Info */}
        <div className="mt-6 p-4 bg-accent/10 rounded-xl border border-accent/30">
          <h3 className="font-semibold text-accent mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Parental Controls
          </h3>
          <ul className="text-sm text-foreground space-y-1">
            <li>• Track real-time location</li>
            <li>• Set safe zones with alerts</li>
            <li>• Control screen time & apps</li>
            <li>• Block social media during school</li>
            <li>• Remote lock & data wipe</li>
          </ul>
        </div>

        {/* Safe Zones */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Safe Zones</h3>
          <div className="space-y-2">
            <div className="p-3 bg-card rounded-lg border border-success/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">Home</p>
                  <p className="text-xs text-muted-foreground">Nassarawa GRA, Kano</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-success" />
              </div>
            </div>
            <div className="p-3 bg-card rounded-lg border border-success/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">School</p>
                  <p className="text-xs text-muted-foreground">Kano State Secondary School</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-success" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
      
      <FamilyConnectionDialog
        open={connectionDialogOpen}
        onOpenChange={setConnectionDialogOpen}
        onSuccess={fetchConnections}
      />
    </div>
  );
};

export default Family;
