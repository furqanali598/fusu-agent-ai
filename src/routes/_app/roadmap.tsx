import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateRoadmap } from "@/lib/ai.functions";
import { Map, Sparkles, CheckCircle2, Circle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useUserStats } from "@/lib/user-stats";

export const Route = createFileRoute("/_app/roadmap")({
  component: Roadmap,
});

type Stage = { title: string; duration: string; description: string; skills: string[] };
type RoadmapData = { title: string; stages: Stage[] };

function Roadmap() {
  const gen = useServerFn(generateRoadmap);
  const { recordRoadmap } = useUserStats();
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setLoading(true);
    setData(null);
    setCompleted(new Set());
    try {
      const r = await gen({ data: { goal, level } });
      setData(r);
      recordRoadmap();
    } catch (e: any) {
      toast.error("Failed to generate roadmap", { description: e?.message });
    } finally {
      setLoading(false);
    }
  };

  const toggle = (i: number) => {
    const n = new Set(completed);
    n.has(i) ? n.delete(i) : n.add(i);
    setCompleted(n);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Map className="text-brand-2" /> Learning Roadmap</h1>
        <p className="text-sm text-muted-foreground">Tell us your goal — AI builds your path.</p>
      </div>

      <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-6 grid md:grid-cols-[1fr_180px_auto] gap-4 items-end">
        <div>
          <Label>Your learning goal</Label>
          <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Become a Machine Learning Engineer" className="mt-1.5 rounded-xl" />
        </div>
        <div>
          <Label>Current level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={loading} className="gradient-brand text-primary-foreground border-0 rounded-xl h-10">
          {loading ? "Generating…" : <><Sparkles className="size-4 mr-1" /> Generate</>}
        </Button>
      </form>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <div>
          <h2 className="text-xl font-bold mb-4">{data.title}</h2>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {data.stages.map((s, i) => {
                const done = completed.has(i);
                return (
                  <div key={i} className="relative pl-14">
                    <button
                      onClick={() => toggle(i)}
                      className={`absolute left-0 top-3 size-10 rounded-full grid place-items-center border-2 transition ${done ? "gradient-brand border-transparent text-primary-foreground" : "bg-card border-border text-muted-foreground hover:border-brand-2"}`}
                    >
                      {done ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
                    </button>
                    <div className="bg-card rounded-2xl border border-border p-5">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="text-xs text-brand-2 font-medium">Stage {i + 1}</div>
                          <h3 className="font-semibold text-lg">{s.title}</h3>
                        </div>
                        <Badge variant="secondary" className="rounded-full"><Clock className="size-3 mr-1" />{s.duration}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{s.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {s.skills.map((sk) => (
                          <span key={sk} className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground">{sk}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
