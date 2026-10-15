/**
 * Tabla taals, played the way the original Pocket Harmonium app played them.
 *
 * A taal is a loop of `ticks` ticks (one tick = one matra = one beat at the chosen tempo). Each
 * stroke is a recording placed at a tick, and may fall between ticks (12.5 = half way through the
 * 13th matra). The first beat of a stroke pair such as Dha is the dayan (treble drum) and the bayan
 * (bass drum) struck together; khali beats are dayan only. The bayan alternates between two
 * recordings (ge_l and ge_l2) so repeated Dha / Dhin don't sound mechanical. The recordings are
 * in /public/audio/tabla.
 */

export type DayanSample = "na" | "tin" | "tun" | "te" | "tae" | "tak";
export type BayanSample = "ge_l" | "ge_l2" | "ke" | "ket";
export type Sample = DayanSample | BayanSample;

export const DAYAN_SAMPLES: DayanSample[] = ["na", "tin", "tun", "te", "tae", "tak"];
export const BAYAN_FILES: BayanSample[] = ["ge_l", "ge_l2", "ke", "ket"];

export function isDayan(sample: Sample): sample is DayanSample {
  return (DAYAN_SAMPLES as string[]).includes(sample);
}

type Stroke = [tick: number, ...samples: Sample[]];

export type Taal = {
  id: string;
  /** Shown in the picker. */
  label: string;
  /** Ticks (matras) in one pass of the loop. */
  ticks: number;
  /** Beat dots shown in the card (long loops show one theka and repeat it). */
  beats: number;
  /** Beats in each section (vibhag), in order. */
  sections: number[];
  /** Beat numbers (1-based) with an empty-hand wave (khali). */
  khali: number[];
  /** Strokes in order of time. */
  strokes: Stroke[];
};

export const TAALS: Taal[] = [
  {
    id: "teentaal-x2",
    label: "Teentaal · 16 × 2",
    ticks: 32,
    beats: 16,
    sections: [4, 4, 4, 4],
    khali: [9],
    strokes: [
      [0, "na", "ge_l"], [1, "tin", "ge_l2"], [2, "tin", "ge_l"], [3, "na"],
      [4, "na", "ge_l"], [5, "tin", "ge_l2"], [6, "tin", "ge_l"], [7, "na"],
      [8, "na", "ge_l"], [9, "tin"], [10, "tin"], [11, "na"],
      [12, "te"], [12.25, "tae"], [12.5, "ke"], [12.75, "te"],
      [13, "tin", "ge_l"], [14, "tin", "ge_l2"], [15, "na"],
      [16, "na", "ge_l"], [17, "tin", "ge_l2"], [18, "tin", "ge_l"], [19, "na"],
      [20, "na", "ge_l"], [21, "tin", "ge_l2"], [22, "tin", "ge_l"], [23, "na"],
      [23.5, "na"],
      [24, "na", "ge_l"], [25, "tin"], [26, "tin"],
      [27, "tak"], [27.5, "ke"], [28, "te"], [28.5, "tae"],
      [29, "tin", "ge_l"], [30, "tin", "ge_l2"], [31, "na"],
    ],
  },
  {
    id: "teentaal",
    label: "Teentaal · 16",
    ticks: 16,
    beats: 16,
    sections: [4, 4, 4, 4],
    khali: [9],
    strokes: [
      [0, "na", "ge_l"], [1, "tin", "ge_l2"], [2, "tin", "ge_l"], [3, "na"],
      [4, "na", "ge_l"], [5, "tin", "ge_l2"], [6, "tin", "ge_l"], [7, "na"],
      [8, "na", "ge_l"], [9, "tin"], [10, "tin"], [11, "na"],
      [12, "te"], [12.5, "tae"], [13, "tin", "ge_l"], [14, "tin", "ge_l2"], [15, "na"],
    ],
  },
  {
    id: "ektaal",
    label: "Ektaal · 12",
    ticks: 12,
    beats: 12,
    sections: [2, 2, 2, 2, 2, 2],
    khali: [3, 7],
    strokes: [
      [0, "tin", "ge_l"], [1, "tin", "ge_l2"],
      [2, "na", "ge_l"], [2.5, "ge_l"], [2.75, "ge_l2"],
      [3, "te"], [3.25, "tae"], [3.5, "ke"], [3.75, "te"],
      [4, "tun"], [5, "na"], [6, "ket"], [7, "tak"],
      [8, "na", "ge_l"], [8.5, "ge_l"], [8.75, "ge_l2"],
      [9, "te"], [9.25, "tae"], [9.5, "ke"], [9.75, "te"],
      [10, "tin", "ge_l"], [10.5, "tin", "ge_l"], [11, "na"],
    ],
  },
  {
    id: "jhaptaal",
    label: "Jhaptaal · 10",
    ticks: 10,
    beats: 10,
    sections: [2, 3, 2, 3],
    khali: [6],
    strokes: [
      [0, "tin", "ge_l"], [1, "na"],
      [2, "tin", "ge_l"], [2.25, "ge_l2"], [3, "tin", "ge_l"], [4, "na"],
      [5, "te"], [6, "na"],
      [7, "tin", "ge_l"], [7.25, "ge_l2"], [8, "tin", "ge_l"], [9, "na"],
    ],
  },
  {
    id: "rupak",
    label: "Rupak · 7",
    ticks: 7,
    beats: 7,
    sections: [3, 2, 2],
    khali: [1],
    strokes: [
      [0, "tin"], [1, "tin"], [2, "na"],
      [3, "tin", "ge_l"], [3.5, "ge_l2"], [4, "na"],
      [5, "tin", "ge_l"], [5.5, "ge_l2"], [6, "na"],
    ],
  },
  {
    id: "dadra",
    label: "Dadra · 6",
    ticks: 6,
    beats: 6,
    sections: [3, 3],
    khali: [4],
    strokes: [
      [0, "na", "ge_l"], [1, "tin", "ge_l"], [1.5, "ge_l2"], [2, "na"],
      [3, "na"], [4, "tin"], [5, "na"],
    ],
  },
  {
    id: "keherwa",
    label: "Keherwa · 8",
    ticks: 8,
    beats: 8,
    sections: [4, 4],
    khali: [5],
    strokes: [
      [0, "na", "ge_l"], [1, "ge_l"], [1.5, "ge_l2"], [2, "te"], [3, "tae"],
      [4, "na"], [5, "ke"], [6, "tin", "ge_l"], [7, "na"],
    ],
  },
];

export const CLICK_ID = "click";

/** Plain metronome: four beats, the first accented. */
export const CLICK_BEATS = 4;

export function taalById(id: string): Taal | undefined {
  return TAALS.find((t) => t.id === id);
}

/**
 * The dayan is tuned to the harmonium's Sa. The recordings come in semitone steps starting at D,
 * and Sa on the harmonium is C at transpose 0, so the recording index is (transpose - 2) mod 12.
 */
export function tablaIndex(transpose: number) {
  return (((transpose - 2) % 12) + 12) % 12;
}

/** The harmonium recording sits 13.8 cents above equal temperament; match it so they don't beat. */
export const TABLA_DETUNE_CENTS = 13.8;

/** Loudness balance between recordings (the soft closed strokes are lifted, the bayan is lowered). */
export const SAMPLE_GAIN: Record<Sample, number> = {
  na: 1.25,
  tin: 1.4,
  tun: 0.9,
  te: 2.2,
  tae: 2.0,
  tak: 2.5,
  ge_l: 0.75,
  ge_l2: 0.75,
  ke: 2.4,
  ket: 0.85,
};
