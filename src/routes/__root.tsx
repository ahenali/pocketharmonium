import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportError } from "../lib/error-reporting";
import { ThemeToggle } from "../components/ThemeToggle";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl italic text-ink">404</h1>
        <h2 className="mt-4 text-xl text-ink">This page isn't in the songbook</h2>
        <p className="mt-2 text-sm text-ink-soft">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-brass px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-card"
          >
            Back to the harmonium
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl text-ink">This page didn't load</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-brass px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-card"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-md border border-brass bg-card px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-brass-deep"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pocket Harmonium — Play a Harmonium Online" },
      {
        name: "description",
        content:
          "Play a real recorded Indian harmonium in your browser: sargam keyboard, reed stacking, metronome, recording and a raag guide.",
      },
      { name: "author", content: "Pocket Harmonium" },
      { property: "og:site_name", content: "Pocket Harmonium" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#ede3ce" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "icon", href: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
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

const navLink =
  "font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft transition hover:text-brass-deep";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative flex min-h-screen flex-col">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-y-0 left-8 hidden w-px bg-maroon/30 sm:block"
        />
        <header className="relative z-20 border-b border-rule bg-paper/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link
              to="/"
              className="font-display text-[26px] leading-none tracking-[-0.02em] text-ink"
            >
              Pocket<span className="text-brass-deep">Harmonium</span>
            </Link>
            <nav className="flex items-center gap-4 sm:gap-5">
              <Link to="/" className={navLink}>
                Play
              </Link>
              <Link to="/about" className={navLink}>
                About
              </Link>
              <Link to="/faq" className={navLink}>
                FAQ
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="relative z-10 flex-1">
          {/* Required: nested routes render here. */}
          <Outlet />
        </main>

        <footer className="relative z-10 mt-12 border-t border-rule px-4 py-7 text-center">
          <p className="font-mono text-[11px] text-ink-soft">
            pocketharmonium.app — a web harmonium for riyaz
          </p>
          <nav className="mt-2 flex justify-center gap-4">
            <Link to="/privacy" className={`${navLink} underline underline-offset-2`}>
              Privacy
            </Link>
            <Link to="/terms" className={`${navLink} underline underline-offset-2`}>
              Terms
            </Link>
            <Link to="/faq" className={`${navLink} underline underline-offset-2`}>
              FAQ
            </Link>
          </nav>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
