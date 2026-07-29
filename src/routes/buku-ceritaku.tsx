import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppData } from "@/store/appStore";
import { Feather } from "lucide-react";

export const Route = createFileRoute("/buku-ceritaku")({
  component: JournalPage,
  head: () => ({
    meta: [
      { title: "Buku Ceritaku — Sinau" },
      {
        name: "description",
        content: "Arsip narasi pribadimu — caramu menyimpan ingatan dari setiap bab.",
      },
    ],
  }),
});

function JournalPage() {
  const { data } = useAppData();
  const list = data.narrations;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">📓 Buku Ceritaku</p>
        <h1 className="mt-1 font-display text-4xl text-ink">Arsip Narasi</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Narasi adalah ujian sejati menurut Charlotte Mason: bukan tes pilihan ganda, melainkan
          ceritamu sendiri tentang apa yang kamu pahami. Tidak ada nilai. Hanya milikmu.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="paper rounded-2xl p-10 text-center">
          <Feather className="mx-auto h-8 w-8 text-forest-deep" />
          <h3 className="mt-3 font-display text-2xl">Belum ada narasi</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Mulailah membaca dan tuliskan kembali apa yang kamu ingat — itulah cara terbaik untuk
            memiliki sebuah cerita.
          </p>
          <Link
            to="/perpustakaan"
            className="mt-5 inline-flex rounded-full bg-forest px-4 py-2 text-sm text-primary-foreground hover:bg-forest-deep"
          >
            Buka Perpustakaan
          </Link>
        </div>
      ) : (
        <ol className="space-y-5">
          {list.map((n) => (
            <li key={n.id} className="paper rounded-2xl p-6">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-xs text-ink-soft">
                <span className="font-medium uppercase tracking-wider text-forest-deep">
                  {n.bookTitle} · Bab {n.chapterNumber}: {n.chapterTitle}
                </span>
                <time>{new Date(n.date).toLocaleDateString("id-ID", { dateStyle: "long" })}</time>
              </div>
              <p className="font-serif text-base leading-relaxed text-ink whitespace-pre-wrap">
                {n.text}
              </p>
              <p className="mt-3 text-xs text-ink-soft">
                {n.text.trim().split(/\s+/).filter(Boolean).length} kata ·{" "}
                {n.language === "id" ? "Bahasa Indonesia" : "English"}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
