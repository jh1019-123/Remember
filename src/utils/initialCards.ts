import { FlashCard } from '../types';

export const DEFAULT_SUBJECTS = ['과학', '수학', '영어', '국어', '한국사', '사회'];

export const INITIAL_CARDS: FlashCard[] = [];

const CARDS_STORAGE_KEY = 'remembering_cards_v1';
const SUBJECTS_STORAGE_KEY = 'remembering_subjects_v1';

export function loadStoredCards(): FlashCard[] {
  try {
    const raw = localStorage.getItem(CARDS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Remove any previously saved sample cards as requested by the user
      const userCards = parsed.filter(
        (card: FlashCard) => card && typeof card.id === 'string' && !card.id.startsWith('sample-card-')
      );
      // Update storage with cleaned list
      saveStoredCards(userCards);
      return userCards;
    }
    return [];
  } catch (e) {
    console.error('Failed to load cards from localStorage', e);
    return [];
  }
}

export function saveStoredCards(cards: FlashCard[]): void {
  try {
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save cards to localStorage', e);
  }
}

export function loadStoredSubjects(): string[] {
  try {
    const raw = localStorage.getItem(SUBJECTS_STORAGE_KEY);
    if (!raw) {
      saveStoredSubjects(DEFAULT_SUBJECTS);
      return DEFAULT_SUBJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SUBJECTS;
  } catch (e) {
    console.error('Failed to load subjects from localStorage', e);
    return DEFAULT_SUBJECTS;
  }
}

export function saveStoredSubjects(subjects: string[]): void {
  try {
    localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects to localStorage', e);
  }
}
