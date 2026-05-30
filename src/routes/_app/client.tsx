import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Download, Users as UsersIcon, GraduationCap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { aggregateAllUsers, type Aggregate } from "@/lib/stats-aggregate";

export const Route = createFileRoute("/_app/client")({
  component: ClientPage,
});

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="size-9 rounded-lg gradient-brand grid place-items-center text-primary-foreground"><Icon className="size-4" /></div>
      <div className="mt-4 text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function ClientPage() {
  const [agg, setAgg] = useState<Aggregate | null>(null);
  useEffect(() => {
    setAgg(aggregateAllUsers());
  }, []);

  if (!agg) return <div className="text-sm text-muted-foreground">Loading…</div>;

  // Active programs = number of distinct skills with at least one learner
  const activePrograms = agg.skillDemand.filter((s) => s.learners > 0).length;

  function exportCSV() {
    if (!agg || agg.users.length === 0) {
      toast.error("No learner data to export yet");
      return;
    }
    const headers = ["Email", "Progress", "Quizzes", "Mentor messages", "Roadmaps", "Streak", "Last active"];
    const rows = agg.users.map((u) =>
      [u.email, u.progress, u.quizzes, u.mentorMessages, u.roadmaps, u.streak, u.lastActive ?? ""].join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fusu-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="text-brand-2" /> University Dashboard</h1>
          <p className="text-sm text-muted-foreground">Student performance & skill demand based on real activity</p>
        </div>
        <Button onClick={exportCSV} className="rounded-xl gradient-brand text-primary-foreground border-0">
          <Download className="size-4 mr-1" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={UsersIcon} label="Enrolled Students" value={agg.totalUsers} />
        <Stat icon={GraduationCap} label="Avg. Mastery" value={`${agg.averageMastery}%`} />
        <Stat icon={Award} label="Top Performers" value={agg.topPerformers.length} />
        <Stat icon={Building2} label="Active Programs" value={activePrograms} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-1">Skill Mastery & Learner Count</h3>
          <p className="text-xs text-muted-foreground mb-4">Calculated from real learner progress</p>
          {agg.skillDemand.some((s) => s.learners > 0) ? (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={agg.skillDemand}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => v.split(" ")[0]} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Bar dataKey="learners" fill="var(--brand-2)" radius={[6, 6, 0, 0]} name="Active learners" />
                  <Bar dataKey="mastery" fill="var(--brand)" radius={[6, 6, 0, 0]} name="Avg mastery %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 grid place-items-center text-sm text-muted-foreground">No learner activity recorded yet.</div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Top Performing Students</h3>
          {agg.topPerformers.length ? (
            <div className="space-y-3">
              {agg.topPerformers.slice(0, 5).map((u, i) => (
                <div key={u.email} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40">
                  <div className="size-9 rounded-lg gradient-brand grid place-items-center text-primary-foreground text-sm font-bold">#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{u.email}</div>
                    <div className="text-xs text-muted-foreground">{u.quizzes} quizzes · {u.streak}d streak</div>
                  </div>
                  <div className="text-sm font-semibold">{u.progress}%</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No students have crossed the 80% mastery threshold yet.</div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Skill Demand Insights</h3>
        {agg.skillDemand.some((s) => s.learners > 0) ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {agg.skillDemand
              .filter((s) => s.learners > 0)
              .sort((a, b) => b.learners - a.learners)
              .slice(0, 6)
              .map((s) => (
                <div key={s.skillId} className="p-4 rounded-xl bg-muted/40 border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{s.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full gradient-brand text-primary-foreground font-semibold">{s.learners} learners</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{s.category} · {s.mastery}% avg mastery</div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Insights appear once learners begin recording activity.</div>
        )}
      </div>
    </div>
  );
}
