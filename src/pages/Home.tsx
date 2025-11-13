import { useState } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { EmergencyButton } from "@/components/EmergencyButton";
import { StatusCard } from "@/components/StatusCard";
import { Shield, Users, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const [nearbyUsers, setNearbyUsers] = useState(12);
  const [safetyScore, setSafetyScore] = useState(85);
  const { toast } = useToast();

  const handleEmergencyActivate = () => {
    console.log("Emergency mode activated");
    // TODO: Implement emergency mode logic
    // - Start mesh network broadcast
    // - Begin location tracking
    // - Auto-call emergency services
    // - Capture photos/audio
  };

  const handleMenuClick = () => {
    toast({
      title: "Menu",
      description: "Menu functionality coming soon",
    });
  };

  const handleNotificationsClick = () => {
    toast({
      title: "Notifications",
      description: "You have 2 new safety alerts",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        title="SafeGuard Nigeria"
        onMenuClick={handleMenuClick}
        onNotificationsClick={handleNotificationsClick}
      />
      
      <main className="max-w-screen-sm mx-auto px-4 py-6">
        {/* User Status Section */}
        <div className="mb-8 p-4 bg-card rounded-2xl border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Welcome back</h2>
              <p className="text-sm text-muted-foreground">You're in a safe area</p>
            </div>
          </div>
          
          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatusCard
              icon={Users}
              title="Nearby Users"
              value={nearbyUsers}
              status="safe"
            />
            <StatusCard
              icon={Shield}
              title="Safety Score"
              value={`${safetyScore}%`}
              status="safe"
            />
            <StatusCard
              icon={MapPin}
              title="Location"
              value="Active"
              status="safe"
            />
            <StatusCard
              icon={Clock}
              title="Last Update"
              value="Just now"
              status="safe"
            />
          </div>
        </div>

        {/* Emergency Button */}
        <div className="flex flex-col items-center justify-center my-12">
          <EmergencyButton onEmergencyActivate={handleEmergencyActivate} />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Actions</h3>
          <button className="w-full p-4 bg-card rounded-xl border border-border text-left hover:border-accent transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">View Danger Zones</p>
                <p className="text-sm text-muted-foreground">See unsafe areas near you</p>
              </div>
              <MapPin className="w-5 h-5 text-warning" />
            </div>
          </button>
          
          <button className="w-full p-4 bg-card rounded-xl border border-border text-left hover:border-accent transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Share Location</p>
                <p className="text-sm text-muted-foreground">Let family know where you are</p>
              </div>
              <Users className="w-5 h-5 text-accent" />
            </div>
          </button>
        </div>

        {/* Safety Tips */}
        <div className="mt-8 p-4 bg-accent/10 rounded-xl border border-accent/30">
          <h3 className="font-semibold text-accent mb-2">Safety Tip</h3>
          <p className="text-sm text-foreground">
            Always enable location services for faster emergency response. Your location is only shared when you activate emergency mode.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
