import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppData } from "@/store/appStore";
import { Map } from "lucide-react";

export const Route = createFileRoute("/peta-kata")({
  component: VocabPage,
  head: () => ({
    meta: [
      { title: "Peta Kata Temuan — Sinau" },
      {
        name: "description",
        content: "Kata-kata yang kamu temukan dalam konteks bacaan klasik.",
      },
    ],
  }),
});

function VocabPage() {
  const { data } = useAppData();
  const [active, setActive] = useState<string | null>(null);
  const items = data.vocab;
  const current = items.find((v) => v.id === active) ?? items[0];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">🗺️ Peta Kata Temuan</p>
        <h1 className="mt-1 font-display text-4xl text-ink">Kata yang Kamu Temukan</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Tidak ada kartu hafalan. Setiap kata di sini hidup di dalam kalimat tempat kamu
          menemukannya — itulah cara kata-kata bertahan di ingatan.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="paper rounded-2xl p-10 text-center">
          <Map className="mx-auto h-8 w-8 text-forest-deep" />
          <h3 className="mt-3 font-display text-2xl">Petamu masih kosong</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Sentuh sebuah kata dalam pembaca untuk menambahkannya ke peta.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <div className="flex flex-wrap gap-2">
            {items.map((v) => (
              <button
                key={v.id}
                onClick={() => setActive(v.id)}
                className={`rounded-full border px-3 py-1.5 font-serif text-base transition ${
                  current?.id === v.id
                    ? "border-forest bg-forest text-primary-foreground"
                    : "border-border bg-parchment text-ink hover:bg-secondary"
                }`}
              >
                {v.word}
              </button>
            ))}
          </div>
          {current && (
            <aside className="paper sticky top-24 self-start rounded-2xl p-6">
              <p className="text-xs uppercase tracking-wider text-forest-deep">Konteks</p>
              <h2 className="mt-1 font-display text-3xl">{current.word}</h2>
              <p className="mt-1 text-xs text-ink-soft">
                Ditemukan di {current.bookTitle} ·{" "}
                {new Date(current.date).toLocaleDateString("id-ID")}
              </p>
              <blockquote className="mt-4 border-l-2 border-gold pl-4 font-serif text-base leading-relaxed italic text-ink">
                {current.context}
              </blockquote>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
