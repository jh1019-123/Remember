import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LobbyView } from './components/LobbyView';
import { StudyModeView } from './components/StudyModeView';
import { QuizModeView } from './components/QuizModeView';
import { CardModal } from './components/CardModal';
import { FlashCard, ViewMode } from './types';
import {
  loadStoredCards,
  saveStoredCards,
  loadStoredSubjects,
  saveStoredSubjects,
} from './utils/initialCards';

export default function App() {
  const [cards, setCards] = useState<FlashCard[]>(() => loadStoredCards());
  const [subjects, setSubjects] = useState<string[]>(() => loadStoredSubjects());
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [currentView, setCurrentView] = useState<ViewMode>('lobby');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);

  // Sync cards to localStorage
  useEffect(() => {
    saveStoredCards(cards);
  }, [cards]);

  // Sync subjects to localStorage
  useEffect(() => {
    saveStoredSubjects(subjects);
  }, [subjects]);

  const handleAddNewSubject = (newSubject: string) => {
    if (!subjects.includes(newSubject)) {
      const updated = [...subjects, newSubject];
      setSubjects(updated);
    }
  };

  const handleSaveCard = (cardData: {
    subject: string;
    question: string;
    answer: string;
    id?: string;
  }) => {
    if (cardData.id) {
      // Edit existing card
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardData.id
            ? {
                ...c,
                subject: cardData.subject,
                question: cardData.question,
                answer: cardData.answer,
              }
            : c
        )
      );
    } else {
      // Create new card
      const newCard: FlashCard = {
        id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subject: cardData.subject,
        question: cardData.question,
        answer: cardData.answer,
        createdAt: Date.now(),
        isMemorized: false,
        reviewCount: 0,
      };
      setCards((prev) => [newCard, ...prev]);
    }

    // Auto add subject if not present
    handleAddNewSubject(cardData.subject);
  };

  const handleToggleMemorized = (id: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isMemorized: !c.isMemorized,
              reviewCount: (c.reviewCount || 0) + 1,
              lastReviewedAt: Date.now(),
            }
          : c
      )
    );
  };

  const handleMarkMemorized = (id: string, isMemorized: boolean) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isMemorized,
              reviewCount: (c.reviewCount || 0) + 1,
              lastReviewedAt: Date.now(),
            }
          : c
      )
    );
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('이 카드를 정말 삭제하시겠습니까?')) {
      setCards((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleClearAllCards = () => {
    if (cards.length === 0) return;
    if (confirm('등록된 모든 카드를 삭제하시겠습니까?')) {
      setCards([]);
    }
  };

  const handleEditCard = (card: FlashCard) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleStartStudy = (targetSubject?: string) => {
    if (targetSubject) {
      setSelectedSubject(targetSubject);
    }
    setCurrentView('study');
  };

  const handleStartQuiz = (targetSubject?: string) => {
    if (targetSubject) {
      setSelectedSubject(targetSubject);
    }
    setCurrentView('quiz');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. Header (Strict Top Bar Contract) */}
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenAddModal={handleOpenAddModal}
        totalCardsCount={cards.length}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentView === 'lobby' && (
          <LobbyView
            cards={cards}
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            onAddSubject={handleAddNewSubject}
            onToggleMemorized={handleToggleMemorized}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onClearAllCards={handleClearAllCards}
            onOpenAddModal={handleOpenAddModal}
            onStartStudy={handleStartStudy}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {currentView === 'study' && (
          <StudyModeView
            cards={cards}
            initialSubject={selectedSubject}
            onExit={() => setCurrentView('lobby')}
            onMarkMemorized={handleMarkMemorized}
          />
        )}

        {currentView === 'quiz' && (
          <QuizModeView
            cards={cards}
            initialSubject={selectedSubject}
            onExit={() => setCurrentView('lobby')}
            onUpdateCardStatus={handleMarkMemorized}
          />
        )}
      </main>

      {/* 3. Card Add / Edit Modal */}
      <CardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCard}
        availableSubjects={subjects}
        onAddNewSubject={handleAddNewSubject}
        initialCard={editingCard}
        defaultSubject={selectedSubject}
      />

      {/* 4. Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Remembering</span>
            <span aria-hidden="true">·</span>
            <span>학생들을 위한 취약점 집중 플래시카드</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>모든 데이터는 브라우저에 안전하게 보관됩니다</span>
            <span aria-hidden="true">·</span>
            <span>Web Audio BGM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
