import { createFileRoute, Link } from "@tanstack/react-router";

const title = "Privacy Policy — Pocket Harmonium";
const description =
  "How Pocket Harmonium handles your data: everything runs in your browser, recordings never leave your device, and preferences stay in local storage.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: Privacy,
});

export default function Privacy() {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="display-section text-ink">Privacy Policy</h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
        Last updated: [add date]
      </p>
      <p className="mt-5 text-sm italic text-ink-soft">
        This is a starting template, not legal advice — review it with a lawyer before publishing
        and replace the bracketed placeholders with your real details.
      </p>

      <Section h="What this site does with your data">
        <p>
          Pocket Harmonium runs entirely in your browser. Playing the instrument, recording audio, and
          choosing settings (theme, notation style, raag selections) all happen locally on your
          device. We do not operate a server that receives your audio, keystrokes, or recordings.
          Recorded audio files are generated in your browser and saved directly to your device —
          they are never uploaded to us or anyone else.
        </p>
        <p>
          We use your browser's local storage to remember preferences like dark mode and notation
          style. That data stays on your device.
        </p>
      </Section>

      <Section h="Advertising">
        <p>
          This site may display ads served by Google AdSense. Google and its partners may use
          cookies and similar technologies to serve ads based on your visits to this and other
          websites, and to measure ad performance. See{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener"
            className="text-brass-deep underline underline-offset-2"
          >
            Google's Partner Sites policy
          </a>
          .
        </p>
        <p>
          [If you serve ads to visitors in the EU/UK, add a cookie-consent banner and describe your
          consent mechanism here.]
        </p>
      </Section>

      <Section h="Unlocking the Raag Guide">
        <p>
          When you unlock the Raag Guide, the GitHub username you enter is sent from your browser
          to GitHub's public API to check the repository's stargazers. The username is saved in
          your browser's local storage so the unlock is remembered, and is not sent to us.
        </p>
      </Section>

      <Section h="Contact">
        <p>Questions about this policy: [your contact email].</p>
      </Section>

      <Link
        to="/"
        className="mt-10 inline-flex font-mono text-[11px] uppercase tracking-wider text-brass-deep underline underline-offset-2"
      >
        Back to Pocket Harmonium
      </Link>
    </article>
  );
}

function Section({ h, children }: { h: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-ink">{h}</h2>
      <div className="mt-2 flex flex-col gap-3 text-[15px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}
