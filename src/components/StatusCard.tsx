import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatusCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  status: "safe" | "warning" | "danger";
  onClick?: () => void;
}

export const StatusCard = ({ icon: Icon, title, value, status, onClick }: StatusCardProps) => {
  const statusColors = {
    safe: "border-success/30 bg-success/10",
    warning: "border-warning/30 bg-warning/10",
    danger: "border-emergency/30 bg-emergency/10",
  };

  const textColors = {
    safe: "text-success",
    warning: "text-warning",
    danger: "text-emergency",
  };

  return (
    <Card
      className={`p-4 border-2 ${statusColors[status]} cursor-pointer hover:scale-105 transition-transform`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${statusColors[status]}`}>
          <Icon className={`w-5 h-5 ${textColors[status]}`} />
        </div>
        <div className="flex-1">
          <p className="text-muted-foreground text-xs mb-1">{title}</p>
          <p className={`text-lg font-bold ${textColors[status]}`}>{value}</p>
        </div>
      </div>
    </Card>
  );
};
