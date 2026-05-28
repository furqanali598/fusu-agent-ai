import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, GraduationCap, Building2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const roles: { id: Role; label: string; desc: string; icon: any }[] = [
  { id: "student", label: "Student", desc: "Learn with AI", icon: GraduationCap },
  { id: "client", label: "University", desc: "Track outcomes", icon: Building2 },
  { id: "admin", label: "Admin", desc: "Manage platform", icon: BarChart3 },
];

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      name: name || (role === "admin" ? "Admin User" : role === "client" ? "University Lead" : "Student"),
      email: email || `${role}@skillboost.ai`,
      role,
    });
    navigate({ to: role === "admin" ? "/admin" : role === "client" ? "/client" : "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="hidden lg:flex relative overflow-hidden gradient-brand text-primary-foreground p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-white/20 backdrop-blur grid place-items-center">
            <Sparkles className="size-5" />
          </div>
          <span className="font-bold text-lg">FuSu AI Agent</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Welcome to the future of <br />learning.
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-md">
            Your AI mentor is ready to help you master any skill — built for SDG 4 and Vision 2030/2035.
          </p>
        </div>
        <div className="text-sm text-primary-foreground/60">© 2026 FuSu AI Agent</div>
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Sign in</h2>
            <p className="text-muted-foreground text-sm mt-1">Choose your role to continue</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  role === r.id
                    ? "border-primary bg-accent shadow-sm"
                    : "border-border hover:bg-muted"
                }`}
              >
                <r.icon className={`size-5 ${role === r.id ? "text-brand-2" : "text-muted-foreground"}`} />
                <div className="text-sm font-medium mt-2">{r.label}</div>
                <div className="text-[10px] text-muted-foreground">{r.desc}</div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" className="mt-1.5" />
            </div>
          </div>

          <Button type="submit" className="w-full gradient-brand text-primary-foreground border-0 rounded-xl h-11">
            Continue
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Demo mode — no password required. Pick any role to explore.
          </p>
        </form>
      </div>
    </div>
  );
}
