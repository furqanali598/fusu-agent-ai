import { Link } from "@tanstack/react-router";
import { Brain, Sparkles, Map, Trophy, BarChart3, GraduationCap, ArrowRight, Bot, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-9 rounded-xl gradient-brand grid place-items-center text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <span className="font-bold text-lg">FuSu <span className="text-gradient-brand">AI Agent</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#dashboards" className="hover:text-foreground transition">For Everyone</a>
            <a href="#impact" className="hover:text-foreground transition">Impact</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/login"><Button size="sm" className="gradient-brand text-primary-foreground border-0">Get started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 size-96 rounded-full bg-brand/20 blur-3xl" />
          <div className="absolute top-40 right-1/4 size-96 rounded-full bg-brand-2/20 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
            <span className="size-1.5 rounded-full bg-brand-2 animate-pulse" />
            Aligned with SDG 4 · Vision 2030/2035
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Your AI mentor for<br />
            <span className="text-gradient-brand">future-ready skills</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Personalized roadmaps, instant tutoring, and adaptive quizzes — powered by AI.
            Built for students, universities, and the workforce of tomorrow.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/login">
              <Button size="lg" className="gradient-brand text-primary-foreground border-0 rounded-xl">
                Start Learning Free <ArrowRight className="ml-1 size-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="rounded-xl">See how it works</Button>
            </a>
          </div>

          <div className="mt-20 grid grid-cols-3 max-w-2xl mx-auto gap-6">
            {[
              { v: "12K+", l: "Active learners" },
              { v: "98%", l: "Skill mastery" },
              { v: "40+", l: "Universities" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-3xl font-bold text-gradient-brand">{s.v}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gradient-soft">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Everything you need to <span className="text-gradient-brand">level up</span></h2>
            <p className="mt-3 text-muted-foreground">AI-powered learning, designed for the modern student.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Bot, title: "AI Mentor Chat", desc: "Get instant, expert answers on any topic — 24/7." },
              { icon: Map, title: "Learning Roadmaps", desc: "AI generates a step-by-step path to your career goal." },
              { icon: Brain, title: "Adaptive Quizzes", desc: "MCQs that scale to your level with detailed explanations." },
              { icon: BarChart3, title: "Progress Tracking", desc: "Visualize skill growth across all your learning paths." },
              { icon: Trophy, title: "Achievements", desc: "Unlock badges as you master new skills and milestones." },
              { icon: Target, title: "Skill Suggestions", desc: "AI recommends what to learn next based on demand." },
            ].map((f) => (
              <div key={f.title} className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg hover:-translate-y-1 transition">
                <div className="size-11 rounded-xl gradient-brand grid place-items-center text-primary-foreground mb-4">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboards */}
      <section id="dashboards" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Built for <span className="text-gradient-brand">everyone</span> in the journey</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: "Students", desc: "Learn, track, and grow with your personal AI mentor.", role: "student" },
              { icon: Users, title: "Universities", desc: "Insights into student performance and skill demand.", role: "client" },
              { icon: BarChart3, title: "Admins", desc: "Manage users, monitor AI usage, generate reports.", role: "admin" },
            ].map((d) => (
              <div key={d.title} className="rounded-2xl p-8 border border-border bg-card relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 size-32 rounded-full gradient-brand opacity-10 group-hover:opacity-20 transition" />
                <d.icon className="size-8 text-brand-2 mb-4" />
                <h3 className="text-xl font-semibold">{d.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="py-24 bg-gradient-soft">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold">Education that powers <span className="text-gradient-brand">national vision</span></h2>
          <p className="mt-6 text-muted-foreground text-lg">
            FuSu AI Agent advances UN SDG 4 (Quality Education) and accelerates Vision 2030/2035
            workforce goals by equipping every learner with the skills of tomorrow.
          </p>
          <div className="mt-10">
            <Link to="/login">
              <Button size="lg" className="gradient-brand text-primary-foreground border-0 rounded-xl">
                Join the mission <ArrowRight className="ml-1 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 FuSu AI Agent — Powering the next generation of learners.
      </footer>
    </div>
  );
}
