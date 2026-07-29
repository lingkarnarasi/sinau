import { useEffect, useState, useCallback } from "react";

export interface NarrationEntry {
  id: string;
  bookId: string;
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  text: string;
  date: string;
  language: "id" | "en";
}

export interface CopyworkEntry {
  id: string;
  bookId: string;
  bookTitle: string;
  quote: string;
  source: string; // chapter title
  date: string;
}

export interface VocabWord {
  id: string;
  word: string;
  context: string;
  bookId: string;
  bookTitle: string;
  date: string;
}

export interface ChapterProgress {
  bookId: string;
  chapterNumber: number;
  passageIndex: number; // 0-based, last read
  completed: boolean;
}

export interface ReadingSession {
  bookId: string;
  minutes: number;
  date: string; // ISO
}

export interface AppData {
  narrations: NarrationEntry[];
  copyworks: CopyworkEntry[];
  vocab: VocabWord[];
  progress: ChapterProgress[];
  sessions: ReadingSession[];
  streak: {
    current: number;
    longest: number;
    lastReadDate: string | null; // YYYY-MM-DD
    graceUsedOn: string | null;
  };
  preferredSession: number; // minutes
}

const KEY = "classiclingua:v1";

const initial: AppData = {
  narrations: [],
  copyworks: [],
  vocab: [],
  progress: [],
  sessions: [],
  streak: { current: 0, longest: 0, lastReadDate: null, graceUsedOn: null },
  preferredSession: 20,
};

function read(): AppData {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    return { ...initial, ...parsed };
  } catch {
    return initial;
  }
}

function write(data: AppData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("classiclingua:update"));
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86_400_000);
}

export function useAppData() {
  const [data, setData] = useState<AppData>(() => read());

  useEffect(() => {
    const refresh = () => setData(read());
    window.addEventListener("classiclingua:update", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("classiclingua:update", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const update = useCallback((mut: (d: AppData) => AppData) => {
    const next = mut(read());
    write(next);
    setData(next);
  }, []);

  const recordReading = useCallback(
    (bookId: string, minutes: number) => {
      update((d) => {
        const today = todayStr();
        const sessions = [...d.sessions, { bookId, minutes, date: new Date().toISOString() }];
        const last = d.streak.lastReadDate;
        let { current, longest, graceUsedOn } = d.streak;
        if (last === today) {
          // already counted today
        } else if (!last) {
          current = 1;
        } else {
          const gap = daysBetween(last, today);
          if (gap === 1) current += 1;
          else if (gap === 2 && graceUsedOn !== last) {
            // one-day grace
            current += 1;
            graceUsedOn = last;
          } else current = 1;
        }
        longest = Math.max(longest, current);
        return {
          ...d,
          sessions,
          streak: { current, longest, lastReadDate: today, graceUsedOn },
        };
      });
    },
    [update],
  );

  const setProgress = useCallback(
    (bookId: string, chapterNumber: number, passageIndex: number, completed = false) => {
      update((d) => {
        const others = d.progress.filter(
          (p) => !(p.bookId === bookId && p.chapterNumber === chapterNumber),
        );
        return {
          ...d,
          progress: [...others, { bookId, chapterNumber, passageIndex, completed }],
        };
      });
    },
    [update],
  );

  const addNarration = useCallback(
    (entry: Omit<NarrationEntry, "id" | "date">) => {
      update((d) => ({
        ...d,
        narrations: [
          { ...entry, id: crypto.randomUUID(), date: new Date().toISOString() },
          ...d.narrations,
        ],
      }));
    },
    [update],
  );

  const addCopywork = useCallback(
    (entry: Omit<CopyworkEntry, "id" | "date">) => {
      update((d) => ({
        ...d,
        copyworks: [
          { ...entry, id: crypto.randomUUID(), date: new Date().toISOString() },
          ...d.copyworks,
        ],
      }));
    },
    [update],
  );

  const addVocab = useCallback(
    (entry: Omit<VocabWord, "id" | "date">) => {
      update((d) => {
        const exists = d.vocab.find(
          (v) => v.word.toLowerCase() === entry.word.toLowerCase() && v.bookId === entry.bookId,
        );
        if (exists) return d;
        return {
          ...d,
          vocab: [
            { ...entry, id: crypto.randomUUID(), date: new Date().toISOString() },
            ...d.vocab,
          ],
        };
      });
    },
    [update],
  );

  const setPreferredSession = useCallback(
    (minutes: number) => update((d) => ({ ...d, preferredSession: minutes })),
    [update],
  );

  return {
    data,
    recordReading,
    setProgress,
    addNarration,
    addCopywork,
    addVocab,
    setPreferredSession,
  };
}

export function getBookProgress(data: AppData, bookId: string) {
  const narrations = data.narrations.filter((n) => n.bookId === bookId).length;
  const copyworks = data.copyworks.filter((c) => c.bookId === bookId).length;
  const chaptersStarted = data.progress.filter((p) => p.bookId === bookId).length;
  const chaptersDone = data.progress.filter((p) => p.bookId === bookId && p.completed).length;
  // plant level 1..5: 1 baseline + chaptersDone (capped) + narrations boost
  const depth = chaptersDone * 2 + narrations + copyworks;
  const level = Math.max(1, Math.min(5, 1 + Math.floor(depth / 2)));
  return { narrations, copyworks, chaptersStarted, chaptersDone, level };
}

export const PLANT_STAGES = ["🌱", "🌿", "🌾", "🌳", "🌸"] as const;
