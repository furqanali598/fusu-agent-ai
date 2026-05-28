import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FuSu AI Agent — Personalized Skill Development & Learning Assistant" },
      { name: "description", content: "FuSu AI Agent is an AI-powered educational platform with personalized learning plans, AI mentoring, quizzes, and progress tracking. Learn Smarter. Grow Faster." },
      { property: "og:title", content: "FuSu AI Agent — Learn Smarter. Grow Faster." },
      { property: "og:description", content: "AI-powered education aligned with SDG 4 and Vision 2030/2035." },
    ],
  }),
  component: Landing,
});
