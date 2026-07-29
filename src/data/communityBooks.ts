import { kawanBacaSupabase } from "@/lib/communityBooksClient";

export interface ComparableBook {
  title: string;
  author: string;
  known_title?: boolean;
}

export interface CommunityAnalysis {
  metadata?: {
    title?: string;
    author?: string;
    language?: string;
    audience_category?: string;
    recommended_year_level?: string;
  };
  recommendation?: {
    usage_suggestions?: string;
    comparable_living_books?: ComparableBook[];
  };
  language_bridge?: {
    themes?: string[];
    style_samples?: string[];
    neutral_summary?: string;
    difficulty_level?: string;
  };
  score?: number | null;
}

export interface CommunityBook {
  id: string;
  title: string;
  author: string | null;
  thumbnail_url: string | null;
  storage_path: string | null;
  status: string | null;
  created_at: string | null;
  analysis_result: CommunityAnalysis | null;
}

export const AUDIENCE_LABEL: Record<string, string> = {
  A: "A · Anak Awal",
  B: "B · Anak Lanjut",
  C: "C · Remaja",
  D: "D · Dewasa",
};

export function audienceLabel(category?: string | null) {
  if (!category) return null;
  return AUDIENCE_LABEL[category] ?? category;
}

export async function fetchCommunityBooks(): Promise<CommunityBook[]> {
  const { data, error } = await kawanBacaSupabase
    .from("community_books")
    .select("id, title, author, thumbnail_url, storage_path, status, created_at, analysis_result")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as CommunityBook[];
}

export async function fetchCommunityBook(id: string): Promise<CommunityBook | null> {
  const { data, error } = await kawanBacaSupabase
    .from("community_books")
    .select("id, title, author, thumbnail_url, storage_path, status, created_at, analysis_result")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as CommunityBook | null) ?? null;
}
