import { createFileRoute } from "@tanstack/react-router";
import { skills as SKILL_CATALOG } from "@/lib/sample-data";
import { useUserStats } from "@/lib/user-stats";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, RotateCcw } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

export const Route = createFileRoute("/_app/progress")({
  component: ProgressPage,
});

function lastNDays(n: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

function ProgressPage() {
  const { stats, setSkillProgress } = useUserStats();

  const radarData = SKILL_CATALOG.map((s) => ({
    skill: s.name.split(" ")[0],
    value: stats.skillProgress[s.id] ?? 0,
  }));

  const days = lastNDays(7);
  const barData = days.map((date) => {
    const d = stats.daily.find((x) => x.date === date);
    return { day: new Date(date).toLocaleDateString(undefined, { weekday: "short" }), quizzes: d?.quizzes ?? 0 };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="text-brand-2" /> Progress Tracking</h1>
        <p className="text-sm text-muted-foreground">Real-time skill journey based on your activity.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Skill Mastery Radar</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <PolarRadiusAxis stroke="var(--border)" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Radar dataKey="value" stroke="var(--brand-2)" fill="var(--brand-2)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Quizzes per Day (last 7)</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="quizzes" fill="var(--brand)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-1">Skill Breakdown</h3>
        <p className="text-xs text-muted-foreground mb-4">Mark lessons complete to grow your skills. Quizzes also boost related skills.</p>
        <div className="space-y-4">
          {SKILL_CATALOG.map((s) => {
            const p = stats.skillProgress[s.id] ?? 0;
            return (
              <div key={s.id}>
                <div className="flex justify-between items-center text-sm mb-1.5 gap-2 flex-wrap">
                  <div className="font-medium">{s.name} <span className="text-muted-foreground text-xs ml-1">{s.category}</span></div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold w-10 text-right">{p}%</span>
                    <Button size="sm" variant="outline" className="h-7 rounded-lg" onClick={() => setSkillProgress(s.id, p + 10)} disabled={p >= 100}>
                      <Plus className="size-3 mr-1" /> Lesson
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 rounded-lg" onClick={() => setSkillProgress(s.id, 0)} disabled={p === 0} title="Reset">
                      <RotateCcw className="size-3" />
                    </Button>
                  </div>
                </div>
                <Progress value={p} className="h-2" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
