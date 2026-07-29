import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import type { EpubChapter } from "@/lib/epubParser";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HorizontalReaderHandle {
  scrollToChapter: (index: number) => void;
}

interface HorizontalReaderProps {
  chapters: EpubChapter[];
  fontSize: number;
  fontFamily: string;
  textAlign: string;
  lineHeight: number;
  color: string;
  backgroundColor: string;
  onScrollProgress: (pct: number) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  columns?: number;
}

/**
 * Paginated horizontal EPUB reader using CSS multi-column layout.
 *
 * KEY MATH for page-aligned columns:
 *   column-gap   = 2 × PADDING
 *   column-width = containerWidth / N − 2 × PADDING
 */
export const HorizontalReader = forwardRef<HorizontalReaderHandle, HorizontalReaderProps>(
  function HorizontalReader(
    {
      chapters,
      fontSize,
      fontFamily,
      textAlign,
      lineHeight,
      color,
      backgroundColor,
      onScrollProgress,
      scrollRef,
      columns = 1,
    },
    ref,
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
      if (!scrollRef.current) return;
      const measure = () => {
        if (scrollRef.current) {
          setContainerWidth(scrollRef.current.clientWidth);
        }
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(scrollRef.current);
      return () => ro.disconnect();
    }, [scrollRef]);

    const effectiveColumns =
      containerWidth > 0 && containerWidth < 768 ? 1 : columns;

    const PAD_X = effectiveColumns === 2 ? 40 : 24;
    const cssGap = 2 * PAD_X;
    const colWidth =
      containerWidth > 0 ? containerWidth / effectiveColumns - 2 * PAD_X : 400;

    useEffect(() => {
      const container = scrollRef.current;
      const inner = innerRef.current;
      if (!container || !inner || containerWidth === 0) return;

      const measure = () => {
        const sw = inner.scrollWidth;
        const pages =
          containerWidth > 0 ? Math.max(1, Math.round(sw / containerWidth)) : 1;
        setPageCount(pages);
      };

      requestAnimationFrame(() => requestAnimationFrame(measure));

      const ro = new ResizeObserver(() => requestAnimationFrame(measure));
      ro.observe(inner);
      return () => ro.disconnect();
    }, [
      chapters,
      fontSize,
      fontFamily,
      textAlign,
      lineHeight,
      scrollRef,
      containerWidth,
      effectiveColumns,
    ]);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const onScroll = () => {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 0) {
          const pct = (el.scrollLeft / maxScroll) * 100;
          onScrollProgress(Math.min(100, Math.max(0, pct)));
          setCurrentPage(Math.round(el.scrollLeft / el.clientWidth));
        } else {
          onScrollProgress(0);
          setCurrentPage(0);
        }
      };
      el.addEventListener("scroll", onScroll, { passive: true });
      return () => el.removeEventListener("scroll", onScroll);
    }, [scrollRef, onScrollProgress]);

    const goPage = (dir: -1 | 1) => {
      if (!scrollRef.current) return;
      const w = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({ left: dir * w, behavior: "smooth" });
    };

    const isFirstPage = currentPage <= 0;
    const isLastPage = currentPage >= pageCount - 1;

    useImperativeHandle(
      ref,
      () => ({
        scrollToChapter: (index: number) => {
          const container = scrollRef.current;
          const chapterEl = document.getElementById(`chapter-${index}`);
          if (!container || !chapterEl) return;

          const cw = container.clientWidth;
          const chapterRect = chapterEl.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const targetScroll =
            container.scrollLeft + chapterRect.left - containerRect.left;
          const pageIndex = Math.round(targetScroll / cw);
          const scrollTarget = Math.max(0, pageIndex * cw);

          const originalSnap = container.style.scrollSnapType;
          container.style.scrollSnapType = "none";
          container.scrollTo({ left: scrollTarget, behavior: "smooth" });

          setTimeout(() => {
            container.style.scrollSnapType = originalSnap || "x mandatory";
          }, 700);
        },
      }),
      [scrollRef],
    );

    return (
      <>
        <style>{`
          .epub-col-inner img,
          .epub-col-inner figure,
          .epub-col-inner table {
            break-inside: avoid;
            max-width: 100%;
            max-height: calc(100dvh - 56px - 48px - 6rem);
            object-fit: contain;
          }
          .epub-col-inner h1,
          .epub-col-inner h2,
          .epub-col-inner h3,
          .epub-col-inner h4 {
            break-after: avoid;
          }
          .epub-col-inner * {
            overflow: visible !important;
          }
          .epub-col-inner p,
          .epub-col-inner div,
          .epub-col-inner span,
          .epub-col-inner img {
            max-width: 100% !important;
          }
        `}</style>

        <div
          ref={innerRef}
          className="epub-col-inner prose max-w-none prose-headings:font-serif prose-img:mx-auto prose-p:leading-relaxed"
          style={{
            columnWidth: `${colWidth}px`,
            columnGap: `${cssGap}px`,
            columnFill: "auto",
            width: "100%",
            height: "calc(100dvh - 56px - 48px)",
            padding: `3rem ${PAD_X}px`,
            boxSizing: "border-box",
            fontSize: `${fontSize}px`,
            fontFamily,
            textAlign: textAlign as "left" | "justify",
            lineHeight,
            color,
            backgroundColor,
            margin: 0,
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {chapters.map((chapter, idx) => (
            <div
              key={`${chapter.href}-${idx}`}
              id={`chapter-${idx}`}
              style={{ breakBefore: idx === 0 ? "avoid" : "column" }}
              dangerouslySetInnerHTML={{ __html: chapter.content || "" }}
            />
          ))}
        </div>

        {containerWidth > 0 &&
          Array.from({ length: Math.max(1, pageCount) }).map((_, i) => (
            <div
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                left: `${i * containerWidth}px`,
                top: 0,
                width: `${containerWidth}px`,
                height: "1px",
                scrollSnapAlign: "start",
                pointerEvents: "none",
              }}
            />
          ))}

        <button
          onClick={() => goPage(-1)}
          disabled={isFirstPage}
          className="fixed top-1/2 left-4 z-20 hidden -translate-y-1/2 rounded-full p-3 shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-30 md:block"
          style={{ backgroundColor, color }}
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={() => goPage(1)}
          disabled={isLastPage}
          className="fixed top-1/2 right-4 z-20 hidden -translate-y-1/2 rounded-full p-3 shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-30 md:block"
          style={{ backgroundColor, color }}
          title="Halaman Berikutnya"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </>
    );
  },
);
