import { useState } from "react";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EmergencyButtonProps {
  onEmergencyActivate: () => void;
}

export const EmergencyButton = ({ onEmergencyActivate }: EmergencyButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handlePressStart = () => {
    setIsPressed(true);
    const timer = setTimeout(() => {
      onEmergencyActivate();
      toast({
        title: "Emergency Mode Activated",
        description: "Alerting nearby users and authorities...",
        variant: "destructive",
      });
    }, 2000); // Hold for 2 seconds
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        className={`relative w-48 h-48 rounded-full transition-all duration-200 ${
          isPressed
            ? "bg-emergency scale-95 shadow-2xl shadow-emergency/50"
            : "bg-emergency/90 hover:bg-emergency shadow-xl"
        }`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isPressed ? (
            <AlertTriangle className="w-20 h-20 text-emergency-foreground animate-pulse" />
          ) : (
            <Shield className="w-20 h-20 text-emergency-foreground" />
          )}
          <span className="text-emergency-foreground font-bold text-lg mt-2">
            {isPressed ? "HOLD..." : "SOS"}
          </span>
        </div>
        {isPressed && (
          <div className="absolute inset-0 rounded-full border-4 border-emergency-foreground/30 animate-ping" />
        )}
      </button>
      <p className="text-muted-foreground text-sm text-center max-w-xs">
        Press and hold for 2 seconds to activate emergency mode
      </p>
    </div>
  );
};
