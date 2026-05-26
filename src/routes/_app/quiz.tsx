import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateQuiz } from "@/lib/ai.functions";
import { Brain, Sparkles, Check, X, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { skills as SKILL_CATALOG } from "@/lib/sample-data";
import { useUserStats } from "@/lib/user-stats";

export const Route = createFileRoute("/_app/quiz")({
  component: QuizPage,
});

type Q = { question: string; options: string[]; correctIndex: number; explanation: string };

function matchSkill(topic: string): string | undefined {
  const t = topic.toLowerCase();
  return SKILL_CATALOG.find((s) => t.includes(s.name.toLowerCase().split(" ")[0]))?.id;
}

function QuizPage() {
  const gen = useServerFn(generateQuiz);
  const { recordQuiz } = useUserStats();
  const [topic, setTopic] = useState("");
  const [skillId, setSkillId] = useState<string>("auto");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setQuestions(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const r = await gen({ data: { topic, count } });
      setQuestions(r.questions);
    } catch (e: any) {
      toast.error("Failed to generate quiz", { description: e?.message });
    } finally {
      setLoading(false);
    }
  };

  const resolvedSkillId = useMemo(() => (skillId === "auto" ? matchSkill(topic) : skillId), [skillId, topic]);

  const finalize = () => {
    if (!questions) return;
    const correct = questions.reduce((s, q, i) => (answers[i] === q.correctIndex ? s + 1 : s), 0);
    recordQuiz({ topic, total: questions.length, correct, relatedSkillId: resolvedSkillId });
    setSubmitted(true);
  };

  const reset = () => { setQuestions(null); setAnswers({}); setSubmitted(false); setTopic(""); };
  const score = questions ? questions.reduce((s, q, i) => (answers[i] === q.correctIndex ? s + 1 : s), 0) : 0;

  if (questions && submitted) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-6">
        <div className="rounded-2xl gradient-brand text-primary-foreground p-8 text-center">
          <Trophy className="size-12 mx-auto mb-3" />
          <div className="text-5xl font-bold">{pct}%</div>
          <div className="opacity-90 mt-1">{score} / {questions.length} correct</div>
          <Button variant="secondary" onClick={reset} className="mt-6 rounded-xl"><RotateCcw className="size-4 mr-1" /> New Quiz</Button>
        </div>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const correct = answers[i] === q.correctIndex;
            return (
              <div key={i} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className={`size-7 rounded-full grid place-items-center shrink-0 ${correct ? "bg-emerald-500/20 text-emerald-600" : "bg-destructive/20 text-destructive"}`}>
                    {correct ? <Check className="size-4" /> : <X className="size-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{q.question}</div>
                    <div className="text-sm text-muted-foreground mt-1">Correct: <span className="text-foreground">{q.options[q.correctIndex]}</span></div>
                    <div className="text-sm mt-2 p-3 rounded-lg bg-accent/50">{q.explanation}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="text-brand-2" /> AI Quiz Generator</h1>
        <p className="text-sm text-muted-foreground">Generate MCQs on any topic. Your score updates your real progress.</p>
      </div>

      {!questions && (
        <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-6 grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Topic</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Python loops, SQL joins…" className="mt-1.5 rounded-xl" />
          </div>
          <div>
            <Label>Linked skill</Label>
            <Select value={skillId} onValueChange={setSkillId}>
              <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect from topic</SelectItem>
                {SKILL_CATALOG.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Questions</Label>
            <Input type="number" min={3} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-1.5 rounded-xl" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading} className="gradient-brand text-primary-foreground border-0 rounded-xl h-10 w-full md:w-auto">
              {loading ? "Generating…" : <><Sparkles className="size-4 mr-1" /> Generate</>}
            </Button>
          </div>
        </form>
      )}

      {loading && <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-32 rounded-2xl bg-muted/40 animate-pulse" />)}</div>}

      {questions && !submitted && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5">
              <div className="text-xs text-brand-2 font-medium mb-1">Question {i + 1} of {questions.length}</div>
              <div className="font-medium mb-4">{q.question}</div>
              <div className="space-y-2">
                {q.options.map((opt, j) => (
                  <button
                    key={j}
                    onClick={() => setAnswers({ ...answers, [i]: j })}
                    className={`w-full text-left p-3 rounded-xl border transition ${answers[i] === j ? "border-primary bg-accent" : "border-border hover:bg-muted"}`}
                  >
                    <span className="font-medium text-sm mr-2">{String.fromCharCode(65 + j)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button
            disabled={Object.keys(answers).length !== questions.length}
            onClick={finalize}
            className="w-full gradient-brand text-primary-foreground border-0 rounded-xl h-11"
          >
            Submit Quiz ({Object.keys(answers).length}/{questions.length})
          </Button>
        </div>
      )}
    </div>
  );
}
