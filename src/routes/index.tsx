import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillBoost AI — Your AI mentor for future-ready skills" },
      { name: "description", content: "Personalized learning roadmaps, AI mentor chat, and adaptive quizzes. Built for students, universities, and the workforce of tomorrow." },
      { property: "og:title", content: "SkillBoost AI" },
      { property: "og:description", content: "AI-powered education aligned with SDG 4 and Vision 2030/2035." },
    ],
  }),
  component: Landing,
});
