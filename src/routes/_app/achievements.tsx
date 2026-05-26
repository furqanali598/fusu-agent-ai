import { createFileRoute } from "@tanstack/react-router";
import { ACHIEVEMENTS, useUserStats } from "@/lib/user-stats";
import { Trophy, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/achievements")({
  component: AchievementsPage,
});

function AchievementsPage() {
  const stats = useUserStats();
  const unlocked = ACHIEVEMENTS.filter((a) => a.isUnlocked(stats)).length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-brand-2" /> Achievements</h1>
        <p className="text-sm text-muted-foreground">{unlocked} of {ACHIEVEMENTS.length} unlocked</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = a.isUnlocked(stats);
          const { current, target } = a.progress(stats);
          const pct = Math.round((current / target) * 100);
          return (
            <div key={a.id} className={`bg-card border border-border rounded-2xl p-5 text-center transition ${isUnlocked ? "" : "opacity-80"}`}>
              <div className={`size-16 mx-auto rounded-2xl grid place-items-center text-3xl mb-3 ${isUnlocked ? "gradient-brand" : "bg-muted"}`}>
                {isUnlocked ? a.icon : <Lock className="size-5 text-muted-foreground" />}
              </div>
              <h3 className="font-semibold">{a.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
              <div className="mt-3">
                <Progress value={pct} className="h-1.5" />
                <div className="text-[10px] text-muted-foreground mt-1">{current} / {target}</div>
              </div>
              {isUnlocked && <div className="text-[10px] text-brand-2 font-medium mt-2 uppercase tracking-wide">Unlocked</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
