import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { skills as SKILL_CATALOG } from "@/lib/sample-data";

type QuizRecord = { topic: string; total: number; correct: number; at: number };
type DailyActivity = { date: string; quizzes: number; chats: number; hours: number; mentorMessages: number; roadmaps: number };

export type UserStats = {
  version: 1;
  skillProgress: Record<string, number>; // 0..100 per skill id
  quizzes: QuizRecord[];
  mentorMessages: number;
  roadmapsGenerated: number;
  loginDates: string[]; // YYYY-MM-DD, unique, sorted ascending
  daily: DailyActivity[]; // last ~30 days
};

const EMPTY: UserStats = {
  version: 1,
  skillProgress: {},
  quizzes: [],
  mentorMessages: 0,
  roadmapsGenerated: 0,
  loginDates: [],
  daily: [],
};

const keyFor = (email: string) => `sb_stats_${email.toLowerCase()}`;
const todayStr = () => new Date().toISOString().slice(0, 10);

function load(email: string): UserStats {
  try {
    const raw = localStorage.getItem(keyFor(email));
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

function save(email: string, s: UserStats) {
  localStorage.setItem(keyFor(email), JSON.stringify(s));
}

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const set = new Set(dates);
  let streak = 0;
  const d = new Date();
  // Allow streak to count today if logged today, else start from yesterday
  if (!set.has(d.toISOString().slice(0, 10))) {
    d.setDate(d.getDate() - 1);
  }
  while (set.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function bumpDaily(daily: DailyActivity[], patch: Partial<Omit<DailyActivity, "date">>): DailyActivity[] {
  const date = todayStr();
  const idx = daily.findIndex((d) => d.date === date);
  const base: DailyActivity = idx >= 0 ? daily[idx] : { date, quizzes: 0, chats: 0, hours: 0, mentorMessages: 0, roadmaps: 0 };
  const merged: DailyActivity = {
    ...base,
    quizzes: base.quizzes + (patch.quizzes ?? 0),
    chats: base.chats + (patch.chats ?? 0),
    hours: +(base.hours + (patch.hours ?? 0)).toFixed(2),
    mentorMessages: base.mentorMessages + (patch.mentorMessages ?? 0),
    roadmaps: base.roadmaps + (patch.roadmaps ?? 0),
  };
  const next = idx >= 0 ? daily.map((d, i) => (i === idx ? merged : d)) : [...daily, merged];
  // Keep last 60 days max
  return next.slice(-60);
}

type Ctx = {
  stats: UserStats;
  overallProgress: number;
  completedSkills: number;
  totalSkills: number;
  streak: number;
  totalQuizzes: number;
  totalQuestions: number;
  totalCorrect: number;
  perfectQuizzes: number;
  averageScore: number; // 0..100
  recordQuiz: (q: { topic: string; total: number; correct: number; relatedSkillId?: string }) => void;
  recordMentorMessage: () => void;
  recordRoadmap: () => void;
  setSkillProgress: (skillId: string, value: number) => void;
  reset: () => void;
};

const StatsCtx = createContext<Ctx | null>(null);

export function UserStatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const email = user?.email ?? "";
  const [stats, setStats] = useState<UserStats>(() => (email ? load(email) : { ...EMPTY }));

  // Reload + record login when user changes
  useEffect(() => {
    if (!email) {
      setStats({ ...EMPTY });
      return;
    }
    const loaded = load(email);
    const today = todayStr();
    if (!loaded.loginDates.includes(today)) {
      loaded.loginDates = [...loaded.loginDates, today].sort();
    }
    save(email, loaded);
    setStats(loaded);
  }, [email]);

  const persist = useCallback(
    (updater: (s: UserStats) => UserStats) => {
      if (!email) return;
      setStats((prev) => {
        const next = updater(prev);
        save(email, next);
        return next;
      });
    },
    [email]
  );

  const recordQuiz: Ctx["recordQuiz"] = useCallback(
    ({ topic, total, correct, relatedSkillId }) => {
      persist((s) => {
        const quizzes = [...s.quizzes, { topic, total, correct, at: Date.now() }];
        const skillProgress = { ...s.skillProgress };
        if (relatedSkillId) {
          const cur = skillProgress[relatedSkillId] ?? 0;
          const gain = Math.round((correct / total) * 20); // up to +20 per quiz
          skillProgress[relatedSkillId] = Math.min(100, cur + gain);
        }
        return {
          ...s,
          quizzes,
          skillProgress,
          daily: bumpDaily(s.daily, { quizzes: 1, hours: 0.25 }),
        };
      });
    },
    [persist]
  );

  const recordMentorMessage = useCallback(() => {
    persist((s) => ({
      ...s,
      mentorMessages: s.mentorMessages + 1,
      daily: bumpDaily(s.daily, { chats: 1, mentorMessages: 1, hours: 0.05 }),
    }));
  }, [persist]);

  const recordRoadmap = useCallback(() => {
    persist((s) => ({
      ...s,
      roadmapsGenerated: s.roadmapsGenerated + 1,
      daily: bumpDaily(s.daily, { roadmaps: 1, hours: 0.1 }),
    }));
  }, [persist]);

  const setSkillProgress = useCallback(
    (skillId: string, value: number) => {
      persist((s) => ({
        ...s,
        skillProgress: { ...s.skillProgress, [skillId]: Math.max(0, Math.min(100, Math.round(value))) },
      }));
    },
    [persist]
  );

  const reset = useCallback(() => persist(() => ({ ...EMPTY })), [persist]);

  const derived = useMemo(() => {
    const totalSkills = SKILL_CATALOG.length;
    const completedSkills = SKILL_CATALOG.filter((s) => (stats.skillProgress[s.id] ?? 0) >= 100).length;
    const overallProgress = Math.round((completedSkills / totalSkills) * 100);
    const totalQuizzes = stats.quizzes.length;
    const totalQuestions = stats.quizzes.reduce((a, q) => a + q.total, 0);
    const totalCorrect = stats.quizzes.reduce((a, q) => a + q.correct, 0);
    const perfectQuizzes = stats.quizzes.filter((q) => q.total > 0 && q.correct === q.total).length;
    const averageScore = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const streak = computeStreak(stats.loginDates);
    return { totalSkills, completedSkills, overallProgress, totalQuizzes, totalQuestions, totalCorrect, perfectQuizzes, averageScore, streak };
  }, [stats]);

  const value: Ctx = {
    stats,
    ...derived,
    recordQuiz,
    recordMentorMessage,
    recordRoadmap,
    setSkillProgress,
    reset,
  };

  return <StatsCtx.Provider value={value}>{children}</StatsCtx.Provider>;
}

export function useUserStats() {
  const ctx = useContext(StatsCtx);
  if (!ctx) throw new Error("useUserStats must be used within UserStatsProvider");
  return ctx;
}

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: (s: Ctx) => boolean;
  progress: (s: Ctx) => { current: number; target: number };
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-quiz",
    title: "First Steps",
    description: "Complete your first quiz",
    icon: "🎯",
    isUnlocked: (s) => s.totalQuizzes >= 1,
    progress: (s) => ({ current: Math.min(s.totalQuizzes, 1), target: 1 }),
  },
  {
    id: "ten-quizzes",
    title: "Quick Learner",
    description: "Complete 10 quizzes",
    icon: "⚡",
    isUnlocked: (s) => s.totalQuizzes >= 10,
    progress: (s) => ({ current: Math.min(s.totalQuizzes, 10), target: 10 }),
  },
  {
    id: "mentor-25",
    title: "AI Explorer",
    description: "Chat with AI Mentor 25 times",
    icon: "🤖",
    isUnlocked: (s) => s.stats.mentorMessages >= 25,
    progress: (s) => ({ current: Math.min(s.stats.mentorMessages, 25), target: 25 }),
  },
  {
    id: "skill-master",
    title: "Skill Master",
    description: "Reach 100% in any skill",
    icon: "🏆",
    isUnlocked: (s) => s.completedSkills >= 1,
    progress: (s) => ({ current: Math.min(s.completedSkills, 1), target: 1 }),
  },
  {
    id: "roadmap-5",
    title: "Roadmap Pioneer",
    description: "Generate 5 roadmaps",
    icon: "🗺️",
    isUnlocked: (s) => s.stats.roadmapsGenerated >= 5,
    progress: (s) => ({ current: Math.min(s.stats.roadmapsGenerated, 5), target: 5 }),
  },
  {
    id: "perfect-score",
    title: "Perfect Score",
    description: "Get a perfect score on any quiz",
    icon: "💎",
    isUnlocked: (s) => s.perfectQuizzes >= 1,
    progress: (s) => ({ current: Math.min(s.perfectQuizzes, 1), target: 1 }),
  },
  {
    id: "week-streak",
    title: "Consistent Learner",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    isUnlocked: (s) => s.streak >= 7,
    progress: (s) => ({ current: Math.min(s.streak, 7), target: 7 }),
  },
];
