import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  title: string;
  onMenuClick?: () => void;
  onNotificationsClick?: () => void;
}

export const MobileHeader = ({ title, onMenuClick, onNotificationsClick }: MobileHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border safe-area-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-screen-sm mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-foreground"
        >
          <Menu className="w-6 h-6" />
        </Button>
        
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onNotificationsClick}
          className="text-foreground relative"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-emergency rounded-full" />
        </Button>
      </div>
    </header>
  );
};
