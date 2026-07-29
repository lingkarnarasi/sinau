import { Link } from "@tanstack/react-router";
import { type CommunityBook } from "@/data/communityBooks";
import { Book3D } from "./Book3D";

const SPINE_COLORS = [
  "#3b2314",
  "#1a1a2e",
  "#2d3a1a",
  "#4a1a2e",
  "#1a3a4a",
  "#3a2a1a",
];

function spineColorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return SPINE_COLORS[h % SPINE_COLORS.length];
}

export function CommunityBookCover({
  book,
  size = "md",
}: {
  book: CommunityBook;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg"
      ? { w: 176, h: 256 }
      : size === "sm"
        ? { w: 88, h: 128 }
        : { w: 128, h: 176 };

  return (
    <Book3D
      coverImage={book.thumbnail_url ?? undefined}
      title={book.title}
      spineColor={spineColorFor(book.id)}
      width={dims.w}
      height={dims.h}
      
    />
  );
}

export function CommunityBookCard({ book }: { book: CommunityBook }) {
  const rec = book.analysis_result?.recommendation;

  return (
    <article className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-leaf">
      <Link
        to="/pustaka/$bookId"
        params={{ bookId: book.id }}
        className="mx-auto"
        aria-label={`Buka ${book.title}`}
      >
        <CommunityBookCover book={book} />
      </Link>
      <div>
        <Link
          to="/pustaka/$bookId"
          params={{ bookId: book.id }}
          className="font-display text-lg leading-tight text-ink hover:text-forest-deep"
        >
          {book.title}
        </Link>
        {book.author && <p className="text-xs text-ink-soft">{book.author}</p>}
        <Link
          to="/pustaka/$bookId"
          params={{ bookId: book.id }}
          className="mt-3 inline-flex items-center gap-1 text-xs text-forest-deep hover:underline"
        >
          Baca →
        </Link>
      </div>
      {rec?.usage_suggestions && (
        <div className="mt-auto space-y-1.5 border-t border-border/60 pt-3 text-[11px] text-ink-soft">
          <p className="italic">"{rec.usage_suggestions}"</p>
        </div>
      )}
    </article>
  );
}
