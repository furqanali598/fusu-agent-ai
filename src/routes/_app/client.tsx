import { createFileRoute } from "@tanstack/react-router";
import { users, skills } from "@/lib/sample-data";
import { Building2, Download, Users as UsersIcon, GraduationCap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/client")({
  component: ClientPage,
});

function exportCSV() {
  const headers = ["Name", "Email", "University", "Progress", "Quizzes"];
  const rows = users.map(u => [u.name, u.email, u.university, u.progress, u.quizzes].join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "skillboost-report.csv"; a.click();
  URL.revokeObjectURL(url);
  toast.success("Report downloaded");
}

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
  const avg = Math.round(users.reduce((s, u) => s + u.progress, 0) / users.length);
  const top = [...users].sort((a, b) => b.progress - a.progress).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="text-brand-2" /> University Dashboard</h1>
          <p className="text-sm text-muted-foreground">Student performance & skill demand insights</p>
        </div>
        <Button onClick={exportCSV} className="rounded-xl gradient-brand text-primary-foreground border-0">
          <Download className="size-4 mr-1" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={UsersIcon} label="Enrolled Students" value={users.length * 142} />
        <Stat icon={GraduationCap} label="Avg. Mastery" value={`${avg}%`} />
        <Stat icon={Award} label="Top Performers" value="324" />
        <Stat icon={Building2} label="Active Programs" value="18" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-1">Skill Demand vs Mastery</h3>
          <p className="text-xs text-muted-foreground mb-4">Market demand and student proficiency</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={skills}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => v.split(" ")[0]} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="demand" fill="var(--brand-2)" radius={[6, 6, 0, 0]} name="Market demand" />
                <Bar dataKey="progress" fill="var(--brand)" radius={[6, 6, 0, 0]} name="Student mastery" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Top Performing Students</h3>
          <div className="space-y-3">
            {top.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40">
                <div className="size-9 rounded-lg gradient-brand grid place-items-center text-primary-foreground text-sm font-bold">#{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.university}</div>
                </div>
                <div className="text-sm font-semibold">{u.progress}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Skill Demand Insights</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...skills].sort((a, b) => b.demand - a.demand).slice(0, 6).map((s) => (
            <div key={s.id} className="p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">{s.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full gradient-brand text-primary-foreground font-semibold">{s.demand}%</span>
              </div>
              <div className="text-xs text-muted-foreground">{s.category} · High employer demand</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
