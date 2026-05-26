import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { chatMentor } from "@/lib/ai.functions";
import { Bot, Send, Sparkles, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useUserStats } from "@/lib/user-stats";

export const Route = createFileRoute("/_app/mentor")({
  component: Mentor,
});

type Msg = { role: "user" | "assistant"; content: string };

const suggestions = [
  "Explain neural networks simply",
  "What should I learn after Python?",
  "Give me a 30-day data science plan",
  "How does cloud computing work?",
];

function Mentor() {
  const chat = useServerFn(chatMentor);
  const { recordMentorMessage } = useUserStats();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "👋 Hi! I'm your **AI Mentor**. Ask me anything about your studies — concepts, career paths, or what to learn next." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: "user", content: text } as Msg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await chat({ data: { messages: next.map(m => ({ role: m.role, content: m.content })) } });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      recordMentorMessage();
    } catch (e: any) {
      toast.error("AI Mentor failed", { description: e?.message?.includes("429") ? "Rate limited — try again." : e?.message?.includes("402") ? "AI credits exhausted." : "Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bot className="text-brand-2" /> AI Mentor</h1>
        <p className="text-sm text-muted-foreground">Your 24/7 personal tutor</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-2xl p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="size-8 rounded-lg gradient-brand grid place-items-center text-primary-foreground shrink-0">
                <Sparkles className="size-4" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "gradient-brand text-primary-foreground" : "bg-muted"}`}>
              <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_code]:text-xs">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
            {m.role === "user" && (
              <div className="size-8 rounded-lg bg-accent grid place-items-center shrink-0">
                <UserIcon className="size-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="size-8 rounded-lg gradient-brand grid place-items-center text-primary-foreground"><Sparkles className="size-4" /></div>
            <div className="bg-muted rounded-2xl px-4 py-3 text-sm flex gap-1">
              <span className="size-2 rounded-full bg-brand-2 animate-bounce" />
              <span className="size-2 rounded-full bg-brand-2 animate-bounce [animation-delay:0.15s]" />
              <span className="size-2 rounded-full bg-brand-2 animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition">
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything…" className="rounded-xl h-11" disabled={loading} />
        <Button type="submit" disabled={loading || !input.trim()} className="gradient-brand text-primary-foreground border-0 rounded-xl h-11 px-5">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
