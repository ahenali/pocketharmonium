export type KeyDef = {
  key: string;
  note: number;
  sw: string;
  west: string;
  after?: number;
};

export const OCTAVE_MAP = [-36, -24, -12, 0, 12, 24, 36];

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

/** pitch class relative to note 60 = Sa = C */
export function pitchClass(note: number) {
  return (((note - 60) % 12) + 12) % 12;
}

function withWest<T extends { note: number }>(k: T) {
  return { ...k, west: NOTE_NAMES[pitchClass(k.note)] as string };
}

export const WHITE_KEYS: KeyDef[] = [
  { key: "`", note: 55, sw: "P̣" },
  { key: "q", note: 57, sw: "Ḍ" },
  { key: "w", note: 59, sw: "Ṇ" },
  { key: "e", note: 60, sw: "S" },
  { key: "r", note: 62, sw: "R" },
  { key: "t", note: 64, sw: "G" },
  { key: "y", note: 65, sw: "M" },
  { key: "u", note: 67, sw: "P" },
  { key: "i", note: 69, sw: "D" },
  { key: "o", note: 71, sw: "N" },
  { key: "p", note: 72, sw: "Ṡ" },
  { key: "[", note: 74, sw: "Ṙ" },
  { key: "]", note: 76, sw: "Ġ" },
  { key: "\\", note: 77, sw: "Ṁ" },
].map(withWest);

export const BLACK_KEYS: KeyDef[] = [
  { key: "1", note: 56, after: 0, sw: "Ḍ" },
  { key: "2", note: 58, after: 1, sw: "Ṇ" },
  { key: "4", note: 61, after: 3, sw: "R" },
  { key: "5", note: 63, after: 4, sw: "G" },
  { key: "7", note: 66, after: 6, sw: "M" },
  { key: "8", note: 68, after: 7, sw: "D" },
  { key: "9", note: 70, after: 8, sw: "N" },
  { key: "-", note: 73, after: 10, sw: "Ṙ" },
  { key: "=", note: 75, after: 11, sw: "Ġ" },
].map(withWest);

/** Bound to the computer keyboard but not drawn. */
export const EXTRA_KEYS = [
  { key: "s", note: 53 },
  { key: "a", note: 54 },
  { key: "'", note: 78 },
  { key: ";", note: 79 },
];

export const NOTE_OF: Record<string, number> = Object.fromEntries(
  [...WHITE_KEYS, ...BLACK_KEYS, ...EXTRA_KEYS].map((k) => [k.key, k.note]),
);

export const KEY_LABEL: Record<string, string> = { "\\": "\\", " ": "space" };
