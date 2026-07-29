import { Link } from "@tanstack/react-router";
import type { Book } from "@/data/books";

export function BookCover({ book, size = "md" }: { book: Book; size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "lg"
      ? "h-64 w-44"
      : size === "sm"
        ? "h-32 w-22"
        : "h-44 w-32";
  return (
    <div
      className={`relative ${dims} shrink-0 overflow-hidden rounded-md shadow-leaf bg-gradient-to-br ${book.cover}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
      <div className="absolute inset-0 flex flex-col justify-between p-3 text-white">
        <div className="text-3xl drop-shadow-sm">{book.coverEmoji}</div>
        <div>
          <div className="font-display text-base leading-tight drop-shadow-sm">{book.title}</div>
          <div className="mt-1 text-[10px] uppercase tracking-wider opacity-90">{book.author}</div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/20 to-transparent" />
    </div>
  );
}

export function BookCard({ book }: { book: Book }) {
  const inner = (
    <div className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-leaf">
      <div className="mx-auto">
        <BookCover book={book} />
      </div>
      <div className="mt-2">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-forest-deep">
            {book.level}
          </span>
          <span className="text-[10px] text-ink-soft">{book.year}</span>
        </div>
        <h3 className="mt-2 font-display text-lg leading-tight text-ink">{book.title}</h3>
        <p className="text-xs text-ink-soft">{book.author}</p>
        <p className="mt-2 line-clamp-3 text-xs text-ink-soft">{book.descriptionId}</p>
      </div>
      <div className="mt-auto pt-2">
        {book.fullyAvailable ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-forest">
            ↳ Mulai membaca
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs italic text-ink-soft">
            Segera hadir
          </span>
        )}
      </div>
    </div>
  );

  if (book.fullyAvailable) {
    return (
      <Link to="/baca/$bookId" params={{ bookId: book.id }} className="block h-full">
        {inner}
      </Link>
    );
  }
  return <div className="h-full opacity-80">{inner}</div>;
}
