import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SafeZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    notify_on_entry: boolean;
    notify_on_exit: boolean;
  }) => void;
  initialData?: any;
  currentLocation?: { lat: number; lng: number };
}

export const SafeZoneDialog = ({
  open,
  onOpenChange,
  onSave,
  initialData,
  currentLocation,
}: SafeZoneDialogProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [latitude, setLatitude] = useState(
    initialData?.latitude || currentLocation?.lat || 0
  );
  const [longitude, setLongitude] = useState(
    initialData?.longitude || currentLocation?.lng || 0
  );
  const [radiusMeters, setRadiusMeters] = useState(
    initialData?.radius_meters || 200
  );
  const [notifyOnEntry, setNotifyOnEntry] = useState(
    initialData?.notify_on_entry ?? true
  );
  const [notifyOnExit, setNotifyOnExit] = useState(
    initialData?.notify_on_exit ?? true
  );

  const handleSave = () => {
    if (!name || !latitude || !longitude) return;

    onSave({
      name,
      latitude,
      longitude,
      radius_meters: radiusMeters,
      notify_on_entry: notifyOnEntry,
      notify_on_exit: notifyOnExit,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Safe Zone" : "Create Safe Zone"}
          </DialogTitle>
          <DialogDescription>
            Define a safe zone and get alerts when your child enters or leaves
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Zone Name</Label>
            <Input
              id="name"
              placeholder="e.g., Home, School, Grandma's House"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="radius">Radius (meters)</Label>
            <Input
              id="radius"
              type="number"
              min="50"
              max="5000"
              step="50"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(parseInt(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {radiusMeters}m radius (~{(radiusMeters / 1000).toFixed(1)}km)
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notify-entry">Notify on Entry</Label>
                <p className="text-xs text-muted-foreground">
                  Alert when child enters this zone
                </p>
              </div>
              <Switch
                id="notify-entry"
                checked={notifyOnEntry}
                onCheckedChange={setNotifyOnEntry}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notify-exit">Notify on Exit</Label>
                <p className="text-xs text-muted-foreground">
                  Alert when child leaves this zone
                </p>
              </div>
              <Switch
                id="notify-exit"
                checked={notifyOnExit}
                onCheckedChange={setNotifyOnExit}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || !latitude || !longitude}>
            {initialData ? "Update Zone" : "Create Zone"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
