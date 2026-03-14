import React from "react";
import { Home, Compass, Cpu, User } from "lucide-react";

interface NavIconProps {
  icon: React.ReactElement;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavIcon({ icon, label, active, onClick }: NavIconProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors duration-300 ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {React.cloneElement(icon, {
        size: 22,
        strokeWidth: active ? 2.5 : 2,
      })}
      <span className="text-[10px] font-bold uppercase tracking-tight">
        {label}
      </span>
    </button>
  );
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border px-8 pb-8 pt-4 flex justify-between items-center z-40">
      <NavIcon active={activeTab === "home"} onClick={() => onTabChange("home")} icon={<Home />} label="Home" />
      <NavIcon active={activeTab === "explore"} onClick={() => onTabChange("explore")} icon={<Compass />} label="Explore" />
      <NavIcon active={activeTab === "ai"} onClick={() => onTabChange("ai")} icon={<Cpu />} label="Mentor" />
      <NavIcon active={activeTab === "profile"} onClick={() => onTabChange("profile")} icon={<User />} label="Profile" />
    </nav>
  );
}
