import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Bot, Activity, TrendingUp, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { aggregateAllUsers, type Aggregate } from "@/lib/stats-aggregate";

export const Route = createFileRoute("/_app/admin")({
  component: AdminPage,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Stat({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="size-9 rounded-lg gradient-brand grid place-items-center text-primary-foreground"><Icon className="size-4" /></div>
        {sub ? <span className="text-xs text-muted-foreground">{sub}</span> : null}
      </div>
      <div className="mt-4 text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function AdminPage() {
  const [agg, setAgg] = useState<Aggregate | null>(null);
  useEffect(() => {
    setAgg(aggregateAllUsers());
  }, []);

  if (!agg) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  const completionRate = agg.users.length
    ? Math.round(agg.users.reduce((a, u) => a + u.progress, 0) / agg.users.length)
    : 0;

  // Category breakdown from real mastery data
  const byCategory: Record<string, number> = {};
  for (const s of agg.skillDemand) {
    byCategory[s.category] = (byCategory[s.category] ?? 0) + s.learners;
  }
  const categoryData = Object.entries(byCategory)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview based on real recorded activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Registered Users" value={agg.totalUsers} sub={`${agg.activeUsers} active (7d)`} />
        <Stat icon={Bot} label="AI Mentor Sessions" value={agg.totalMentorMessages} />
        <Stat icon={Activity} label="Quizzes Completed" value={agg.totalQuizzes} />
        <Stat icon={TrendingUp} label="Avg. Completion" value={`${completionRate}%`} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Map} label="Roadmaps Generated" value={agg.totalRoadmaps} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-1">Skill Mastery Across Learners</h3>
          <p className="text-xs text-muted-foreground mb-4">Average mastery and number of active learners per skill</p>
          {agg.skillDemand.some((s) => s.learners > 0) ? (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={agg.skillDemand}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => v.split(" ")[0]} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Bar dataKey="mastery" fill="var(--brand-2)" radius={[6, 6, 0, 0]} name="Avg mastery %" />
                  <Bar dataKey="learners" fill="var(--brand)" radius={[6, 6, 0, 0]} name="Active learners" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 grid place-items-center text-sm text-muted-foreground">No learner activity recorded yet.</div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Active Learners by Category</h3>
          {categoryData.length ? (
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 grid place-items-center text-sm text-muted-foreground">No data yet.</div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">User Activity</h3>
        {agg.users.length === 0 ? (
          <div className="text-sm text-muted-foreground">No registered users with recorded activity yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 font-medium">Email</th>
                  <th className="font-medium">Progress</th>
                  <th className="font-medium">Quizzes</th>
                  <th className="font-medium">Mentor</th>
                  <th className="font-medium">Roadmaps</th>
                  <th className="font-medium">Streak</th>
                  <th className="font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {agg.users
                  .slice()
                  .sort((a, b) => b.progress - a.progress)
                  .map((u) => {
                    const active = u.lastActive
                      ? (new Date().getTime() - new Date(u.lastActive + "T00:00:00Z").getTime()) / 86_400_000 <= 7
                      : false;
                    return (
                      <tr key={u.email} className="border-b border-border last:border-0">
                        <td className="py-3 font-medium">{u.email}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full gradient-brand" style={{ width: `${u.progress}%` }} />
                            </div>
                            <span className="text-xs">{u.progress}%</span>
                          </div>
                        </td>
                        <td>{u.quizzes}</td>
                        <td>{u.mentorMessages}</td>
                        <td>{u.roadmaps}</td>
                        <td>{u.streak}d</td>
                        <td>
                          <Badge variant={active ? "secondary" : "outline"} className="rounded-full">
                            {active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
