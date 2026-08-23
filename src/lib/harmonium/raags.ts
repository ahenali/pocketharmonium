export type Raag = { id: string; name: string; notes: number[]; note: string };

export const RAAGS: Raag[] = [
  { id: "yaman", name: "Yaman", notes: [0, 2, 4, 6, 7, 9, 11], note: "Evening; sharp Ma" },
  { id: "bilawal", name: "Bilawal", notes: [0, 2, 4, 5, 7, 9, 11], note: "Morning; all natural" },
  { id: "bhairav", name: "Bhairav", notes: [0, 1, 4, 5, 7, 8, 11], note: "Dawn; flat Re & Dha" },
  { id: "bhairavi", name: "Bhairavi", notes: [0, 1, 3, 5, 7, 8, 10], note: "Closing; all flats" },
  { id: "kafi", name: "Kafi", notes: [0, 2, 3, 5, 7, 9, 10], note: "Late night; flat Ga & Ni" },
  { id: "asavari", name: "Asavari", notes: [0, 2, 3, 5, 7, 8, 10], note: "Late morning" },
  { id: "khamaj", name: "Khamaj", notes: [0, 2, 4, 5, 7, 9, 10], note: "Light; flat Ni" },
  { id: "bhupali", name: "Bhupali", notes: [0, 2, 4, 7, 9], note: "Pentatonic; evening" },
  { id: "marwa", name: "Marwa", notes: [0, 1, 4, 6, 7, 9, 11], note: "Sunset; omits Pa" },
  { id: "todi", name: "Todi", notes: [0, 1, 3, 6, 7, 8, 11], note: "Morning; sharp Ma" },
];

export function raagById(id: string) {
  return RAAGS.find((r) => r.id === id);
}
