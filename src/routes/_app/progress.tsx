import { createFileRoute } from "@tanstack/react-router";
import { skills, weeklyActivity } from "@/lib/sample-data";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

export const Route = createFileRoute("/_app/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const radarData = skills.map((s) => ({ skill: s.name.split(" ")[0], value: s.progress }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="text-brand-2" /> Progress Tracking</h1>
        <p className="text-sm text-muted-foreground">Monitor your skill journey.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Skill Mastery Radar</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <PolarRadiusAxis stroke="var(--border)" tick={{ fontSize: 10 }} />
                <Radar dataKey="value" stroke="var(--brand-2)" fill="var(--brand-2)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Quizzes per Day</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="quizzes" fill="var(--brand)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Skill Breakdown</h3>
        <div className="space-y-4">
          {skills.map((s) => (
            <div key={s.id}>
              <div className="flex justify-between text-sm mb-1.5">
                <div className="font-medium">{s.name} <span className="text-muted-foreground text-xs ml-1">{s.category}</span></div>
                <span className="font-semibold">{s.progress}%</span>
              </div>
              <Progress value={s.progress} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
