import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

import appCss from "../styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sinau — Belajar Inggris lewat Sastra Klasik" },
      {
        name: "description",
        content:
          "Membaca karya klasik dwibahasa Inggris–Indonesia dengan kebijaksanaan Charlotte Mason: pelajaran singkat, narasi, salinan, dan cinta pada buku.",
      },
      { name: "author", content: "Sinau" },
      { property: "og:title", content: "Sinau — Belajar Inggris lewat Sastra Klasik" },
      {
        property: "og:description",
        content:
          "Bacaan klasik dwibahasa dengan pendekatan Charlotte Mason: jembatan menuju cinta pada buku.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Sinau — Belajar Inggris lewat Sastra Klasik" },
      { name: "description", content: "A web app for learning English through classic literature with a gamified system in Indonesian." },
      { property: "og:description", content: "A web app for learning English through classic literature with a gamified system in Indonesian." },
      { name: "twitter:description", content: "A web app for learning English through classic literature with a gamified system in Indonesian." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0554acba-c473-4e1d-bf86-a922f3a2ad3b/id-preview-11dc753d--ca90c9bf-bcb5-48d1-88a2-d3cb5796a844.lovable.app-1776469468898.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0554acba-c473-4e1d-bf86-a922f3a2ad3b/id-preview-11dc753d--ca90c9bf-bcb5-48d1-88a2-d3cb5796a844.lovable.app-1776469468898.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
        <Toaster position="top-center" richColors closeButton />
      </div>
    </QueryClientProvider>
  );
}
