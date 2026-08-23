import { NOTE_NAMES, NOTE_OF } from "./keys";

type Shape = { name: string; intervals: number[] };

/** Interval sets checked against every possible root, most specific first. */
const SHAPES: Shape[] = [
  { name: "maj7", intervals: [0, 4, 7, 11] },
  { name: "7", intervals: [0, 4, 7, 10] },
  { name: "m7", intervals: [0, 3, 7, 10] },
  { name: "m6", intervals: [0, 3, 7, 9] },
  { name: "6", intervals: [0, 4, 7, 9] },
  { name: "add9", intervals: [0, 2, 4, 7] },
  { name: "", intervals: [0, 4, 7] },
  { name: "m", intervals: [0, 3, 7] },
  { name: "dim", intervals: [0, 3, 6] },
  { name: "aug", intervals: [0, 4, 8] },
  { name: "sus4", intervals: [0, 5, 7] },
  { name: "sus2", intervals: [0, 2, 7] },
];

function classesOf(keys: Iterable<string>) {
  const set = new Set<number>();
  for (const k of keys) {
    const note = NOTE_OF[k];
    if (note === undefined) continue;
    set.add(((note % 12) + 12) % 12);
  }
  return set;
}

/**
 * Names the chord formed by the currently held keys.
 * Returns null unless at least three distinct pitch classes match a shape.
 */
export function chordName(keys: Iterable<string>): string | null {
  const classes = classesOf(keys);
  if (classes.size < 3) return null;

  for (const shape of SHAPES) {
    if (shape.intervals.length !== classes.size) continue;
    for (let root = 0; root < 12; root++) {
      if (shape.intervals.every((i) => classes.has((root + i) % 12))) {
        return `${NOTE_NAMES[root]}${shape.name}`;
      }
    }
  }
  return null;
}
