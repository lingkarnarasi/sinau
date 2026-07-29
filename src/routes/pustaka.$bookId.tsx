import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCommunityBook, audienceLabel } from "@/data/communityBooks";
import { CommunityBookCover } from "@/components/CommunityBookCard";
import { EpubReader } from "@/components/EpubReader";
import { BookOpen, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/pustaka/$bookId")({
  component: PustakaBookPage,
  head: ({ params }) => ({
    meta: [
      { title: `Buku — Sinau` },
      {
        name: "description",
        content: `Baca buku komunitas Kawan Baca dengan tenang dan penuh perhatian.`,
      },
    ],
  }),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="font-display text-2xl text-ink">Ada yang tidak beres</h1>
        <p className="mt-2 text-sm text-ink-soft">{error.message}</p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full border border-border bg-card px-4 py-1.5 text-sm hover:bg-secondary"
          >
            Coba lagi
          </button>
          <Link
            to="/perpustakaan"
            className="rounded-full bg-forest px-4 py-1.5 text-sm text-primary-foreground"
          >
            Kembali ke Perpustakaan
          </Link>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-16 text-center">
      <h1 className="font-display text-2xl text-ink">Buku tidak ditemukan</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Mungkin buku ini sudah ditarik atau tautannya keliru.
      </p>
      <Link
        to="/perpustakaan"
        className="mt-4 inline-block rounded-full bg-forest px-4 py-1.5 text-sm text-primary-foreground"
      >
        Kembali ke Perpustakaan
      </Link>
    </div>
  ),
});

function PustakaBookPage() {
  const { bookId } = Route.useParams();
  const [reading, setReading] = useState(false);

  const { data: book, isLoading, error } = useQuery({
    queryKey: ["community-book", bookId],
    queryFn: () => fetchCommunityBook(bookId),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-12">
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-card/50" />
      </div>
    );
  }

  if (error) throw error;
  if (!book) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="font-display text-2xl text-ink">Buku tidak ditemukan</h1>
        <Link
          to="/perpustakaan"
          className="mt-4 inline-block rounded-full bg-forest px-4 py-1.5 text-sm text-primary-foreground"
        >
          Kembali ke Perpustakaan
        </Link>
      </div>
    );
  }

  const meta = book.analysis_result?.metadata;
  const rec = book.analysis_result?.recommendation;
  const lb = book.analysis_result?.language_bridge;
  const audience = audienceLabel(meta?.audience_category);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link
        to="/perpustakaan"
        className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-3 w-3" /> Perpustakaan
      </Link>

      {!reading && (
        <>
          <header className="mt-4 grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
            <div className="mx-auto md:mx-0">
              <CommunityBookCover book={book} size="lg" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                Pustaka Kawan Baca
              </p>
              <h1 className="mt-1 font-display text-3xl text-ink md:text-4xl">
                {book.title}
              </h1>
              {book.author && (
                <p className="mt-1 text-sm text-ink-soft">oleh {book.author}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {audience && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-forest-deep">
                    {audience}
                  </span>
                )}
                {meta?.recommended_year_level && (
                  <span className="rounded-full border border-border px-3 py-1 text-xs text-ink-soft">
                    {meta.recommended_year_level}
                  </span>
                )}
                {meta?.language && (
                  <span className="rounded-full border border-border px-3 py-1 text-xs text-ink-soft">
                    {meta.language}
                  </span>
                )}
                {lb?.difficulty_level && (
                  <span className="rounded-full border border-border px-3 py-1 text-xs text-ink-soft">
                    Tingkat: {lb.difficulty_level}
                  </span>
                )}
              </div>

              {lb?.neutral_summary && (
                <p className="mt-4 text-sm leading-relaxed text-ink">
                  {lb.neutral_summary}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {book.storage_path ? (
                  <button
                    onClick={() => setReading(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2 text-sm text-primary-foreground shadow-leaf hover:bg-forest-deep"
                  >
                    <BookOpen className="h-4 w-4" /> Mulai Membaca
                  </button>
                ) : (
                  <span className="rounded-full border border-border px-4 py-2 text-xs text-ink-soft">
                    File buku belum tersedia.
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Curator recommendation */}
          {(lb?.themes?.length ||
            rec?.usage_suggestions ||
            rec?.comparable_living_books?.length) && (
            <section className="mt-10 rounded-2xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                Rekomendasi Kurator
              </p>
              <h2 className="mt-1 font-display text-xl text-ink">
                Cara membaca dengan lembut
              </h2>

              {rec?.usage_suggestions && (
                <p className="mt-3 text-sm italic leading-relaxed text-ink">
                  "{rec.usage_suggestions}"
                </p>
              )}

              {lb?.themes && lb.themes.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">
                    Tema
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {lb.themes.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-parchment px-3 py-0.5 text-xs text-ink-soft"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {lb?.style_samples && lb.style_samples.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">
                    Cuplikan gaya
                  </p>
                  <ul className="mt-2 space-y-2">
                    {lb.style_samples.slice(0, 3).map((s, i) => (
                      <li
                        key={i}
                        className="rounded-md border-l-2 border-forest/40 bg-parchment/60 px-3 py-2 text-xs italic text-ink-soft"
                      >
                        "{s}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rec?.comparable_living_books &&
                rec.comparable_living_books.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">
                      Buku hidup yang serupa
                    </p>
                    <ul className="mt-2 grid gap-1 text-sm text-ink sm:grid-cols-2">
                      {rec.comparable_living_books.map((b, i) => (
                        <li key={i} className="text-xs">
                          <span className="font-medium">{b.title}</span>
                          {b.author && (
                            <span className="text-ink-soft"> — {b.author}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </section>
          )}
        </>
      )}

      {reading && book.storage_path && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-soft">
                Sedang membaca
              </p>
              <h2 className="font-display text-lg text-ink">{book.title}</h2>
            </div>
            <button
              onClick={() => setReading(false)}
              className="hidden rounded-full border border-border bg-card px-3 py-1 text-xs hover:bg-secondary lg:inline-flex"
            >
              Tutup pembaca
            </button>
          </div>
          <EpubReader
            bookId={book.id}
            bookTitle={book.title}
            url={book.storage_path}
            onClose={() => setReading(false)}
          />
        </div>
      )}
    </div>
  );
}
