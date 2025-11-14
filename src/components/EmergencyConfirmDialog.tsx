import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface EmergencyConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  savedPassword: string | null;
}

export const EmergencyConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
  savedPassword,
}: EmergencyConfirmDialogProps) => {
  const [password, setPassword] = useState("");
  const [timeLeft, setTimeLeft] = useState(150); // 2 minutes 30 seconds
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      setTimeLeft(150);
      setError("");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onConfirm(); // Auto-trigger emergency
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, onConfirm]);

  const handleConfirmSafe = () => {
    if (!savedPassword) {
      onCancel();
      return;
    }

    if (password === savedPassword) {
      onCancel();
    } else {
      setError("Incorrect password. Try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
          <DialogTitle className="text-center text-xl">Are You Safe?</DialogTitle>
          <DialogDescription className="text-center">
            Emergency mode will be triggered automatically in{" "}
            <span className="font-bold text-warning text-lg">{formatTime(timeLeft)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Enter your emergency password to confirm you're safe
            </p>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full"
            />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onConfirm}
              className="flex-1"
            >
              Trigger Now
            </Button>
            <Button
              onClick={handleConfirmSafe}
              className="flex-1"
            >
              I'm Safe
            </Button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            If you don't respond, emergency mode will activate automatically and alert your contacts
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
