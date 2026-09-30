export interface FlashCard {
  id: string;
  subject: string;
  question: string;
  answer: string;
  createdAt: number;
  isMemorized: boolean;
  reviewCount: number;
  lastReviewedAt?: number;
}

export type ViewMode = 'lobby' | 'study' | 'quiz';

export type SoundTrackId = 'lofi_piano' | 'gentle_rain' | 'alpha_wave' | 'white_noise' | 'night_chimes';

export interface SoundTrack {
  id: SoundTrackId;
  name: string;
  description: string;
  icon: string;
}
