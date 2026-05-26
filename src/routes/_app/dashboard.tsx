import { createFileRoute, Link } from "@tanstack/react-router";
import { skills } from "@/lib/sample-data";
import { useUserStats, ACHIEVEMENTS } from "@/lib/user-stats";
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
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="mt-4 text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

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

function Dashboard() {
  const stats = useUserStats();
  const unlocked = ACHIEVEMENTS.filter((a) => a.isUnlocked(stats)).length;

  const days = lastNDays(7);
  const chartData = days.map((date) => {
    const d = stats.stats.daily.find((x) => x.date === date);
    return {
      day: new Date(date).toLocaleDateString(undefined, { weekday: "short" }),
      hours: d?.hours ?? 0,
      quizzes: d?.quizzes ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl gradient-brand text-primary-foreground p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 size-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm opacity-80">Today's focus</div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              {stats.overallProgress > 0
                ? `Keep your ${stats.overallProgress}% momentum going 🚀`
                : "Start your learning journey 🚀"}
            </h1>
            <p className="opacity-80 text-sm mt-2 max-w-lg">
              {stats.totalQuizzes === 0
                ? "Take your first quiz or chat with the AI Mentor to begin tracking real progress."
                : "Your AI Mentor is ready whenever you want to dive deeper."}
            </p>
          </div>
          <Link to="/mentor"><Button variant="secondary" className="rounded-xl">Open AI Mentor <ArrowRight className="ml-1 size-4" /></Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Overall Progress" value={`${stats.overallProgress}%`} hint={`${stats.completedSkills}/${stats.totalSkills} skills`} />
        <StatCard icon={Trophy} label="Achievements" value={`${unlocked}/${ACHIEVEMENTS.length}`} hint={`${ACHIEVEMENTS.length - unlocked} to unlock`} />
        <StatCard icon={Brain} label="Quizzes taken" value={stats.totalQuizzes} hint={stats.totalQuizzes ? `${stats.averageScore}% avg` : "No quizzes yet"} />
        <StatCard icon={Flame} label="Day streak" value={stats.streak} hint={stats.streak > 0 ? "Keep it up!" : "Log in daily"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Weekly Activity</h3>
              <p className="text-xs text-muted-foreground">Hours spent learning (last 7 days)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
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

      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Your Skills</h3>
          <Link to="/progress" className="text-sm text-brand-2 hover:underline">View all</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {skills.slice(0, 6).map((s) => {
            const p = stats.stats.skillProgress[s.id] ?? 0;
            return (
              <div key={s.id} className="p-4 rounded-xl bg-muted/40">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.category}</div>
                  </div>
                  <span className="text-sm font-semibold">{p}%</span>
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
