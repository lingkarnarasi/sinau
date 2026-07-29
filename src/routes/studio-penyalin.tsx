import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAppData } from "@/store/appStore";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/studio-penyalin")({
  component: CopyworkPage,
  head: () => ({
    meta: [
      { title: "Studio Penyalin — Sinau" },
      {
        name: "description",
        content: "Salin kalimat-kalimat indah dari sastra klasik dengan tanganmu sendiri.",
      },
    ],
  }),
});

function CopyworkPage() {
  const { data } = useAppData();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const items = data.copyworks;
  const active = items.find((c) => c.id === activeId) ?? items[0];

  const accuracy = active
    ? computeAccuracy(typed, active.quote)
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">✍️ Studio Penyalin</p>
        <h1 className="mt-1 font-display text-4xl text-ink">Galeri Kata Indahku</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Menyalin kalimat indah dengan tangan adalah salah satu metode tertua dan paling jujur
          untuk belajar bahasa. Pilih satu kalimat, lalu salin perlahan — biarkan ritme dan irama
          masuk ke jari-jarimu.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="paper rounded-2xl p-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-forest-deep" />
          <h3 className="mt-3 font-display text-2xl">Galerimu masih kosong</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Saat membaca, sentuh sebuah kalimat dan kirim ke Studio. Kalimat itu akan menanti di
            sini, untuk kamu salin kapan pun.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
          <ul className="space-y-3">
            {items.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    setActiveId(c.id);
                    setTyped("");
                  }}
                  className={`w-full rounded-xl border p-4 text-left text-sm transition ${
                    active?.id === c.id
                      ? "border-forest bg-secondary"
                      : "border-border bg-card hover:bg-secondary/60"
                  }`}
                >
                  <p className="font-serif italic leading-relaxed">“{c.quote}”</p>
                  <p className="mt-2 text-xs text-ink-soft">
                    {c.bookTitle} · {c.source}
                  </p>
                </button>
              </li>
            ))}
          </ul>
          {active && (
            <div className="paper rounded-2xl p-6">
              <p className="text-xs uppercase tracking-wider text-forest-deep">Salinan Kalimat</p>
              <blockquote className="mt-2 border-l-2 border-gold pl-4 font-serif text-lg leading-relaxed text-ink">
                {active.quote}
              </blockquote>
              <p className="mt-2 text-xs italic text-ink-soft">
                — {active.bookTitle}, {active.source}
              </p>
              <textarea
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Salin di sini perlahan..."
                className="mt-5 h-40 w-full resize-none rounded-lg border border-input bg-parchment p-3 font-serif leading-relaxed outline-none focus:border-forest"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-ink-soft">
                <span>
                  Akurasi pribadi:{" "}
                  <span className="font-medium text-forest-deep">{accuracy}%</span>{" "}
                  <span className="opacity-60">(disimpan untukmu, tidak dibagikan)</span>
                </span>
                <button
                  onClick={() => {
                    if (typed.trim().length === 0) return;
                    toast.success("Latihan tersimpan secara pribadi 🌿");
                  }}
                  className="rounded-full bg-forest px-3 py-1 text-primary-foreground hover:bg-forest-deep"
                >
                  Selesaikan latihan
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function computeAccuracy(typed: string, target: string): number {
  if (!typed) return 0;
  const t = typed.trim();
  const g = target.trim();
  const len = Math.max(t.length, g.length);
  let matches = 0;
  for (let i = 0; i < Math.min(t.length, g.length); i++) {
    if (t[i] === g[i]) matches++;
  }
  return Math.round((matches / len) * 100);
}
