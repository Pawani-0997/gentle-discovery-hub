import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_value: number;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export interface ChecklistItem {
  id: string;
  item_key: string;
  item_label: string;
  completed: boolean;
}

const CHECKLIST_DEFAULTS = [
  { item_key: "watch_tutorial", item_label: "Watch first tutorial" },
  { item_key: "post_project", item_label: "Post first project" },
];

export function useProgress() {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  // XP: each badge = 100, each checklist item = 50, base = 0
  const xp = earnedBadges.length * 100 + checklist.filter((c) => c.completed).length * 50;
  const level = Math.floor(xp / 200) + 1;
  const xpInLevel = xp % 200;
  const xpToNext = 200;

  const fetchData = useCallback(async () => {
    if (!user) return;

    const [badgesRes, earnedRes, checklistRes] = await Promise.all([
      supabase.from("badges").select("*"),
      supabase.from("user_badges").select("*").eq("user_id", user.id),
      supabase.from("hobby_checklist").select("*").eq("user_id", user.id),
    ]);

    const badges = (badgesRes.data || []) as Badge[];
    setAllBadges(badges);

    const earned = (earnedRes.data || []).map((ub: any) => ({
      ...ub,
      badge: badges.find((b) => b.id === ub.badge_id)!,
    })).filter((ub: any) => ub.badge);
    setEarnedBadges(earned);

    let checkItems = (checklistRes.data || []) as ChecklistItem[];
    if (checkItems.length === 0) {
      // Seed defaults
      const inserts = CHECKLIST_DEFAULTS.map((d) => ({
        user_id: user.id,
        ...d,
        completed: false,
      }));
      const { data: inserted } = await supabase.from("hobby_checklist").insert(inserts).select();
      checkItems = (inserted || []) as ChecklistItem[];
    }
    setChecklist(checkItems);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleChecklist = async (itemKey: string) => {
    if (!user) return;
    const item = checklist.find((c) => c.item_key === itemKey);
    if (!item) return;
    const newVal = !item.completed;
    await supabase
      .from("hobby_checklist")
      .update({ completed: newVal, completed_at: newVal ? new Date().toISOString() : null })
      .eq("user_id", user.id)
      .eq("item_key", itemKey);
    setChecklist((prev) =>
      prev.map((c) => (c.item_key === itemKey ? { ...c, completed: newVal } : c))
    );
  };

  const checkAndAwardBadge = async (criteriaType: string, currentValue: number) => {
    if (!user) return;
    const badge = allBadges.find(
      (b) => b.criteria_type === criteriaType && currentValue >= b.criteria_value
    );
    if (!badge) return;
    const alreadyEarned = earnedBadges.some((eb) => eb.badge_id === badge.id);
    if (alreadyEarned) return;

    const { error } = await supabase
      .from("user_badges")
      .insert({ user_id: user.id, badge_id: badge.id });
    if (!error) {
      const newUB: UserBadge = {
        id: crypto.randomUUID(),
        badge_id: badge.id,
        earned_at: new Date().toISOString(),
        badge,
      };
      setEarnedBadges((prev) => [...prev, newUB]);
      setNewBadge(badge);
    }
  };

  const dismissBadge = () => setNewBadge(null);

  return {
    allBadges,
    earnedBadges,
    checklist,
    level,
    xp: xpInLevel,
    xpToNext,
    newBadge,
    toggleChecklist,
    checkAndAwardBadge,
    dismissBadge,
    refreshProgress: fetchData,
  };
}
