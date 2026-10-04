import { createFileRoute, Link } from "@tanstack/react-router";

const title = "Terms of Use — Pocket Harmonium";
const description =
  "Terms for using the Pocket Harmonium web harmonium, including personal-use rights, warranty and liability.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: Terms,
});

export default function Terms() {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="display-section text-ink">Terms of Use</h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
        Last updated: [add date]
      </p>
      <p className="mt-5 text-sm italic text-ink-soft">
        This is a starting template, not legal advice — review it with a lawyer before publishing
        and replace the bracketed placeholders.
      </p>

      <Section h="Using the site">
        <p>
          Pocket Harmonium is provided for personal, non-commercial practice and enjoyment. You may play,
          record, and download audio for your own use. The instrument sound is a licensed/owned
          recording — [state your rights to the recording here] — and may not be redistributed as a
          standalone sample pack or resold.
        </p>
      </Section>

      <Section h="No warranty">
        <p>
          This site is provided "as is," without warranty of any kind. We don't guarantee it will be
          uninterrupted, error-free, or fit for any particular purpose.
        </p>
      </Section>

      <Section h="Limitation of liability">
        <p>
          To the extent permitted by law, we are not liable for any indirect, incidental, or
          consequential damages arising from your use of this site.
        </p>
      </Section>

      <Section h="Changes">
        <p>
          These terms may be updated from time to time; continued use of the site after changes
          means you accept the revised terms.
        </p>
      </Section>

      <Section h="Contact">
        <p>Questions about these terms: [your contact email].</p>
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
