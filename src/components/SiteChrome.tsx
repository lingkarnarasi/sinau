import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppData } from "@/store/appStore";
import { Flame, BookOpen, Sprout, Feather, Map, Sparkles } from "lucide-react";

const NAV = [
  { to: "/perpustakaan", label: "Perpustakaan", icon: BookOpen },
  { to: "/buku-ceritaku", label: "Buku Ceritaku", icon: Feather },
  { to: "/peta-kata", label: "Peta Kata", icon: Map },
  { to: "/studio-penyalin", label: "Studio Penyalin", icon: Sparkles },
  { to: "/taman-bacaan", label: "Taman Bacaan", icon: Sprout },
] as const;

export function SiteHeader() {
  const { data } = useAppData();
  // Avoid SSR/CSR hydration mismatch — streak is client-only (localStorage)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const streak = mounted ? data.streak.current : 0;
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-parchment/85 backdrop-blur supports-[backdrop-filter]:bg-parchment/75">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2 text-forest-deep">
          <span className="font-display text-2xl leading-none">Sinau</span>
          <span className="hidden whitespace-pre-line text-xs uppercase tracking-[0.18em] text-ink-soft sm:inline">
            BELAJAR BAHASA KLASIK{"\n"}JADI ASYIK
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "bg-secondary text-forest-deep" }}
              className="rounded-md px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-secondary/70 hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <span
            title={`Api Membaca: ${streak} hari`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-parchment px-3 py-1 text-xs font-medium text-flame"
          >
            <Flame className="h-3.5 w-3.5" />
            {streak} hari
          </span>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-3 py-1.5 md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeProps={{ className: "bg-secondary text-forest-deep" }}
            className="flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-xs text-ink-soft"
          >
            <n.icon className="h-3.5 w-3.5" />
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-parchment-deep/40">
      <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-ink-soft">
        <p className="font-display text-xl text-forest-deep">
          “Education is an atmosphere, a discipline, a life.”
        </p>
        <p className="mt-1 italic">— Charlotte Mason</p>
        <p className="mt-6 text-xs">
          Sinau dirancang sebagai jembatan menuju cinta pada buku — bukan menuju cinta pada
          hadiah. Semua karya di sini berasal dari domain publik.
        </p>
      </div>
    </footer>
  );
}
