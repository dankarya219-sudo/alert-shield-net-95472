import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { User, Bell, Shield, MapPin, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/auth");
  };

  const settingsGroups = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile", description: "Edit your information" },
        { icon: Bell, label: "Notifications", description: "Manage alerts & sounds" },
      ]
    },
    {
      title: "Safety",
      items: [
        { icon: Shield, label: "Emergency Contacts", description: "Add trusted contacts" },
        { icon: MapPin, label: "Location Settings", description: "Control sharing preferences" },
      ]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help & Support", description: "Get help or report issues" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        title="Settings"
        onMenuClick={() => {}}
        onNotificationsClick={() => {}}
      />
      
      <main className="max-w-screen-sm mx-auto px-4 py-6">
        {/* User Profile */}
        <div className="mb-6 p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-xl">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-foreground text-lg">
                {profile?.full_name || "User"}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-success mt-1">Premium Member</p>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {settingsGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{group.title}</h3>
              <div className="space-y-2">
                {group.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => toast({ title: item.label, description: "Feature coming soon" })}
                    className="w-full p-4 bg-card rounded-xl border border-border hover:border-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <item.icon className="w-5 h-5 text-accent" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* App Info */}
        <div className="mt-8 p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">App Version</span>
            <span className="text-sm text-foreground font-mono">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Build</span>
            <span className="text-sm text-foreground font-mono">MVP-001</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 p-4 bg-card rounded-xl border border-emergency/30 hover:bg-emergency/10 transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5 text-emergency" />
            <span className="font-semibold text-emergency">Logout</span>
          </div>
        </button>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            SafeGuard Nigeria © 2025
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Protecting communities together
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
