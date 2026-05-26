import { createFileRoute, Link } from "@tanstack/react-router";
import { skills, achievements, weeklyActivity } from "@/lib/sample-data";
import { Bot, Brain, Map, TrendingUp, Trophy, ArrowRight, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function StatCard({ icon: Icon, label, value, hint }: any) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between">
        <div className="size-9 rounded-lg gradient-brand grid place-items-center text-primary-foreground">
          <Icon className="size-4" />
        </div>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <div className="mt-4 text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Dashboard() {
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const overall = Math.round(skills.reduce((s, x) => s + x.progress, 0) / skills.length);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl gradient-brand text-primary-foreground p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 size-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm opacity-80">Today's focus</div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">Keep your {overall}% momentum going 🚀</h1>
            <p className="opacity-80 text-sm mt-2 max-w-lg">Your AI Mentor has 3 new suggestions tailored to your skill gaps.</p>
          </div>
          <Link to="/mentor"><Button variant="secondary" className="rounded-xl">Open AI Mentor <ArrowRight className="ml-1 size-4" /></Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Overall Progress" value={`${overall}%`} hint="↑ 4% this week" />
        <StatCard icon={Trophy} label="Achievements" value={`${unlocked}/${achievements.length}`} hint="3 to unlock" />
        <StatCard icon={Brain} label="Quizzes taken" value="123" hint="92% avg" />
        <StatCard icon={Flame} label="Day streak" value="14" hint="Personal best!" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Weekly Activity</h3>
              <p className="text-xs text-muted-foreground">Hours spent learning</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--brand-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="hours" stroke="var(--brand-2)" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="font-semibold">Quick actions</h3>
          <div className="mt-4 space-y-2">
            {[
              { to: "/mentor", icon: Bot, label: "Ask AI Mentor" },
              { to: "/roadmap", icon: Map, label: "Generate Roadmap" },
              { to: "/quiz", icon: Brain, label: "Take a Quiz" },
              { to: "/progress", icon: TrendingUp, label: "View Progress" },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition">
                <div className="size-9 rounded-lg bg-accent grid place-items-center text-brand-2"><a.icon className="size-4" /></div>
                <span className="text-sm font-medium flex-1">{a.label}</span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Your Skills</h3>
          <Link to="/progress" className="text-sm text-brand-2 hover:underline">View all</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {skills.slice(0, 6).map((s) => (
            <div key={s.id} className="p-4 rounded-xl bg-muted/40">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium text-sm">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.category}</div>
                </div>
                <span className="text-sm font-semibold">{s.progress}%</span>
              </div>
              <Progress value={s.progress} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
