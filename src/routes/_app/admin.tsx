import { createFileRoute } from "@tanstack/react-router";
import { users, aiUsage, skillCategories } from "@/lib/sample-data";
import { Users, Bot, Activity, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from "recharts";

export const Route = createFileRoute("/_app/admin")({
  component: AdminPage,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Stat({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="size-9 rounded-lg gradient-brand grid place-items-center text-primary-foreground"><Icon className="size-4" /></div>
        <span className="text-xs text-emerald-600">{sub}</span>
      </div>
      <div className="mt-4 text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview & user management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Active Users" value="12,438" sub="↑ 12%" />
        <Stat icon={Bot} label="AI Requests" value="48.2K" sub="↑ 28%" />
        <Stat icon={Activity} label="Quizzes Taken" value="9,184" sub="↑ 18%" />
        <Stat icon={TrendingUp} label="Avg. Mastery" value="76%" sub="↑ 4%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">AI Usage Trends</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={aiUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="chat" stroke="var(--brand)" strokeWidth={2} />
                <Line type="monotone" dataKey="roadmap" stroke="var(--brand-2)" strokeWidth={2} />
                <Line type="monotone" dataKey="quiz" stroke="var(--chart-3)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Skill Categories</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={skillCategories} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {skillCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">User Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 font-medium">Name</th>
                <th className="font-medium">Email</th>
                <th className="font-medium">University</th>
                <th className="font-medium">Progress</th>
                <th className="font-medium">Quizzes</th>
                <th className="font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium">{u.name}</td>
                  <td className="text-muted-foreground">{u.email}</td>
                  <td>{u.university}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full gradient-brand" style={{ width: `${u.progress}%` }} />
                      </div>
                      <span className="text-xs">{u.progress}%</span>
                    </div>
                  </td>
                  <td>{u.quizzes}</td>
                  <td><Badge variant="secondary" className="rounded-full">Active</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
