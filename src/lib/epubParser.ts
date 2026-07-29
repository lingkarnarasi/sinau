import JSZip from "jszip";

export interface EpubChapter {
  title: string;
  href: string;
  content: string;
}

type EpubInput = ArrayBuffer | Uint8Array | Blob;

interface ManifestItem {
  href: string;
  mediaType: string;
}

const IMAGE_MIME_TYPES: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};

export async function loadEpubChapters(input: EpubInput): Promise<EpubChapter[]> {
  const zipInput = input instanceof Blob ? await input.arrayBuffer() : input;
  const zip = await JSZip.loadAsync(zipInput);
  const opfPath = await getOpfPath(zip);
  const opfContent = await zip.file(opfPath)?.async("text");

  if (!opfContent) {
    return loadFallbackChapters(zip);
  }

  const opfDoc = new DOMParser().parseFromString(opfContent, "application/xml");
  const manifest = buildManifest(opfDoc);
  const spineIds = Array.from(opfDoc.querySelectorAll("spine itemref"))
    .map((itemRef) => itemRef.getAttribute("idref"))
    .filter((value): value is string => Boolean(value));
  const opfDir = getBasePath(opfPath);

  const chapters: EpubChapter[] = [];

  for (const idref of spineIds) {
    const item = manifest.get(idref);
    if (!item || !isHtmlMediaType(item.mediaType)) {
      continue;
    }

    const href = stripFragment(item.href);
    const chapterPath = resolveRelativePath(opfDir, href);
    const file = zip.file(chapterPath);
    if (!file) {
      continue;
    }

    try {
      const html = await file.async("text");
      const prepared = await prepareChapter(html, zip, chapterPath, href, chapters.length);
      chapters.push(prepared);
    } catch (error) {
      console.warn("[epubParser] Failed to parse chapter:", chapterPath, error);
    }
  }

  if (chapters.length > 0) {
    return chapters;
  }

  return loadFallbackChapters(zip);
}

async function getOpfPath(zip: JSZip): Promise<string> {
  const containerXml = await zip.file("META-INF/container.xml")?.async("text");
  if (!containerXml) {
    return "OEBPS/content.opf";
  }

  const containerDoc = new DOMParser().parseFromString(containerXml, "application/xml");
  return (
    containerDoc.querySelector("rootfile")?.getAttribute("full-path") ||
    containerXml.match(/full-path="([^"]+)"/i)?.[1] ||
    "OEBPS/content.opf"
  );
}

function buildManifest(opfDoc: Document): Map<string, ManifestItem> {
  const manifest = new Map<string, ManifestItem>();

  for (const item of Array.from(opfDoc.querySelectorAll("manifest item"))) {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    const mediaType = item.getAttribute("media-type") || "";

    if (!id || !href) {
      continue;
    }

    manifest.set(id, { href, mediaType });
  }

  return manifest;
}

async function loadFallbackChapters(zip: JSZip): Promise<EpubChapter[]> {
  const chapterPaths = Object.keys(zip.files)
    .filter((path) => /\.(xhtml|html|htm)$/i.test(path))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const chapters: EpubChapter[] = [];

  for (const chapterPath of chapterPaths) {
    const file = zip.file(chapterPath);
    if (!file) {
      continue;
    }

    try {
      const html = await file.async("text");
      const prepared = await prepareChapter(html, zip, chapterPath, chapterPath, chapters.length);
      chapters.push(prepared);
    } catch (error) {
      console.warn("[epubParser] Failed to parse fallback chapter:", chapterPath, error);
    }
  }

  return chapters;
}

async function prepareChapter(
  rawHtml: string,
  zip: JSZip,
  chapterPath: string,
  href: string,
  index: number,
): Promise<EpubChapter> {
  const doc = new DOMParser().parseFromString(rawHtml, "text/html");

  doc.querySelectorAll("script, style").forEach((node) => node.remove());
  await resolveImages(doc, zip, chapterPath);

  const title =
    doc.querySelector("h1, h2, h3")?.textContent?.trim() ||
    doc.querySelector("title")?.textContent?.trim() ||
    humanizeChapterTitle(href, index);

  const content = doc.body?.innerHTML?.trim() || doc.documentElement.innerHTML || rawHtml;

  return {
    title,
    href,
    content,
  };
}

async function resolveImages(doc: Document, zip: JSZip, chapterPath: string): Promise<void> {
  const chapterDir = getBasePath(chapterPath);
  const images = Array.from(doc.querySelectorAll("img[src]"));

  for (const image of images) {
    const src = image.getAttribute("src");
    if (!src || isExternalSource(src)) {
      continue;
    }

    const imagePath = resolveRelativePath(chapterDir, stripFragment(src));
    const dataUrl = await readZipFileAsDataUrl(zip, imagePath);

    if (dataUrl) {
      image.setAttribute("src", dataUrl);
    }
  }
}

async function readZipFileAsDataUrl(zip: JSZip, path: string): Promise<string | null> {
  const file = zip.file(path);
  if (!file) {
    return null;
  }

  try {
    const bytes = await file.async("uint8array");
    const extension = path.split(".").pop()?.toLowerCase() || "";
    const mimeType = IMAGE_MIME_TYPES[extension] || "application/octet-stream";
    return toDataUrl(bytes, mimeType);
  } catch (error) {
    console.warn("[epubParser] Failed to load image:", path, error);
    return null;
  }
}

function toDataUrl(bytes: Uint8Array, mimeType: string): string {
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return `data:${mimeType};base64,${btoa(binary)}`;
}

function getBasePath(path: string): string {
  const lastSlashIndex = path.lastIndexOf("/");
  return lastSlashIndex >= 0 ? path.slice(0, lastSlashIndex + 1) : "";
}

function stripFragment(path: string): string {
  return path.split("#")[0]?.split("?")[0] || path;
}

function resolveRelativePath(basePath: string, relativePath: string): string {
  const joinedPath = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : `${basePath}${relativePath}`;
  const parts = joinedPath.split("/");
  const normalizedParts: string[] = [];

  for (const part of parts) {
    if (!part || part === ".") {
      continue;
    }

    if (part === "..") {
      normalizedParts.pop();
      continue;
    }

    normalizedParts.push(part);
  }

  return normalizedParts.join("/");
}

function humanizeChapterTitle(path: string, index: number): string {
  const filename = stripFragment(path).split("/").pop() || "";
  const label = filename
    .replace(/\.(xhtml|html|htm)$/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return label || `Chapter ${index + 1}`;
}

function isExternalSource(src: string): boolean {
  return /^(data:|https?:|mailto:|tel:)/i.test(src);
}

function isHtmlMediaType(mediaType: string): boolean {
  return /html|xhtml/i.test(mediaType);
}
