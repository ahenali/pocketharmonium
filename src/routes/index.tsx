import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ControlDeck } from "@/components/harmonium/ControlDeck";
import { Keyboard } from "@/components/harmonium/Keyboard";
import { PricingModal } from "@/components/harmonium/PricingModal";
import { chordName } from "@/lib/harmonium/chords";
import { useHarmonium } from "@/lib/harmonium/useHarmonium";
import { raagById } from "@/lib/harmonium/raags";
import { usePremium } from "@/lib/premium";
import { readSettings, writeSettings } from "@/lib/harmonium/settings";

const title = "Pocket Harmonium — Play a Real Harmonium Online";
const description =
  "A hand-pumped Indian reed organ in your browser. Real recorded reed tone, sargam keyboard, MIDI, metronome, recording and a raag guide for riyaz.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Pocket Harmonium",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any modern browser",
          description,
          offers: [
            { "@type": "Offer", price: "0", priceCurrency: "USD" },
            { "@type": "Offer", price: "15", priceCurrency: "USD", name: "Lifetime premium" },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

const NOTATION_KEY = "surpeti.notation";

function Index() {
  const h = useHarmonium();
  const { premium, checkoutConfigured, openCheckout, redeemCode } = usePremium();
  const [pricingOpen, setPricingOpen] = useState(false);
  const [notation, setNotation] = useState<"sargam" | "western">("sargam");
  const [raagRoot, setRaagRoot] = useState(0);
  const [raagId, setRaagId] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(NOTATION_KEY);
    if (stored === "western" || stored === "sargam") setNotation(stored);
    const saved = readSettings();
    if (saved.raagRoot !== undefined) setRaagRoot(saved.raagRoot);
    if (saved.raagId !== undefined && raagById(saved.raagId)) setRaagId(saved.raagId);
  }, []);

  const chooseNotation = (mode: "sargam" | "western") => {
    setNotation(mode);
    localStorage.setItem(NOTATION_KEY, mode);
  };

  const chooseRaagRoot = (root: number) => {
    setRaagRoot(root);
    writeSettings({ raagRoot: root });
  };

  const chooseRaagId = (id: string) => {
    setRaagId(id);
    writeSettings({ raagId: id });
  };

  const raagNotes = useMemo(() => {
    const raag = raagById(raagId);
    if (!raag || !premium) return null;
    return new Set(raag.notes.map((o) => (raagRoot + o) % 12));
  }, [raagId, raagRoot, premium]);

  const activeRaag = raagById(raagId);
  const pumping = h.activeCount > 0;
  const chord = useMemo(() => chordName(h.held), [h.held]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-6 pt-10">
      <section className="grid items-end gap-6 border-b border-rule pb-9 md:grid-cols-[1.25fr_1fr]">
        <div>
          <p className="label-mono">pocketharmonium.app</p>
          <h1 className="display-hero mt-3 text-ink">
            Web
            <br />
            <span className="italic text-brass-deep">Harmonium</span>
          </h1>
        </div>
        <div className="md:pb-3">
          <svg viewBox="0 0 150 12" className="h-3 w-[150px]">
            <path
              d="M2 6 Q 40 -2 75 6 T 148 6"
              stroke="var(--brass)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-soft">
            A harmonium, in your browser. Real recorded reed tone, an authentic sargam
            keyboard, and tools for riyaz — metronome, recording and a raag guide.
          </p>
        </div>
      </section>

      <section className="panel relative mt-8 p-5 sm:p-7" aria-label="Harmonium">
        {["left-3 top-3", "right-3 top-3", "left-3 bottom-3", "right-3 bottom-3"].map((pos) => (
          <span
            key={pos}
            aria-hidden
            className={`absolute ${pos} size-[7px] rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--brass-deep),var(--brass))] shadow-[0_1px_2px_oklch(0_0_0/40%)]`}
          />
        ))}

        <div className="flex items-center justify-center gap-2.5 pb-5">
          <span
            className={[
              "size-2 rounded-full bg-brass transition-all duration-150",
              pumping ? "scale-125 shadow-[0_0_16px_5px_var(--brass-glow)]" : "",
            ].join(" ")}
          />
          <span className="label-mono !tracking-[0.18em]">
            {h.loadState !== "ready"
              ? `Warming the reeds… ${h.loadPct}%`
              : chord
                ? `Chord · ${chord}`
                : pumping
                  ? "Bellows pumping"
                  : "Bellows idle"}
          </span>
        </div>

        {h.loadState === "error" ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <button
              type="button"
              onClick={() => void h.load()}
              className="rounded-md border border-brass-deep bg-brass px-6 py-3 font-mono text-[13px] font-semibold uppercase tracking-[0.1em] text-card shadow-brass transition hover:brightness-105"
            >
              Retry
            </button>
            <span className="max-w-sm text-center font-mono text-[11px] text-ink-soft">
              Could not decode audio: {h.loadError}
            </span>
          </div>
        ) : (
          <>
            <ControlDeck
              volume={h.volume}
              setVolume={h.setVolume}
              reverb={h.reverb}
              setReverb={h.setReverb}
              transpose={h.transpose}
              setTranspose={h.setTranspose}
              octaveIndex={h.octaveIndex}
              setOctaveIndex={h.setOctaveIndex}
              extraReeds={h.extraReeds}
              setExtraReeds={h.setExtraReeds}
              bpm={h.bpm}
              setBpm={h.setBpm}
              metronomeOn={h.metronomeOn}
              toggleMetronome={() => h.setMetronomeOn(!h.metronomeOn)}
              beat={h.beat}
              recording={h.recording}
              recLabel={h.recLabel}
              toggleRecording={() => (h.recording ? h.stopRecording() : h.startRecording())}
              midiStatus={h.midiStatus}
              midiConnected={h.midiConnected}
              onPanic={h.releaseAll}
              notation={notation}
              setNotation={chooseNotation}
              premium={premium}
              raagRoot={raagRoot}
              setRaagRoot={chooseRaagRoot}
              raagId={raagId}
              setRaagId={chooseRaagId}
              onUpgrade={() => setPricingOpen(true)}
            />

            <div className="mt-5">
              <Keyboard
                held={h.held}
                raagNotes={raagNotes}
                notation={notation}
                onPress={h.press}
                onRelease={h.release}
                onReleaseAll={h.releaseAll}
              />
            </div>

            <p className="mt-4 text-center font-mono text-[11px] text-ink-soft">
              white keys — ` q w e r t y u i o p [ ] \ &nbsp;·&nbsp; black keys — 1 2 4 5 7 8 9 −
              =
            </p>
            {raagNotes && activeRaag ? (
              <p className="mt-2 text-center font-mono text-[11px] text-brass-deep">
                Raag {activeRaag.name} — {activeRaag.note}
              </p>
            ) : null}
          </>
        )}
      </section>

      <section className="mt-14 grid gap-px border-y border-rule bg-rule md:grid-cols-[1.35fr_1fr]">
        <article className="bg-paper p-7 sm:p-10">
          <p className="label-mono">01 — tone</p>
          <h2 className="display-section mt-3 text-ink">Real recorded reeds</h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Every key is one sampled harmonium reed, pitch-shifted so the natural attack and body
            carry across the keyboard. No oscillators, no synthesised approximation.
          </p>
        </article>
        <div className="grid grid-rows-2 gap-px bg-rule">
          <article className="bg-paper px-7 py-6 sm:px-8">
            <p className="label-mono">02 — practice</p>
            <h3 className="mt-2 font-display text-2xl text-ink">Built for riyaz</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Metronome with accented beats, one-click recording saved to your device, and
              transposition for any singer's scale.
            </p>
          </article>
          <article className="bg-paper px-7 py-6 sm:px-8">
            <p className="label-mono">03 — labels</p>
            <h3 className="mt-2 font-display text-2xl text-ink">Sargam or Western</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Label the keys Sa Re Ga Ma or C D E F, and light up the notes of ten common raags
              with the Raag Guide.
            </p>
          </article>
        </div>
      </section>

      <section className="slab-ink mt-16 flex flex-col gap-6 p-8 sm:p-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <p className="label-mono !text-brass">premium</p>
          <h2 className="display-section mt-3 text-key-white">Practice without ads</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-key-white/75">
            Premium unlocks the Raag Guide and removes ads — $5 a month, or $15 once and it's
            yours for good.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPricingOpen(true)}
          className="self-start border border-brass bg-brass px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-wood transition hover:brightness-110 md:self-end"
        >
          {premium ? "Premium active ✓" : "See premium"}
        </button>
      </section>

      <p className="mt-8 text-center text-sm text-ink-soft">
        New to the instrument?{" "}
        <Link to="/about" className="text-brass-deep underline underline-offset-2">
          Read about the harmonium
        </Link>{" "}
        or{" "}
        <Link to="/faq" className="text-brass-deep underline underline-offset-2">
          browse the FAQ
        </Link>
        .
      </p>

      <PricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        checkoutConfigured={checkoutConfigured}
        onCheckout={(priceId) => {
          const ok = openCheckout(priceId);
          if (!ok) setPricingOpen(false);
        }}
        onRedeem={redeemCode}
      />

      <p className="mt-10 text-center font-mono text-[11px] text-ink-soft">
        This project was made by me —{" "}
        <a
          href="https://github.com/ahenali/pocketharmonium"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brass-deep underline underline-offset-2"
        >
          GitHub
        </a>
        {" · "}
        <a
          href="https://instagram.com/ahennali"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brass-deep underline underline-offset-2"
        >
          Instagram @ahennali
        </a>
        {" · "}
        Discord @ahenali
      </p>
    </div>
  );
}
