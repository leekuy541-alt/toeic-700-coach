export type Page = 'home' | 'part5' | 'vocab' | 'today' | 'guide';

export interface Part5Question {
  id: number;
  sentence: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanationKo: string;
}

export interface VocabWord {
  id: number;
  word: string;
  meaningKo: string;
  example: string;
}

export interface AppState {
  streak: number;
  daysStudied: number;
  lastStudyDate: string | null;
  lastPart5Score: { correct: number; total: number; date: string } | null;
  knownVocabIds: number[];
  unknownVocabIds: number[];
  completedDays: string[];
}

export const DEFAULT_STATE: AppState = {
  streak: 0,
  daysStudied: 0,
  lastStudyDate: null,
  lastPart5Score: null,
  knownVocabIds: [],
  unknownVocabIds: [],
  completedDays: [],
};
