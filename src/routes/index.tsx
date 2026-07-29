import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BOOKS, getBook } from "@/data/books";
import { BookCover } from "@/components/BookCard";
import { CommunityBookCard } from "@/components/CommunityBookCard";
import { fetchCommunityBooks } from "@/data/communityBooks";
import { useAppData, getBookProgress, PLANT_STAGES } from "@/store/appStore";
import {
  Flame,
  Feather,
  Sprout,
  Sparkles,
  BookOpen,
  Clock,
  MessageCircleQuestion,
  Search,
  Network,
  Map as MapIcon,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

const PRINCIPLES = [
  {
    icon: Clock,
    title: "Pelajaran Singkat",
    body: "Sesi 15–45 menit dengan bel yang lembut. Perhatian pendek mendalam, bukan paksaan panjang.",
  },
  {
    icon: Feather,
    title: "Narasi sebagai Penilaian",
    body: "Tuliskan kembali apa yang kamu pahami. Tidak ada nilai, tidak ada tes — hanya percakapan dengan buku.",
  },
  {
    icon: Sprout,
    title: "Cinta pada Buku, Bukan Hadiah",
    body: "Setiap fitur diuji dengan satu pertanyaan: apakah ini membuatmu lebih cinta pada buku?",
  },
];

const PILLARS: {
  icon: typeof Clock;
  title: string;
  body: string;
  status: "Tersedia" | "Segera";
  to?: string;
}[] = [
  {
    icon: MessageCircleQuestion,
    title: "Kawan Narasi Socratic",
    body: "Setelah satu bab, ceritakan kembali. Mentor membaca narasimu dan menanyakan satu pertanyaan reflektif — bukan menilai, bukan menjawab untukmu.",
    status: "Segera",
  },
  {
    icon: Search,
    title: "Pencari Budi Pekerti",
    body: "Cari tema moral seperti ‘konsekuensi kesombongan’ — sistem mengembalikan paragraf-paragraf paling jujur dari berbagai buku klasik.",
    status: "Segera",
  },
  {
    icon: Network,
    title: "Jaring Ide Lintas Buku",
    body: "Charlotte Mason menyebut pendidikan sebagai ‘ilmu tentang hubungan’. Kami menemukan benang merah antara buku yang kamu baca hari ini dan buku bulan lalu.",
    status: "Segera",
  },
  {
    icon: MapIcon,
    title: "Peta Kata Webster 1828",
    body: "Sentuh sebuah kata, dapatkan definisi klasik dari kamus Noah Webster 1828. Kata itu hidup di kalimat asalnya — bukan di kartu hafalan.",
    status: "Tersedia",
    to: "/peta-kata",
  },
  {
    icon: Sparkles,
    title: "Studio Penyalin",
    body: "Salin satu kalimat indah dengan tangan. Ritme, ejaan, dan struktur bahasa tingkat tinggi masuk perlahan ke dalam jari.",
    status: "Tersedia",
    to: "/studio-penyalin",
  },
  {
    icon: Sprout,
    title: "Bel Pelajaran & Taman",
    body: "Sesi pendek dengan bel yang lembut. Setiap buku tumbuh sebagai tanaman — berdasarkan kedalaman, bukan kecepatan.",
    status: "Tersedia",
    to: "/taman-bacaan",
  },
];

function Home() {
  const { data } = useAppData();
  const featured = getBook("secret-garden")!;
  const recentNarration = data.narrations[0];
  const { data: communityBooks = [] } = useQuery({
    queryKey: ["community-books"],
    queryFn: fetchCommunityBooks,
  });

  // Avoid SSR/CSR hydration mismatch — streak/narrations are client-only (localStorage)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const streak = mounted ? data.streak.current : 0;
  const narrationsCount = mounted ? data.narrations.length : 0;
  const copyworksCount = mounted ? data.copyworks.length : 0;

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* Hero */}
      <section className="grid gap-10 py-14 lg:grid-cols-[1.1fr,0.9fr] lg:items-center lg:py-20">
        <div className="animate-fade-up">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-parchment px-3 py-1 text-xs uppercase tracking-[0.18em] text-forest-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-forest" />
            BELAJAR BAHASA INGGRIS LEWAT BUKU KLASIK JADI LEBIH ASYIK{"\n"}
          </p>
          <h1 className="font-display text-5xl leading-[1.05] text-ink md:text-6xl">
            Mengenalkan bahasa Inggris <br />
            tak lagi terasa seperti tugas
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            Menghadirkan momen hangat bersama anak lewat buku-buku yang menyentuh hati.
            <br />
            Di Sinau KawanBaca, Ibu bisa duduk berdekatan membaca kisah klasik—teks aslinya di
            sebelah kiri, ditemani terjemahan bahasa Indonesia yang mengalir lembut di kanan. Tanpa
            beban, hanya waktu membaca yang secukupnya, obrolan santai tentang ceritanya, dan
            memetik satu-dua kalimat indah untuk dituliskan kembali dengan penuh makna.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/baca/$bookId"
              params={{ bookId: featured.id }}
              className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-leaf transition hover:bg-forest-deep"
            >
              <BookOpen className="h-4 w-4" />
              Mulai membaca {featured.title}
            </Link>
            <Link
              to="/perpustakaan"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-parchment px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-secondary"
            >
              Jelajahi Perpustakaan
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <Flame className="h-4 w-4 text-flame" />
              Api Membaca {streak} hari
            </span>
            <span>·</span>
            <span>{narrationsCount} narasi tersimpan</span>
            <span>·</span>
            <span>{copyworksCount} kalimat tersalin</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-gold-soft/60 via-transparent to-secondary/60 blur-2xl" />
          <div className="paper rounded-2xl p-8">
            <div className="flex items-start gap-5">
              <BookCover book={featured} size="lg" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Buku Pilihan</p>
                <h3 className="mt-1 font-display text-2xl text-ink">{featured.title}</h3>
                <p className="text-sm italic text-ink-soft">{featured.author} · {featured.year}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink">{featured.descriptionId}</p>
                <Link
                  to="/baca/$bookId"
                  params={{ bookId: featured.id }}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-forest-deep underline-offset-4 hover:underline"
                >
                  Buka bab pertama →
                </Link>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border/70 pt-5 text-center text-xs">
              <div>
                <div className="font-display text-xl text-forest-deep">3</div>
                <div className="text-ink-soft">Bab tersedia</div>
              </div>
              <div>
                <div className="font-display text-xl text-forest-deep">{featured.totalPages}</div>
                <div className="text-ink-soft">Halaman</div>
              </div>
              <div>
                <div className="font-display text-xl text-forest-deep">EN ⇆ ID</div>
                <div className="text-ink-soft">Bitext</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-12">
        <h2 className="ornament text-center font-display text-3xl text-ink">Filosofi Kami</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-ink-soft">
          Setiap fitur Sinau diuji terhadap prinsip Charlotte Mason. Apa yang menjauhkanmu
          dari buku, kami tolak. Apa yang mendekatkanmu, kami pelihara.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-forest-deep">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Six Pillars — ClassicLingua roadmap */}
      <section className="py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-forest-deep">
            Edisi ClassicLingua
          </p>
          <h2 className="ornament mt-2 font-display text-3xl text-ink">
            Enam Pilar Sinau KawanBaca
          </h2>
          <p className="mt-3 text-sm text-ink-soft">
            Bukan kuis, bukan poin, bukan peringkat. Enam alat sederhana yang membuat otak
            pembaca dipaksa berpikir, merasa, dan tumbuh — sambil tetap jatuh cinta pada buku.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => {
            const card = (
              <div className="paper group flex h-full flex-col rounded-2xl p-6 transition hover:shadow-leaf">
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-forest-deep">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${
                      p.status === "Tersedia"
                        ? "border-forest/40 bg-secondary text-forest-deep"
                        : "border-border bg-parchment text-ink-soft"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <h3 className="font-display text-xl text-ink">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{p.body}</p>
                {p.to && (
                  <span className="mt-4 text-xs font-medium text-forest-deep underline-offset-4 group-hover:underline">
                    Buka pilar ini →
                  </span>
                )}
              </div>
            );
            return p.to ? (
              <Link key={p.title} to={p.to} className="block">
                {card}
              </Link>
            ) : (
              <div key={p.title}>{card}</div>
            );
          })}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs italic text-ink-soft">
          “AI di sini bukan entitas maha tahu yang menyuapi rangkuman. Ia tutor bayangan yang
          mengajukan pertanyaan-pertanyaan sulit, agar manusia di depan layar dipaksa berpikir,
          merasa, dan tumbuh.”
        </p>
      </section>

      {/* Library preview — community books from Kawan Baca */}
      <section className="py-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl text-ink">Perpustakaan Kawan Baca</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Buku pilihan komunitas, dengan rekomendasi level audiens dan saran penggunaan.
            </p>
          </div>
          <Link to="/perpustakaan" className="text-sm text-forest-deep underline-offset-4 hover:underline">
            Lihat semua →
          </Link>
        </div>
        {communityBooks.length === 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-xl border border-border bg-card/50"
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {communityBooks.slice(0, 4).map((b) => (
              <CommunityBookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>

      {/* Quick features */}
      <section className="grid gap-4 py-14 md:grid-cols-3">
        <Link
          to="/buku-ceritaku"
          className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:shadow-leaf"
        >
          <Feather className="h-6 w-6 text-forest-deep" />
          <h3 className="mt-3 font-display text-xl">Buku Ceritaku</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Arsip narasi pribadi. {narrationsCount} entri.
          </p>
          {recentNarration && (
            <p className="mt-3 line-clamp-2 text-xs italic text-ink-soft">
              “{recentNarration.text.slice(0, 110)}…”
            </p>
          )}
        </Link>
        <Link
          to="/taman-bacaan"
          className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:shadow-leaf"
        >
          <Sprout className="h-6 w-6 text-forest-deep" />
          <h3 className="mt-3 font-display text-xl">Taman Bacaan</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Tiap buku menjadi tanaman yang tumbuh perlahan.
          </p>
          <div className="mt-3 flex gap-1 text-2xl">
            {BOOKS.slice(0, 5).map((b) => {
              const lvl = getBookProgress(data, b.id).level;
              return <span key={b.id}>{PLANT_STAGES[lvl - 1]}</span>;
            })}
          </div>
        </Link>
        <Link
          to="/studio-penyalin"
          className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:shadow-leaf"
        >
          <Sparkles className="h-6 w-6 text-forest-deep" />
          <h3 className="mt-3 font-display text-xl">Studio Penyalin</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Salin kalimat indah ke dalam Galeri Kata Indahmu.
          </p>
          <p className="mt-3 text-xs text-ink-soft">{copyworksCount} kalimat di galerimu.</p>
        </Link>
      </section>
    </div>
  );
}
