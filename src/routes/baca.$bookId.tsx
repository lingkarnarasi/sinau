import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getBook, type Book, type BookChapter } from "@/data/books";
import { useAppData } from "@/store/appStore";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  BellOff,
  Feather,
  Sparkles,
  BookOpen,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/baca/$bookId")({
  loader: ({ params }) => {
    const book = getBook(params.bookId);
    if (!book || !book.fullyAvailable) throw notFound();
    return { book };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl">Buku belum tersedia</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Karya ini akan segera kami buka. Sementara itu, jelajahi judul lain di Perpustakaan.
      </p>
      <Link
        to="/perpustakaan"
        className="mt-6 inline-flex items-center rounded-full bg-forest px-4 py-2 text-sm text-primary-foreground"
      >
        Kembali ke Perpustakaan
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl">Ada yang tidak beres</h1>
      <p className="mt-2 text-sm text-destructive">{error.message}</p>
    </div>
  ),
  component: ReaderPage,
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.book.title} — Sinau` },
      {
        name: "description",
        content: `Baca ${loaderData?.book.title} oleh ${loaderData?.book.author} dwibahasa Inggris–Indonesia.`,
      },
    ],
  }),
});

const SESSION_OPTIONS = [15, 20, 30, 45] as const;

function ReaderPage() {
  const { book } = Route.useLoaderData() as { book: Book };
  const { data, setProgress, recordReading, addNarration, addCopywork, addVocab, setPreferredSession } =
    useAppData();

  const [chapterIdx, setChapterIdx] = useState(0);
  const chapter = book.chapters[chapterIdx];
  const [passageIdx, setPassageIdx] = useState(0);

  // Restore last position
  useEffect(() => {
    const last = data.progress.find((p) => p.bookId === book.id);
    if (last) {
      const ci = book.chapters.findIndex((c) => c.number === last.chapterNumber);
      if (ci >= 0) {
        setChapterIdx(ci);
        setPassageIdx(Math.min(last.passageIndex, book.chapters[ci].passages.length - 1));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);

  // Save progress on change
  useEffect(() => {
    setProgress(book.id, chapter.number, passageIdx, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id, chapter.number, passageIdx]);

  const passage = chapter.passages[passageIdx];
  const totalPassages = chapter.passages.length;

  const goPrev = () => {
    if (passageIdx > 0) setPassageIdx((i) => i - 1);
    else if (chapterIdx > 0) {
      const prev = book.chapters[chapterIdx - 1];
      setChapterIdx(chapterIdx - 1);
      setPassageIdx(prev.passages.length - 1);
    }
  };
  const goNext = () => {
    if (passageIdx < totalPassages - 1) setPassageIdx((i) => i + 1);
    else if (chapterIdx < book.chapters.length - 1) {
      setProgress(book.id, chapter.number, totalPassages - 1, true);
      setChapterIdx(chapterIdx + 1);
      setPassageIdx(0);
      toast.success(`Bab "${chapter.titleId}" selesai. Lanjut ke bab berikutnya 🌿`);
    } else {
      setProgress(book.id, chapter.number, totalPassages - 1, true);
      toast.success("Selamat — kamu menyelesaikan semua bab yang tersedia.");
    }
  };

  // ── Bel Pelajaran (session timer) ─────────────────────────────────────────
  const [sessionMin, setSessionMin] = useState(data.preferredSession);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(sessionMin * 60);
  const startedAt = useRef<number | null>(null);
  useEffect(() => {
    setRemaining(sessionMin * 60);
  }, [sessionMin]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          const elapsed = sessionMin;
          recordReading(book.id, elapsed);
          toast("🔔 Bel Pelajaran berbunyi — istirahatlah sejenak.", {
            description: "Sesi singkat menumbuhkan perhatian yang dalam.",
          });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, sessionMin, book.id, recordReading]);
  const startSession = () => {
    setRemaining(sessionMin * 60);
    startedAt.current = Date.now();
    setRunning(true);
    setPreferredSession(sessionMin);
    toast(`Bel Pelajaran dimulai — ${sessionMin} menit.`);
  };
  const stopSession = () => {
    setRunning(false);
    if (startedAt.current) {
      const min = Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000));
      recordReading(book.id, min);
      startedAt.current = null;
    }
  };
  const mm = Math.floor(remaining / 60).toString().padStart(2, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");

  // ── Narration dialog ───────────────────────────────────────────────────────
  const [narrationOpen, setNarrationOpen] = useState(false);
  const [narrationText, setNarrationText] = useState("");
  const [narrationLang, setNarrationLang] = useState<"id" | "en">("id");
  const wordCount = useMemo(
    () => narrationText.trim().split(/\s+/).filter(Boolean).length,
    [narrationText],
  );
  const submitNarration = () => {
    if (wordCount < 30) {
      toast.error("Tuliskan setidaknya 30 kata — narasi tumbuh dari ingatan utuh.");
      return;
    }
    addNarration({
      bookId: book.id,
      bookTitle: book.title,
      chapterNumber: chapter.number,
      chapterTitle: chapter.titleId,
      text: narrationText.trim(),
      language: narrationLang,
    });
    setNarrationOpen(false);
    setNarrationText("");
    toast.success("Narasi tersimpan di Buku Ceritaku 📓");
  };

  // ── Copy sentence to studio ────────────────────────────────────────────────
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const handleSentenceClick = (sentence: string) => {
    setSelectedSentence(sentence);
  };
  const saveSentence = () => {
    if (!selectedSentence) return;
    addCopywork({
      bookId: book.id,
      bookTitle: book.title,
      quote: selectedSentence,
      source: chapter.titleId,
    });
    toast.success("Kalimat masuk ke Galeri Kata Indahmu ✨");
    setSelectedSentence(null);
  };

  // ── Vocab tap ──────────────────────────────────────────────────────────────
  const handleWord = (word: string) => {
    const clean = word.replace(/[^A-Za-z'\-]/g, "");
    if (clean.length < 3) return;
    addVocab({
      word: clean,
      context: passage.en,
      bookId: book.id,
      bookTitle: book.title,
    });
    toast(`"${clean}" ditambahkan ke Peta Kata`, { duration: 2200 });
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/perpustakaan" className="text-xs text-ink-soft hover:text-ink">
            ← Perpustakaan
          </Link>
          <h1 className="mt-1 font-display text-2xl text-ink">{book.title}</h1>
          <p className="text-xs italic text-ink-soft">{book.author}</p>
        </div>
        <div className="flex items-center gap-2">
          <SessionTimer
            running={running}
            remaining={`${mm}:${ss}`}
            sessionMin={sessionMin}
            onChange={setSessionMin}
            onStart={startSession}
            onStop={stopSession}
          />
        </div>
      </div>

      {/* Chapter selector */}
      <ChapterStrip
        chapters={book.chapters}
        currentIdx={chapterIdx}
        onSelect={(i) => {
          setChapterIdx(i);
          setPassageIdx(0);
        }}
      />

      {/* Bitext reader */}
      <article className="paper mt-6 rounded-2xl p-6 md:p-10">
        <header className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
            Bab {chapter.number} · Paragraf {passageIdx + 1} dari {totalPassages}
          </p>
          <h2 className="ornament mt-2 font-display text-3xl text-ink">{chapter.titleId}</h2>
          <p className="text-sm italic text-ink-soft">{chapter.title}</p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-forest-deep">
              English (Original)
            </p>
            <Sentences text={passage.en} onWordTap={handleWord} onSentence={handleSentenceClick} />
          </div>
          <div className="md:border-l md:border-border md:pl-10">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-forest-deep">
              Bahasa Indonesia
            </p>
            <p className="font-serif text-lg leading-[1.8] text-ink">{passage.id}</p>
          </div>
        </div>

        {/* Sentence action prompt */}
        {selectedSentence && (
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-gold-soft bg-gold-soft/40 p-4 text-sm">
            <Sparkles className="h-4 w-4 text-forest-deep" />
            <span className="flex-1 italic">“{selectedSentence}”</span>
            <button
              onClick={saveSentence}
              className="rounded-full bg-forest px-3 py-1 text-xs text-primary-foreground hover:bg-forest-deep"
            >
              Salin ke Studio
            </button>
            <button
              onClick={() => setSelectedSentence(null)}
              className="text-xs text-ink-soft hover:text-ink"
            >
              Batal
            </button>
          </div>
        )}

        {/* Action bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <button
            onClick={goPrev}
            disabled={chapterIdx === 0 && passageIdx === 0}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-parchment px-4 py-1.5 text-sm text-ink disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Sebelumnya
          </button>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setNarrationOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-forest/40 bg-secondary px-4 py-1.5 text-sm text-forest-deep hover:bg-secondary/70"
            >
              <Feather className="h-4 w-4" /> Tulis Narasi
            </button>
            <Link
              to="/studio-penyalin"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-parchment px-4 py-1.5 text-sm text-ink hover:bg-secondary"
            >
              <Sparkles className="h-4 w-4" /> Studio Penyalin
            </Link>
          </div>
          <button
            onClick={goNext}
            className="inline-flex items-center gap-1 rounded-full bg-forest px-4 py-1.5 text-sm text-primary-foreground hover:bg-forest-deep"
          >
            Lanjut <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-ink-soft">
          💡 Sentuh sebuah <em>kata</em> untuk menambah ke Peta Kata. Sentuh sebuah{" "}
          <em>kalimat</em> untuk menyalinnya ke Studio.
        </p>
      </article>

      {/* Narration dialog */}
      {narrationOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setNarrationOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-leaf"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl text-ink">Tulis Narasimu</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Tutup mata sejenak, lalu ceritakan kembali apa yang baru kamu baca dengan kata-katamu
              sendiri. Tidak ada yang menilai — hanya kamu dan buku.
            </p>
            <div className="mt-4 flex gap-2 text-xs">
              {(["id", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setNarrationLang(l)}
                  className={`rounded-full border px-3 py-1 ${
                    narrationLang === l
                      ? "border-forest bg-forest text-primary-foreground"
                      : "border-border bg-parchment text-ink-soft"
                  }`}
                >
                  {l === "id" ? "Bahasa Indonesia" : "English"}
                </button>
              ))}
            </div>
            <textarea
              autoFocus
              value={narrationText}
              onChange={(e) => setNarrationText(e.target.value)}
              placeholder={
                narrationLang === "id"
                  ? "Mary tinggal di India... lalu kolera datang..."
                  : "Mary lived in India... then cholera came..."
              }
              className="mt-4 h-48 w-full resize-none rounded-lg border border-input bg-parchment p-3 font-serif text-base leading-relaxed outline-none focus:border-forest"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-ink-soft">
              <span>
                {wordCount} kata{" "}
                <span className="opacity-60">
                  · target 150–300 kata, minimum 30 untuk menyimpan
                </span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setNarrationOpen(false)}
                  className="rounded-full px-3 py-1 hover:bg-secondary"
                >
                  Tutup
                </button>
                <button
                  onClick={submitNarration}
                  className="rounded-full bg-forest px-4 py-1.5 text-primary-foreground hover:bg-forest-deep"
                >
                  Simpan ke Buku Ceritaku
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterStrip({
  chapters,
  currentIdx,
  onSelect,
}: {
  chapters: BookChapter[];
  currentIdx: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {chapters.map((c, i) => (
        <button
          key={c.number}
          onClick={() => onSelect(i)}
          className={`rounded-full border px-3 py-1 text-xs transition ${
            i === currentIdx
              ? "border-forest bg-forest text-primary-foreground"
              : "border-border bg-parchment text-ink-soft hover:bg-secondary"
          }`}
        >
          <span className="font-medium">Bab {c.number}</span>
          <span className="ml-1.5 opacity-80">{c.titleId}</span>
        </button>
      ))}
    </div>
  );
}

function Sentences({
  text,
  onWordTap,
  onSentence,
}: {
  text: string;
  onWordTap: (w: string) => void;
  onSentence: (s: string) => void;
}) {
  const sentences = text.match(/[^.!?]+[.!?]+["']?/g) ?? [text];
  return (
    <p className="font-serif text-lg leading-[1.8] text-ink">
      {sentences.map((s, si) => (
        <span
          key={si}
          className="cursor-pointer rounded transition hover:bg-gold-soft/40"
          onClick={(e) => {
            // sentence click only when not clicking a word handler
            if ((e.target as HTMLElement).dataset.word) return;
            onSentence(s.trim());
          }}
        >
          {s.split(/(\s+)/).map((tok, ti) =>
            /\s+/.test(tok) ? (
              <span key={ti}>{tok}</span>
            ) : (
              <span
                key={ti}
                data-word="1"
                className="hover:underline hover:decoration-forest hover:decoration-dotted hover:underline-offset-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onWordTap(tok);
                }}
              >
                {tok}
              </span>
            ),
          )}
        </span>
      ))}
    </p>
  );
}

function SessionTimer({
  running,
  remaining,
  sessionMin,
  onChange,
  onStart,
  onStop,
}: {
  running: boolean;
  remaining: string;
  sessionMin: number;
  onChange: (m: number) => void;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-parchment px-3 py-1.5 text-xs">
      {running ? <Bell className="h-3.5 w-3.5 text-flame" /> : <BellOff className="h-3.5 w-3.5" />}
      <span className="font-medium">Bel Pelajaran</span>
      {!running ? (
        <>
          <select
            value={sessionMin}
            onChange={(e) => onChange(Number(e.target.value))}
            className="rounded bg-transparent text-xs outline-none"
          >
            {SESSION_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} menit
              </option>
            ))}
          </select>
          <button
            onClick={onStart}
            className="rounded-full bg-forest px-2.5 py-0.5 text-[11px] text-primary-foreground"
          >
            Mulai
          </button>
        </>
      ) : (
        <>
          <span className="font-mono text-sm text-flame">{remaining}</span>
          <button
            onClick={onStop}
            className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-ink-soft hover:bg-secondary"
          >
            Berhenti
          </button>
        </>
      )}
    </div>
  );
}
