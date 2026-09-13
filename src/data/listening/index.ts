import generated from './generated.json' with { type: 'json' };

export interface Utterance {
  text: string;
  accent: string;
  voice: string;
}

export interface ChoiceQuestion {
  q: string;
  choices: string[];
  answer: number;
  explanationKo: string;
}

export interface Part1Item {
  id: number;
  image: string;
  imageAlt: string;
  audio: string;
  statements: Utterance[];
  answer: number;
  explanationKo: string;
  accents: string[];
}

export interface Part2Item {
  id: number;
  audio: string;
  question: Utterance;
  responses: Utterance[];
  answer: number;
  explanationKo: string;
  accents: string[];
}

export interface Part3Item {
  id: number;
  title: string;
  audio: string;
  transcript: string;
  speakers: Utterance[];
  questions: ChoiceQuestion[];
  accents: string[];
}

export interface Part4Item {
  id: number;
  title: string;
  audio: string;
  transcript: string;
  accent: string;
  voice: string;
  questions: ChoiceQuestion[];
  accents: string[];
}

export const LISTENING_VOICES = generated.voices as Record<string, string>;
export const PART1_ITEMS = generated.part1 as Part1Item[];
export const PART2_ITEMS = generated.part2 as Part2Item[];
export const PART3_ITEMS = generated.part3 as Part3Item[];
export const PART4_ITEMS = generated.part4 as Part4Item[];

export const LC_COUNTS = {
  part1: PART1_ITEMS.length,
  part2: PART2_ITEMS.length,
  part3: PART3_ITEMS.length,
  part4: PART4_ITEMS.length,
};
