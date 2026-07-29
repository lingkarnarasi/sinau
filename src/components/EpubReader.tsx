import { useState, useEffect, useCallback, useRef } from "react";
import { useAppData } from "@/store/appStore";
import { loadEpubChapters, type EpubChapter } from "@/lib/epubParser";
import {
  HorizontalReader,
  type HorizontalReaderHandle,
} from "@/components/HorizontalReader";
import {
  Menu,
  Minus,
  Plus,
  Sun,
  Moon,
  Coffee,
  AlignLeft,
  AlignJustify,
  Maximize,
  Minimize,
  Loader2,
  Settings,
  X,
} from "lucide-react";

function useIsTabletOrMobile() {
  const [is, setIs] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  });
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const handler = () => setIs(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return is;
}

type Theme = "light" | "dark" | "sepia";
type FontFamily = "Georgia" | "Merriweather" | "Inter" | "OpenDyslexic";
type TextAlign = "left" | "justify";

const THEMES: Record<Theme, { bg: string; text: string; sidebarBg: string; name: string }> = {
  light: { bg: "#ffffff", text: "#333333", sidebarBg: "#f8f9fa", name: "Terang" },
  dark: { bg: "#1a1a1a", text: "#e5e5e5", sidebarBg: "#252525", name: "Gelap" },
  sepia: { bg: "#f4ecd8", text: "#5b4636", sidebarBg: "#ebe4d4", name: "Sepia" },
};

const FONTS: Record<FontFamily, { name: string; font: string }> = {
  Georgia: { name: "Georgia", font: "Georgia, serif" },
  Merriweather: { name: "Merriweather", font: "'Merriweather', serif" },
  Inter: { name: "Inter", font: "'Inter', sans-serif" },
  OpenDyslexic: { name: "OpenDyslexic", font: "OpenDyslexic, sans-serif" },
};

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 28;
const DEFAULT_FONT_SIZE = 18;
const SIDEBAR_WIDTH = 280;

interface Props {
  bookId: string;
  bookTitle: string;
  url: string;
  onClose?: () => void;
}

const lsKey = (kind: string, bookId: string) => `sinau:epub:${kind}:${bookId}`;
const prefKey = (kind: string) => `sinau:epub:pref:${kind}`;

