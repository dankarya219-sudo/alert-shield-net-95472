import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface FamilyConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const FamilyConnectionDialog = ({ open, onOpenChange, onSuccess }: FamilyConnectionDialogProps) => {
  const [mode, setMode] = useState<"generate" | "enter">("generate");
  const [connectionCode, setConnectionCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateConnectionCode = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Generate a 6-character code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { error } = await supabase.from("family_connections").insert({
        parent_id: user.id,
        connection_code: code,
        status: "pending",
      });

      if (error) throw error;

      setGeneratedCode(code);
      toast({
        title: "Connection code generated",
        description: `Share code ${code} with your child`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectWithCode = async () => {
    if (!user || !connectionCode) return;

    setLoading(true);
    try {
      // Find pending connection with this code
      const { data: connection, error: fetchError } = await supabase
        .from("family_connections")
        .select("*")
        .eq("connection_code", connectionCode.toUpperCase())
        .eq("status", "pending")
        .single();

      if (fetchError) throw new Error("Invalid or expired connection code");

      // Update connection with child ID and activate
      const { error: updateError } = await supabase
        .from("family_connections")
        .update({
          child_id: user.id,
          status: "active",
        })
        .eq("id", connection.id);

      if (updateError) throw updateError;

      toast({
        title: "Connected!",
        description: "You are now connected with your parent",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Family Connection</DialogTitle>
          <DialogDescription>
            Parents can generate a code, children can enter it to connect
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={mode === "generate" ? "default" : "outline"}
              onClick={() => setMode("generate")}
              className="flex-1"
            >
              Generate Code
            </Button>
            <Button
              variant={mode === "enter" ? "default" : "outline"}
              onClick={() => setMode("enter")}
              className="flex-1"
            >
              Enter Code
            </Button>
          </div>

          {mode === "generate" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a connection code to share with your child
              </p>
              {generatedCode ? (
                <div className="p-4 bg-accent/10 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">Your connection code:</p>
                  <p className="text-3xl font-bold text-accent tracking-wider">{generatedCode}</p>
                </div>
              ) : (
                <Button onClick={generateConnectionCode} disabled={loading} className="w-full">
                  {loading ? "Generating..." : "Generate Code"}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Connection Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-character code"
                  value={connectionCode}
                  onChange={(e) => setConnectionCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <Button
                onClick={connectWithCode}
                disabled={loading || connectionCode.length !== 6}
                className="w-full"
              >
                {loading ? "Connecting..." : "Connect"}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
