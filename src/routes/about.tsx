import { createFileRoute, Link } from "@tanstack/react-router";

const title = "About the Harmonium — Pocket Harmonium";
const description =
  "How the harmonium became an Indian reed organ, how Pocket Harmonium reproduces its sound from a real recording, and how to use every control.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const features = [
  ["Play", "Use your computer keyboard (labels sit under each key) or connect a MIDI keyboard."],
  ["Transpose & octave", "Shift the whole keyboard up or down without changing the layout."],
  ["Additional reeds", "Layer octave-doubled reed voices, the way a real harmonium stacks reed sets."],
  ["Metronome", "Set a tempo, with the first of every four beats accented."],
  ["Recording", "Capture what you play; the file saves straight to your device when you stop."],
  ["Notation", "Switch key labels between Sargam (Sa Re Ga Ma) and Western note names."],
  ["Raag guide", "Pick a root note and a raag to light up the keys that belong to it."],
];

export default function About() {
  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-14">
      <h1 className="display-section text-ink">
        About the Harmonium
      </h1>
      <div className="mt-7 grid gap-5 md:grid-cols-2 md:gap-10">
      <p className="text-[15px] leading-relaxed text-ink-soft">
        The harmonium arrived in India in the 19th century and was reshaped into a hand-pumped
        reed organ suited to Hindustani and Carnatic music, bhajans, kirtans, and everyday riyaz
        (practice). A player works the bellows with one hand to keep air moving across a set of
        metal reeds while the other hand plays the keyboard — the sustained, breathy drone that
        results is the instrument's signature sound.
      </p>
      <p className="text-[15px] leading-relaxed text-ink-soft">
        Pocket Harmonium plays a real recorded harmonium sample rather than a synthesized tone,
        pitch-shifted per key so the reed's natural attack and body carry across the full
        keyboard. A convolution reverb adds room; stacking reeds mimics multiple reed banks
        sounding together.
      </p>
      </div>

      <h2 className="display-section mt-16 text-ink">How to use it</h2>
      <ul className="mt-6 border-t border-rule">
        {features.map(([name, text]) => (
          <li
            key={name}
            className="grid gap-1 border-b border-rule py-4 sm:grid-cols-[200px_1fr] sm:gap-6 sm:py-5"
          >
            <span className="label-mono pt-1">{name}</span>
            <span className="text-[15px] leading-relaxed text-ink-soft">{text}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/"
        className="mt-12 inline-flex border border-brass-deep bg-brass px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-wood"
      >
        Start playing
      </Link>
    </article>
  );
}
