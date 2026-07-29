import { createFileRoute, Link } from "@tanstack/react-router";
import { BOOKS } from "@/data/books";
import { useAppData, getBookProgress, PLANT_STAGES } from "@/store/appStore";
import { Sprout, Flame } from "lucide-react";

export const Route = createFileRoute("/taman-bacaan")({
  component: GardenPage,
  head: () => ({
    meta: [
      { title: "Taman Bacaan — Sinau" },
      {
        name: "description",
        content: "Tiap buku menjadi sebuah tanaman yang tumbuh dari kedalaman bacaanmu.",
      },
    ],
  }),
});

function GardenPage() {
  const { data } = useAppData();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">🌿 Taman Bacaan</p>
        <h1 className="ornament mt-1 font-display text-4xl text-ink">Tamanmu</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-ink-soft">
          Tanaman tumbuh dari kedalaman bacaan — dari narasi dan kalimat yang kamu salin — bukan dari
          kecepatan. Tidak ada perbandingan dengan orang lain. Hanya kamu dan bukumu.
        </p>
      </header>

      <div className="paper rounded-3xl p-6 md:p-10">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {BOOKS.map((b) => {
            const p = getBookProgress(data, b.id);
            const stage = PLANT_STAGES[p.level - 1];
            return (
              <div
                key={b.id}
                className="group relative flex flex-col items-center rounded-2xl border border-border bg-gradient-to-b from-parchment to-secondary/60 p-5 text-center"
              >
                <div className="mb-3 text-6xl animate-grow" style={{ animationDelay: `${p.level * 80}ms` }}>
                  {stage}
                </div>
                <p className="font-display text-base text-ink">{b.title}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-soft">
                  Tingkat {p.level} / 5
                </p>
                <p className="mt-3 text-xs text-ink-soft">
                  {p.narrations} narasi · {p.copyworks} salinan · {p.chaptersDone} bab tuntas
                </p>
                {b.fullyAvailable && (
                  <Link
                    to="/baca/$bookId"
                    params={{ bookId: b.id }}
                    className="mt-4 text-xs text-forest-deep underline-offset-4 hover:underline"
                  >
                    Sirami dengan bacaan →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <Flame className="h-6 w-6 text-flame animate-flicker" />
          <h3 className="mt-2 font-display text-xl">Api Membaca</h3>
          <p className="mt-1 text-3xl font-display text-flame">{data.streak.current} hari</p>
          <p className="mt-1 text-xs text-ink-soft">
            Terpanjang: {data.streak.longest} hari · Ada satu hari kelonggaran tiap kali.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <Sprout className="h-6 w-6 text-forest-deep" />
          <h3 className="mt-2 font-display text-xl">Catatan Lembut</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Jika api padam, jangan cemas. Tanaman tetap tumbuh. Kembalilah saat kamu siap — buku
            tidak ke mana-mana.
          </p>
        </div>
      </div>
    </div>
  );
}
