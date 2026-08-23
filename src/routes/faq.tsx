import { createFileRoute, Link } from "@tanstack/react-router";

const title = "Harmonium FAQ — Pocket Harmonium";
const description =
  "Answers about playing the web harmonium: MIDI support, recording privacy, what a raag is, and why pitch-shifted samples sound the way they do.";

const faqs = [
  {
    q: "Do I need a MIDI keyboard to play?",
    a: "No — the full keyboard works from your computer keys. A MIDI keyboard is supported if you have one, but it's optional.",
  },
  {
    q: "Does the recording feature upload anything?",
    a: "No. Recording happens entirely in your browser and the file is saved straight to your device — nothing is uploaded anywhere.",
  },
  {
    q: "What is a raag?",
    a: "A raag (raga) is a melodic framework in Indian classical music — a defined set of notes, typically five to seven, along with rules for how they're used in a composition or improvisation. The Raag Guide highlights which keys belong to a chosen raag from a chosen root note.",
  },
  {
    q: "Why do some notes sound slightly different across the keyboard?",
    a: "Every note comes from the same recorded reed sample, pitch-shifted to the correct note. Keys further from the sample's original pitch shift more, which is a natural characteristic of sample-based instruments.",
  },
  {
    q: "Why do I have to load the reeds first?",
    a: "Browsers only allow audio after a click, and the harmonium recording plus reverb impulse is a few megabytes. Loading on demand keeps the page fast for people who are just reading.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});

export default function Faq() {
  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-14">
      <h1 className="display-section text-ink">
        Frequently Asked Questions
      </h1>
      <div className="mt-9 border-t border-rule">
        {faqs.map((f) => (
          <section
            key={f.q}
            className="grid gap-2 border-b border-rule py-6 md:grid-cols-[1fr_1.4fr] md:gap-10 md:py-8"
          >
            <h2 className="font-display text-2xl leading-tight text-ink">{f.q}</h2>
            <p className="text-[15px] leading-relaxed text-ink-soft">{f.a}</p>
          </section>
        ))}
      </div>
      <Link
        to="/"
        className="mt-12 inline-flex border border-brass-deep bg-brass px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-wood"
      >
        Back to the keyboard
      </Link>
    </article>
  );
}
