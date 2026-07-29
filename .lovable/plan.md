

## Auto-Fullscreen di Mobile/Tablet + Tombol Close [X]

### Tujuan
Pada perangkat **mobile dan tablet** (viewport `< 1024px`):
1. EPUB reader otomatis masuk **fullscreen** saat dibuka.
2. Tombol toggle fullscreen (Maximize/Minimize) **disembunyikan** di top bar dan di settings panel.
3. Tampilkan tombol **[X]** di top bar untuk menutup reader → kembali ke detail buku.

Pada **desktop** (≥ 1024px): perilaku tidak berubah (tombol fullscreen tetap ada, tidak auto-fullscreen, tidak ada tombol X — parent sudah menyediakan "Tutup pembaca").

### File yang Diubah

**1. `src/components/EpubReader.tsx`**

- **Props baru**: tambah `onClose?: () => void` di interface `Props`.
- **Deteksi tablet/mobile**: pakai hook baru `useIsTabletOrMobile()` berbasis `window.matchMedia("(max-width: 1023px)")` (breakpoint Tailwind `lg`). Tempatkan inline di file atau buat helper kecil `src/hooks/use-tablet.tsx`.
- **Auto-fullscreen on mount (mobile/tablet)**:
  - `useEffect` yang berjalan sekali setelah `loading === false` & `isTabletOrMobile === true`: panggil `document.documentElement.requestFullscreen()` di dalam `try/catch` (browser bisa tolak jika bukan dari user gesture — kalau gagal, fallback ke "fullscreen visual" dengan container `fixed inset-0 z-50`).
  - Tambah state `forceVisualFullscreen` agar saat API fullscreen ditolak, container tetap full-viewport via CSS.
  - `containerClass` jadi: `isFullscreen || (isTabletOrMobile && forceVisualFullscreen)` → `fixed inset-0 z-50 ...`.
- **Sembunyikan tombol fullscreen di mobile/tablet**:
  - Top bar: bungkus tombol Maximize/Minimize dengan `{!isTabletOrMobile && (...)}`.
  - Settings sheet: bungkus baris "Layar Penuh" dengan `{!isTabletOrMobile && (...)}`.
- **Tambah tombol [X] close di top bar (mobile/tablet only)**:
  - Render di area kanan top bar, sebelum tombol settings: `{isTabletOrMobile && onClose && <button onClick={handleClose}>...<X /></button>}`.
  - `handleClose`: jika `document.fullscreenElement` aktif → `await document.exitFullscreen()` (try/catch), lalu panggil `onClose()`.
- **Import**: tambah `X` dari `lucide-react`.

**2. `src/routes/pustaka.$bookId.tsx`**

- Pass prop `onClose={() => setReading(false)}` ke `<EpubReader />`.
- Pertahankan tombol "Tutup pembaca" di header reader (untuk desktop). Opsional: sembunyikan tombol "Tutup pembaca" pada mobile/tablet karena sudah ada [X] di dalam reader → bungkus dengan class `hidden lg:inline-flex` agar hanya tampil di desktop. Ini menghindari dua tombol close yang membingungkan di mobile.

### Detail Teknis

- **Breakpoint**: `< 1024px` (Tailwind `lg`) dianggap mobile/tablet. Cocok untuk iPad portrait/landscape kecil.
- **Fullscreen API & user gesture**: Browser modern (terutama iOS Safari) **tidak mengizinkan** `requestFullscreen()` tanpa user gesture langsung. Karena itu, jika API gagal, fallback ke **CSS visual fullscreen** (`fixed inset-0 z-50`) sehingga UX tetap immersive. Tombol [X] tetap berfungsi karena memanggil `onClose()` apapun mode fullscreen-nya.
- **Cleanup**: saat reader unmount, jika `document.fullscreenElement` masih aktif → exit fullscreen otomatis (sudah ada listener, plus tambah cleanup eksplisit di unmount).
- **Keyboard shortcut F**: tetap aktif di desktop; di mobile/tablet tidak relevan (tidak ada keyboard fisik biasanya), shortcut tidak perlu di-disable.
- **Persistensi posisi/preferensi**: tidak berubah.

### Diagram

```text
Mobile/Tablet (< 1024px)
┌──────────────────────────────────────┐
│ [☰]  Judul Buku        [X] [⚙]       │  ← top bar (no fullscreen toggle)
├──────────────────────────────────────┤
│ ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░ 32%   │
├──────────────────────────────────────┤
│      konten EPUB (fullscreen)        │
└──────────────────────────────────────┘
[X] tap → exit fullscreen + onClose() → kembali ke /pustaka/$bookId

Desktop (≥ 1024px) — TIDAK BERUBAH
┌──────────────────────────────────────┐
│ [☰]  Judul Buku        [⚙] [⛶]       │
└──────────────────────────────────────┘
Header parent menampilkan tombol "Tutup pembaca".
```

