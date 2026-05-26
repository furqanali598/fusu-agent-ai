import { createFileRoute } from "@tanstack/react-router";
import { achievements } from "@/lib/sample-data";
import { Trophy, Lock } from "lucide-react";

export const Route = createFileRoute("/_app/achievements")({
  component: AchievementsPage,
});

function AchievementsPage() {
  const unlocked = achievements.filter((a) => a.unlocked).length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-brand-2" /> Achievements</h1>
        <p className="text-sm text-muted-foreground">{unlocked} of {achievements.length} unlocked</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((a) => (
          <div key={a.id} className={`bg-card border border-border rounded-2xl p-5 text-center transition ${a.unlocked ? "" : "opacity-60"}`}>
            <div className={`size-16 mx-auto rounded-2xl grid place-items-center text-3xl mb-3 ${a.unlocked ? "gradient-brand" : "bg-muted"}`}>
              {a.unlocked ? a.icon : <Lock className="size-5 text-muted-foreground" />}
            </div>
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
            {a.unlocked && <div className="text-[10px] text-brand-2 font-medium mt-3 uppercase tracking-wide">Unlocked</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