export function EpubReader({ bookId, bookTitle, url, onClose }: Props) {
  const { recordReading } = useAppData();
  const isTabletOrMobile = useIsTabletOrMobile();
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const horizontalReaderRef = useRef<HorizontalReaderHandle>(null);
  const sessionStartRef = useRef<number>(Date.now());

  const [chapters, setChapters] = useState<EpubChapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [forceVisualFullscreen, setForceVisualFullscreen] = useState(false);
  const [showNav, setShowNav] = useState(true);

  const [theme, setTheme] = useState<Theme>(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem(prefKey("theme")) : null;
    return (v as Theme) || "light";
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem(prefKey("fontSize")) : null;
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) ? n : DEFAULT_FONT_SIZE;
  });
  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem(prefKey("fontFamily")) : null;
    return (v as FontFamily) || "Merriweather";
  });
  const [textAlign, setTextAlign] = useState<TextAlign>(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem(prefKey("textAlign")) : null;
    return (v as TextAlign) || "left";
  });
  const [horizontalScrollProgress, setHorizontalScrollProgress] = useState(0);

  useEffect(() => {
    localStorage.setItem(prefKey("theme"), theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem(prefKey("fontSize"), String(fontSize));
  }, [fontSize]);
  useEffect(() => {
    localStorage.setItem(prefKey("fontFamily"), fontFamily);
  }, [fontFamily]);
  useEffect(() => {
    localStorage.setItem(prefKey("textAlign"), textAlign);
  }, [textAlign]);

  // Load EPUB
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Gagal mengunduh buku (${res.status})`);
        const buffer = await res.arrayBuffer();
        const parsed = await loadEpubChapters(buffer);
        if (!isMounted) return;
        setChapters(parsed);

        const savedChapter = localStorage.getItem(lsKey("chapter", bookId));
        const idx = savedChapter ? parseInt(savedChapter, 10) : 0;
        if (Number.isFinite(idx) && idx >= 0 && idx < parsed.length) {
          setCurrentChapter(idx);
        } else {
          setCurrentChapter(0);
        }
      } catch (err) {
        console.error("[EpubReader] failed to load", err);
        if (isMounted) {
          setLoadError(err instanceof Error ? err.message : "Gagal memuat buku");
          setChapters([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [bookId, url]);

  useEffect(() => {
    if (chapters.length > 0) {
      localStorage.setItem(lsKey("chapter", bookId), String(currentChapter));
    }
  }, [bookId, chapters.length, currentChapter]);

  useEffect(() => {
    if (chapters.length === 0) return;
    const t = setTimeout(() => {
      localStorage.setItem(lsKey("scroll", bookId), String(horizontalScrollProgress));
    }, 500);
    return () => clearTimeout(t);
  }, [bookId, horizontalScrollProgress, chapters.length]);

  useEffect(() => {
    if (chapters.length === 0 || loading) return;
    const saved = localStorage.getItem(lsKey("scroll", bookId));
    const pct = saved ? parseFloat(saved) : 0;
    if (!pct || pct <= 0) return;
    const t = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = contentAreaRef.current;
          if (el) {
            const max = el.scrollWidth - el.clientWidth;
            el.scrollLeft = (pct / 100) * max;
          }
        });
      });
    }, 600);
    return () => clearTimeout(t);
  }, [bookId, chapters, loading]);

  useEffect(() => {
    sessionStartRef.current = Date.now();
    return () => {
      const elapsedMs = Date.now() - sessionStartRef.current;
      const minutes = Math.round(elapsedMs / 60000);
      if (minutes >= 1) {
        try {
          recordReading(bookId, minutes);
        } catch (err) {
          console.warn("[EpubReader] recordReading failed", err);
        }
      }
    };
  }, [bookId, recordReading]);

  const goToChapter = useCallback(
    (index: number) => {
      if (index < 0 || index >= chapters.length) return;
      setCurrentChapter(index);
      setSidebarOpen(false);

      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            horizontalReaderRef.current?.scrollToChapter(index);
          });
        });
      }, 400);
    },
    [chapters.length],
  );

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("[EpubReader] fullscreen toggle failed", err);
    }
  }, []);

  useEffect(() => {
    const handle = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handle);
    return () => document.removeEventListener("fullscreenchange", handle);
  }, []);

  // Auto-fullscreen on mobile/tablet
  useEffect(() => {
    if (loading || !isTabletOrMobile) return;
    let cancelled = false;
    (async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        if (!cancelled) setForceVisualFullscreen(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, isTabletOrMobile]);

  // Cleanup fullscreen on unmount
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  const handleClose = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
    setForceVisualFullscreen(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        contentAreaRef.current?.scrollBy({
          left: -(contentAreaRef.current?.clientWidth || 200),
          behavior: "smooth",
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        contentAreaRef.current?.scrollBy({
          left: contentAreaRef.current?.clientWidth || 200,
          behavior: "smooth",
        });
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
      } else if (e.key === "+" || e.key === "=") {
        setFontSize((s) => Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, s + 2)));
      } else if (e.key === "-") {
        setFontSize((s) => Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, s - 2)));
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen?.();
      } else if (e.key === "b" || e.key === "B") {
        setSidebarOpen((s) => !s);
      }
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [isFullscreen, toggleFullscreen]);

  const currentTheme = THEMES[theme];
  const currentFont = FONTS[fontFamily];

  if (loading) {
    return (
      <div
        className="flex h-[calc(100dvh-180px)] items-center justify-center rounded-xl border border-border"
        style={{ backgroundColor: currentTheme.bg }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-forest" />
          <p className="text-sm text-ink-soft">Memuat Buku…</p>
        </div>
      </div>
    );
  }

  if (loadError || chapters.length === 0) {
    return (
      <div className="flex h-[calc(100dvh-180px)] items-center justify-center rounded-xl border border-border bg-card px-4 text-center">
        <p className="text-sm text-ink-soft">
          {loadError || "File EPUB tidak tersedia atau tidak dapat dibaca."}
        </p>
      </div>
    );
  }

  const useVisualFullscreen =
    isFullscreen || (isTabletOrMobile && forceVisualFullscreen);
  const containerClass = useVisualFullscreen
    ? "fixed inset-0 z-50 flex w-full overflow-hidden"
    : "relative flex h-[calc(100dvh-180px)] w-full overflow-hidden rounded-xl border border-border";

  return (
    <div
      className={containerClass}
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
      }}
    >
      <div
        className={`absolute inset-0 z-40 transition-opacity duration-300 ${
          settingsOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSettingsOpen(false)}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 z-50 border-t shadow-lg transition-transform duration-300 ${
          settingsOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.sidebarBg,
        }}
      >
        <div className="mx-auto max-w-3xl space-y-4 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: currentTheme.text }}>
              Ukuran Font
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontSize((s) => Math.max(MIN_FONT_SIZE, s - 2))}
                disabled={fontSize <= MIN_FONT_SIZE}
                className="flex h-8 w-8 items-center justify-center rounded-md border bg-gray-100 disabled:opacity-50"
                style={{ color: currentTheme.text }}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span
                className="w-8 text-center text-sm font-medium"
                style={{ color: currentTheme.text }}
              >
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize((s) => Math.min(MAX_FONT_SIZE, s + 2))}
                disabled={fontSize >= MAX_FONT_SIZE}
                className="flex h-8 w-8 items-center justify-center rounded-md border bg-gray-100 disabled:opacity-50"
                style={{ color: currentTheme.text }}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: currentTheme.text }}>
              Tema
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  theme === "light" ? "border-blue-600" : "border-transparent"
                }`}
                style={{ backgroundColor: "#ffffff" }}
                title="Terang"
              >
                <Sun className="h-4 w-4 text-gray-800" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  theme === "dark" ? "border-blue-600" : "border-transparent"
                }`}
                style={{ backgroundColor: "#1a1a1a" }}
                title="Gelap"
              >
                <Moon className="h-4 w-4 text-gray-200" />
              </button>
              <button
                onClick={() => setTheme("sepia")}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  theme === "sepia" ? "border-blue-600" : "border-transparent"
                }`}
                style={{ backgroundColor: "#f4ecd8" }}
                title="Sepia"
              >
                <Coffee className="h-4 w-4 text-amber-900" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: currentTheme.text }}>
              Jenis Font
            </span>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as FontFamily)}
              className="rounded-md border bg-gray-100 px-3 py-1.5 text-sm"
              style={{ color: currentTheme.text }}
            >
              <option value="Merriweather">Merriweather</option>
              <option value="Georgia">Georgia</option>
              <option value="Inter">Inter</option>
              <option value="OpenDyslexic">OpenDyslexic</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: currentTheme.text }}>
              Alignment
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setTextAlign("left")}
                className={`flex h-8 w-8 items-center justify-center rounded-md border ${
                  textAlign === "left" ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
                style={textAlign !== "left" ? { color: currentTheme.text } : undefined}
                title="Kiri"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTextAlign("justify")}
                className={`flex h-8 w-8 items-center justify-center rounded-md border ${
                  textAlign === "justify" ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
                style={textAlign !== "justify" ? { color: currentTheme.text } : undefined}
                title="Rata"
              >
                <AlignJustify className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isTabletOrMobile && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: currentTheme.text }}>
                Layar Penuh
              </span>
              <button
                onClick={toggleFullscreen}
                className="flex h-8 w-8 items-center justify-center rounded-md border bg-gray-100"
                style={{ color: currentTheme.text }}
                title="Layar penuh"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar (TOC) */}
      <div
        className={`absolute left-0 top-0 bottom-0 z-30 flex flex-col border-r transition-all duration-300 ${
          sidebarOpen ? "w-72" : "w-0"
        }`}
        style={{
          backgroundColor: currentTheme.sidebarBg,
          borderColor: currentTheme.sidebarBg,
          overflow: "hidden",
        }}
      >
        <div
          className="flex items-center justify-between border-b p-4"
          style={{ borderColor: currentTheme.text }}
        >
          <h3 className="font-semibold" style={{ color: currentTheme.text }}>
            Daftar Isi
          </h3>
          <span
            className="text-xs"
            style={{ color: currentTheme.text, opacity: 0.6 }}
          >
            {chapters.length} bab
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chapters.map((chapter, index) => (
            <button
              key={`${chapter.href}-${index}`}
              onClick={() => goToChapter(index)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                index === currentChapter
                  ? "font-medium shadow-sm"
                  : "hover:bg-black/5"
              }`}
              style={{
                color: index === currentChapter ? "#2563eb" : currentTheme.text,
                backgroundColor:
                  index === currentChapter
                    ? theme === "dark"
                      ? "rgba(37,99,235,0.2)"
                      : "rgba(37,99,235,0.1)"
                    : "transparent",
                opacity: index === currentChapter ? 1 : 0.85,
              }}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-xs" style={{ opacity: 0.5 }}>
                  {index + 1}.
                </span>
                <span className="line-clamp-2">
                  {chapter.title || `Bab ${index + 1}`}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Top bar */}
      <div
        className={`absolute left-0 right-0 top-0 z-20 flex h-14 items-center justify-between border-b px-4 transition-transform duration-300 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.sidebarBg,
        }}
      >
        <h2
          className="absolute left-1/2 top-1/2 max-w-[50%] -translate-x-1/2 -translate-y-1/2 truncate text-sm font-medium"
          style={{ color: currentTheme.text }}
        >
          {bookTitle}
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              sidebarOpen ? "bg-blue-100" : "hover:bg-black/5"
            }`}
            style={{ color: sidebarOpen ? "#2563eb" : currentTheme.text }}
            title="Daftar Isi (B)"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              settingsOpen ? "bg-blue-100" : "hover:bg-black/5"
            }`}
            style={{ color: settingsOpen ? "#2563eb" : currentTheme.text }}
            title="Pengaturan"
          >
            <Settings className="h-5 w-5" />
          </button>

          {!isTabletOrMobile && (
            <button
              onClick={toggleFullscreen}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
              style={{ color: currentTheme.text }}
              title="Layar Penuh (F)"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </button>
          )}

          {isTabletOrMobile && onClose && (
            <button
              onClick={handleClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
              style={{ color: currentTheme.text }}
              title="Tutup pembaca"
              aria-label="Tutup pembaca"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="absolute left-0 right-0 top-14 z-10 h-1"
        style={{ backgroundColor: currentTheme.sidebarBg, opacity: 0.3 }}
      >
        <div
          className="h-full transition-all duration-200"
          style={{
            width: `${horizontalScrollProgress}%`,
            backgroundColor: theme === "dark" ? "#3b82f6" : "#2563eb",
          }}
        />
      </div>

      {/* Content */}
      <div
        ref={contentAreaRef}
        className="relative flex-1 overflow-x-auto overflow-y-hidden pt-14 transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
        onClick={() => {
          if (settingsOpen || sidebarOpen) {
            setSettingsOpen(false);
            setSidebarOpen(false);
          } else {
            setShowNav(!showNav);
          }
        }}
      >
        <HorizontalReader
          ref={horizontalReaderRef}
          chapters={chapters}
          fontSize={fontSize}
          fontFamily={currentFont.font}
          textAlign={textAlign}
          lineHeight={1.8}
          color={currentTheme.text}
          backgroundColor={currentTheme.bg}
          onScrollProgress={setHorizontalScrollProgress}
          scrollRef={contentAreaRef}
          columns={2}
        />
      </div>
    </div>
  );
}
