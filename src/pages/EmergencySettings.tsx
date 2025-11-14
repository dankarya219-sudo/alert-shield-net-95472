import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Smartphone } from "lucide-react";

const EmergencySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("emergency_gesture_enabled")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setGestureEnabled(data.emergency_gesture_enabled || false);
    }
  };

  const handleSavePassword = async () => {
    if (!user) return;

    if (!password) {
      toast({
        title: "Error",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ emergency_password: password })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Emergency password saved successfully",
      });

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error saving password:", error);
      toast({
        title: "Error",
        description: "Failed to save password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGesture = async (enabled: boolean) => {
    if (!user) return;

    // Check if password is set first
    const { data } = await supabase
      .from("profiles")
      .select("emergency_password")
      .eq("id", user.id)
      .single();

    if (!data?.emergency_password) {
      toast({
        title: "Password Required",
        description: "Please set an emergency password first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ emergency_gesture_enabled: enabled })
        .eq("id", user.id);

      if (error) throw error;

      setGestureEnabled(enabled);
      toast({
        title: enabled ? "Gesture Enabled" : "Gesture Disabled",
        description: enabled 
          ? "Shake your phone 3 times to trigger emergency mode"
          : "Gesture detection has been disabled",
      });
    } catch (error) {
      console.error("Error toggling gesture:", error);
      toast({
        title: "Error",
        description: "Failed to update gesture setting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        title="Emergency Settings"
        onMenuClick={() => {}}
        onNotificationsClick={() => {}}
      />

      <main className="max-w-screen-sm mx-auto px-4 py-6 space-y-6">
        {/* Emergency Password Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Emergency Password</CardTitle>
                <CardDescription>
                  Set a password to confirm you're safe during emergency alerts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSavePassword} 
              disabled={loading}
              className="w-full"
            >
              Save Password
            </Button>
          </CardContent>
        </Card>

        {/* Gesture Detection Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle>Gesture Detection</CardTitle>
                <CardDescription>
                  Automatically trigger emergency mode by shaking your phone
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="font-medium text-foreground">Enable Gesture</p>
                <p className="text-sm text-muted-foreground">Shake phone 3 times quickly</p>
              </div>
              <Switch
                checked={gestureEnabled}
                onCheckedChange={handleToggleGesture}
                disabled={loading}
              />
            </div>

            <div className="p-4 rounded-lg border border-warning/20 bg-warning/5">
              <h4 className="font-medium text-warning mb-2">How it works</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Shake your phone 3 times quickly</li>
                <li>A confirmation dialog will appear</li>
                <li>Enter your emergency password to confirm you're safe</li>
                <li>If no response in 2min 30sec, emergency mode activates automatically</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default EmergencySettings;
