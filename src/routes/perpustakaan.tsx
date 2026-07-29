import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCommunityBooks, AUDIENCE_LABEL } from "@/data/communityBooks";
import { CommunityBookCard } from "@/components/CommunityBookCard";

export const Route = createFileRoute("/perpustakaan")({
  component: LibraryPage,
  head: () => ({
    meta: [
      { title: "Perpustakaan — Sinau" },
      {
        name: "description",
        content:
          "Koleksi buku komunitas Kawan Baca dengan rekomendasi level audiens dan tingkat kesulitan.",
      },
    ],
  }),
});

const AUDIENCE_FILTERS: { value: string; label: string }[] = [
  { value: "Semua", label: "Semua" },
  { value: "A", label: AUDIENCE_LABEL.A },
  { value: "B", label: AUDIENCE_LABEL.B },
  { value: "C", label: AUDIENCE_LABEL.C },
  { value: "D", label: AUDIENCE_LABEL.D },
];

function LibraryPage() {
  const [filter, setFilter] = useState<string>("Semua");
  const { data: books = [], isLoading, error } = useQuery({
    queryKey: ["community-books"],
    queryFn: fetchCommunityBooks,
  });

  const filtered = useMemo(() => {
    if (filter === "Semua") return books;
    return books.filter(
      (b) => b.analysis_result?.metadata?.audience_category === filter,
    );
  }, [books, filter]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Perpustakaan Komunitas</p>
        <h1 className="mt-1 font-display text-4xl text-ink">Buku Pilihan Kawan Baca</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Koleksi buku yang dikurasi komunitas Kawan Baca, lengkap dengan rekomendasi audiens,
          level tahun, dan saran penggunaan untuk dibaca bersama anak.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        {AUDIENCE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              filter === f.value
                ? "border-forest bg-forest text-primary-foreground"
                : "border-border bg-parchment text-ink-soft hover:bg-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-xl border border-border bg-card/50"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          Gagal memuat buku: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <p className="text-sm text-ink-soft">Tidak ada buku untuk filter ini.</p>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((b) => (
            <CommunityBookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}
