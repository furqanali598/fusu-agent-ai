import { skills as SKILL_CATALOG } from "@/lib/sample-data";
import type { UserStats } from "@/lib/user-stats";

export type AggregatedUser = {
  email: string;
  progress: number; // 0..100, % of skills mastered
  quizzes: number;
  mentorMessages: number;
  roadmaps: number;
  streak: number;
  lastActive: string | null; // YYYY-MM-DD
};

export type Aggregate = {
  users: AggregatedUser[];
  totalUsers: number;
  activeUsers: number; // active in last 7 days
  totalQuizzes: number;
  totalMentorMessages: number;
  totalRoadmaps: number;
  averageMastery: number; // 0..100
  topPerformers: AggregatedUser[]; // progress >= 80
  skillDemand: { skillId: string; name: string; category: string; mastery: number; learners: number }[];
};

const todayStr = () => new Date().toISOString().slice(0, 10);

function daysAgo(date: string): number {
  const d = new Date(date + "T00:00:00Z");
  const now = new Date(todayStr() + "T00:00:00Z");
  return Math.floor((now.getTime() - d.getTime()) / 86_400_000);
}

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const set = new Set(dates);
  const d = new Date();
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (set.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function aggregateAllUsers(): Aggregate {
  const empty: Aggregate = {
    users: [],
    totalUsers: 0,
    activeUsers: 0,
    totalQuizzes: 0,
    totalMentorMessages: 0,
    totalRoadmaps: 0,
    averageMastery: 0,
    topPerformers: [],
    skillDemand: SKILL_CATALOG.map((s) => ({
      skillId: s.id,
      name: s.name,
      category: s.category,
      mastery: 0,
      learners: 0,
    })),
  };

  if (typeof window === "undefined") return empty;

  const users: AggregatedUser[] = [];
  const skillTotals: Record<string, { sum: number; learners: number }> = {};
  let totalQuizzes = 0;
  let totalMentor = 0;
  let totalRoadmaps = 0;
  let activeUsers = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("sb_stats_")) continue;
    let s: UserStats;
    try {
      s = JSON.parse(localStorage.getItem(key) || "");
    } catch {
      continue;
    }
    const email = key.slice("sb_stats_".length);
    const totalSkills = SKILL_CATALOG.length;
    const completed = SKILL_CATALOG.filter((sk) => (s.skillProgress?.[sk.id] ?? 0) >= 100).length;
    const progress = totalSkills ? Math.round((completed / totalSkills) * 100) : 0;
    const quizzes = s.quizzes?.length ?? 0;
    const mentor = s.mentorMessages ?? 0;
    const roadmaps = s.roadmapsGenerated ?? 0;
    const loginDates = s.loginDates ?? [];
    const lastActive = loginDates.length ? loginDates[loginDates.length - 1] : null;
    const streak = computeStreak(loginDates);

    totalQuizzes += quizzes;
    totalMentor += mentor;
    totalRoadmaps += roadmaps;
    if (lastActive && daysAgo(lastActive) <= 7) activeUsers++;

    for (const sk of SKILL_CATALOG) {
      const v = s.skillProgress?.[sk.id] ?? 0;
      if (v > 0) {
        const entry = (skillTotals[sk.id] ||= { sum: 0, learners: 0 });
        entry.sum += v;
        entry.learners += 1;
      }
    }

    users.push({ email, progress, quizzes, mentorMessages: mentor, roadmaps, streak, lastActive });
  }

  const averageMastery = users.length
    ? Math.round(users.reduce((a, u) => a + u.progress, 0) / users.length)
    : 0;
  const topPerformers = users.filter((u) => u.progress >= 80).sort((a, b) => b.progress - a.progress);

  const skillDemand = SKILL_CATALOG.map((s) => {
    const t = skillTotals[s.id];
    return {
      skillId: s.id,
      name: s.name,
      category: s.category,
      mastery: t && t.learners ? Math.round(t.sum / t.learners) : 0,
      learners: t?.learners ?? 0,
    };
  });

  return {
    users,
    totalUsers: users.length,
    activeUsers,
    totalQuizzes,
    totalMentorMessages: totalMentor,
    totalRoadmaps,
    averageMastery,
    topPerformers,
    skillDemand,
  };
}
