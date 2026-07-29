import { useRef, useCallback, type CSSProperties } from "react";

interface Book3DProps {
  coverImage?: string;
  title?: string;
  spineColor?: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * 3D book with GSAP-inspired hover effect using pure CSS transitions.
 * Structure: back-cover → pages → cover image → light/effect overlays.
 */
export function Book3D({
  coverImage,
  title,
  spineColor = "#3b2314",
  width = 220,
  height = 320,
  className = "",
}: Book3DProps) {
  const bookRef = useRef<HTMLDivElement>(null);

  const onEnter = useCallback(() => bookRef.current?.classList.add("book-hovered"), []);
  const onLeave = useCallback(() => bookRef.current?.classList.remove("book-hovered"), []);

  return (
    <>
      <style>{BOOK_CSS}</style>
      <div
        className={`book-root ${className}`}
        style={{ width, height }}
        ref={bookRef}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {/* Back cover */}
        <div
          className="book-back"
          style={{ background: spineColor }}
        />

        {/* Pages */}
        <div className="book-inside">
          <div className="book-page book-page-1" />
          <div className="book-page book-page-2" />
          <div className="book-page book-page-3" />
        </div>

        {/* Front cover */}
        <div className="book-image">
          {coverImage ? (
            <img
              src={coverImage}
              alt={title ?? "Book cover"}
              draggable={false}
            />
          ) : (
            <div
              className="book-placeholder"
              style={{
                background: `linear-gradient(135deg, ${spineColor}, ${darken(spineColor, -40)})`,
              }}
            >
              {title ?? "Book"}
            </div>
          )}
        </div>

        {/* Spine fold effect */}
        <div className="book-effect" />

        {/* Light overlay */}
        <div className="book-light" />

        {/* Hover hitbox */}
        <div className="book-hitbox" />
      </div>
    </>
  );
}

const EASE = "cubic-bezier(0.25, 1, 0.5, 1)";
const DUR = "0.6s";

const BOOK_CSS = `
.book-root {
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.book-hitbox {
  position: absolute;
  inset: 0;
  z-index: 10;
}

/* Back cover */
.book-back {
  position: absolute;
  width: 96%;
  height: 96%;
  top: 2%;
  left: 2%;
  border-radius: 0 6px 6px 0;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.4);
  z-index: -10;
}

/* Page container */
.book-inside {
  position: absolute;
  width: 90%;
  height: 94%;
  top: 3%;
  left: 5%;
  z-index: 0;
}

/* Pages */
.book-page {
  position: absolute;
  top: 0;
  right: 0;
  width: 98%;
  height: 100%;
  background: #faf8f3;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 0 6px 6px 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transform-origin: right center;
  z-index: -5;
  transition: transform ${DUR} ${EASE};
  transform: translateX(0);
}

.book-hovered .book-page-1 { transform: translateX(4px); }
.book-hovered .book-page-2 { transform: translateX(2px); }
.book-hovered .book-page-3 { transform: translateX(0px); }

/* Front cover */
.book-image {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 2px 6px 6px 2px;
  overflow: hidden;
  box-shadow:
    0 10px 20px rgba(0,0,0,0.15),
    0 30px 45px rgba(0,0,0,0.12),
    0 60px 80px rgba(0,0,0,0.1);
  transform: perspective(2000px) rotateY(0deg) translateX(0px) scaleX(1);
  transform-style: preserve-3d;
  transform-origin: left center;
  will-change: transform;
  z-index: 5;
  transition:
    transform ${DUR} ${EASE},
    box-shadow ${DUR} ${EASE};
}

.book-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 2px 6px 6px 2px;
  display: block;
}

.book-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
}

.book-hovered .book-image {
  transform: perspective(2000px) rotateY(-12deg) translateX(-6px) scaleX(0.96);
  box-shadow:
    10px 10px 20px rgba(0,0,0,0.25),
    20px 20px 40px rgba(0,0,0,0.2),
    40px 40px 60px rgba(0,0,0,0.15);
}

/* Spine fold effect */
.book-effect {
  position: absolute;
  width: 20px;
  height: 100%;
  margin-left: 16px;
  top: 0;
  border-left: 2px solid rgba(0,0,0,0.06);
  background: linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
  transform-origin: left center;
  z-index: 6;
  pointer-events: none;
  transition: margin-left ${DUR} ${EASE};
}

.book-hovered .book-effect {
  margin-left: 10px;
}

/* Light overlay */
.book-light {
  position: absolute;
  inset: 0;
  border-radius: 2px 6px 6px 2px;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 100%);
  opacity: 0.1;
  transform-origin: left center;
  z-index: 7;
  pointer-events: none;
  mix-blend-mode: overlay;
  transition:
    opacity ${DUR} ${EASE},
    transform ${DUR} ${EASE};
}

.book-hovered .book-light {
  opacity: 0.2;
  transform: rotateY(-12deg);
}
`;

function darken(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  const n = parseInt(c.length === 3 ? c.split("").map((x) => x + x).join("") : c, 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 0xff) - amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) - amount));
  const b = Math.min(255, Math.max(0, (n & 0xff) - amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
