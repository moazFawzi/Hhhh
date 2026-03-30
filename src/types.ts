export interface Card {
  id: string;
  term: string;
  definition: string;
  level: number; // 0 to 5
  nextReviewDate: string; // ISO string
  createdAt: string;
}

export type ReviewDifficulty = 'again' | 'hard' | 'good' | 'easy';

export const SRS_INTERVALS = [1, 2, 4, 7, 14, 30]; // Days
