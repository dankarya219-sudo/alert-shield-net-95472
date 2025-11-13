import { useState } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Phone, MessageSquare, Camera, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Emergency = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleEmergencyActivate = async () => {
    if (!user) return;

    setIsEmergencyActive(true);

    try {
      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Create emergency alert in database
            const { error } = await supabase.from("emergency_alerts").insert({
              user_id: user.id,
              alert_type: "sos",
              latitude,
              longitude,
              status: "active",
            });

            if (error) throw error;

            toast({
              title: "Emergency Mode Active",
              description: "Broadcasting to nearby users and family members...",
              variant: "destructive",
            });
          },
          (error) => {
            console.error("Location error:", error);
            toast({
              title: "Location Error",
              description: "Could not get your location. Emergency alert created without location.",
              variant: "destructive",
            });

            // Still create alert without location
            supabase.from("emergency_alerts").insert({
              user_id: user.id,
              alert_type: "sos",
              latitude: 0,
              longitude: 0,
              status: "active",
            });
          }
        );
      }
    } catch (error: any) {
      console.error("Emergency activation error:", error);
      toast({
        title: "Error",
        description: "Failed to activate emergency mode",
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;

    try {
      // Update all active alerts to resolved
      const { error } = await supabase
        .from("emergency_alerts")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) throw error;

      setIsEmergencyActive(false);
      toast({
        title: "Emergency Mode Deactivated",
        description: "Stay safe!",
      });
    } catch (error: any) {
      console.error("Deactivation error:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate emergency mode",
        variant: "destructive",
      });
    }
  };

  const emergencyContacts = [
    { name: "Police (Nigeria)", number: "112", icon: Phone },
    { name: "NSCDC", number: "112", icon: Phone },
    { name: "Emergency Services", number: "112", icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        title="Emergency"
        onMenuClick={() => {}}
        onNotificationsClick={() => {}}
      />
      
      <main className="max-w-screen-sm mx-auto px-4 py-6">
        {isEmergencyActive && (
          <div className="mb-6 p-4 bg-emergency/20 border-2 border-emergency rounded-xl animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-emergency text-lg">EMERGENCY MODE ACTIVE</p>
                <p className="text-sm text-foreground mt-1">Broadcasting your location...</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeactivate}
                className="border-emergency text-emergency hover:bg-emergency hover:text-emergency-foreground"
              >
                Deactivate
              </Button>
            </div>
          </div>
        )}

        {/* Emergency Button */}
        <div className="flex flex-col items-center justify-center mb-12">
          <EmergencyButton onEmergencyActivate={handleEmergencyActivate} />
        </div>

        {/* Emergency Features */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button className="p-4 bg-card rounded-xl border border-border hover:border-accent transition-colors">
            <Camera className="w-8 h-8 text-accent mb-2" />
            <p className="text-sm font-semibold text-foreground">Auto Capture</p>
            <p className="text-xs text-muted-foreground">Front & back camera</p>
          </button>
          
          <button className="p-4 bg-card rounded-xl border border-border hover:border-accent transition-colors">
            <Mic className="w-8 h-8 text-accent mb-2" />
            <p className="text-sm font-semibold text-foreground">Record Audio</p>
            <p className="text-xs text-muted-foreground">Evidence collection</p>
          </button>
          
          <button className="p-4 bg-card rounded-xl border border-border hover:border-accent transition-colors">
            <MessageSquare className="w-8 h-8 text-accent mb-2" />
            <p className="text-sm font-semibold text-foreground">Mesh Alert</p>
            <p className="text-xs text-muted-foreground">Notify nearby users</p>
          </button>
          
          <button className="p-4 bg-card rounded-xl border border-border hover:border-accent transition-colors">
            <Phone className="w-8 h-8 text-accent mb-2" />
            <p className="text-sm font-semibold text-foreground">Auto Call</p>
            <p className="text-xs text-muted-foreground">Contact authorities</p>
          </button>
        </div>

        {/* Emergency Contacts */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Emergency Contacts</h3>
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <button
                key={index}
                className="w-full p-4 bg-card rounded-xl border border-border text-left hover:border-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <contact.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.number}</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-success hover:bg-success/90">
                    Call
                  </Button>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Safety Info */}
        <div className="mt-8 p-4 bg-warning/10 rounded-xl border border-warning/30">
          <h3 className="font-semibold text-warning mb-2">Emergency Instructions</h3>
          <ul className="text-sm text-foreground space-y-1">
            <li>• Hold SOS button for 2 seconds to activate</li>
            <li>• Your location will be shared automatically</li>
            <li>• Nearby SafeGuard users will be notified</li>
            <li>• Camera and audio recording will start</li>
            <li>• Emergency services will be contacted</li>
          </ul>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Emergency;
