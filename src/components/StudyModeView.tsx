import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Shuffle, CheckCircle, AlertCircle, Sparkles, X } from 'lucide-react';
import { FlashCard } from '../types';

interface StudyModeViewProps {
  cards: FlashCard[];
  initialSubject?: string;
  onExit: () => void;
  onMarkMemorized: (id: string, isMemorized: boolean) => void;
}

export const StudyModeView: React.FC<StudyModeViewProps> = ({
  cards,
  initialSubject,
  onExit,
  onMarkMemorized,
}) => {
  const [deck, setDeck] = useState<FlashCard[]>(() => {
    const list = initialSubject && initialSubject !== 'ALL'
      ? cards.filter((c) => c.subject === initialSubject)
      : cards;
    return list.length > 0 ? list : cards;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const currentCard = deck[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, deck.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleToggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMark = (memorized: boolean) => {
    if (!currentCard) return;
    onMarkMemorized(currentCard.id, memorized);

    // Update local deck item state
    setDeck((prev) =>
      prev.map((c, idx) =>
        idx === currentIndex ? { ...c, isMemorized: memorized, reviewCount: (c.reviewCount || 0) + 1 } : c
      )
    );

    // Auto proceed to next card if available
    if (currentIndex < deck.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 250);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        handleMark(false);
      } else if (e.key === '2') {
        handleMark(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleToggleFlip, currentCard]);

  if (!currentCard) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">학습할 카드가 없습니다</h2>
        <p className="text-xs text-slate-500">먼저 문제와 답이 적힌 카드를 추가해주세요.</p>
        <button
          onClick={onExit}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
        >
          로비로 돌아가기
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>로비로 나가기</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-medium text-slate-500 tabular-nums">
            {currentIndex + 1} / {deck.length} 카드
          </span>
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg border border-slate-200 transition-colors"
            title="카드 순서 섞기"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>섞기</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Flashcard Area (3D Flip Animation) */}
      <div className="perspective-1000 min-h-[360px] sm:min-h-[400px] cursor-pointer" onClick={handleToggleFlip}>
        <div
          className={`relative w-full h-full min-h-[360px] sm:min-h-[400px] transition-transform duration-500 preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT: Question */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-lg flex flex-col justify-between select-none">
            {/* Front Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-indigo-600 tracking-wide">
                {currentCard.subject}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                문제 (Question)
              </span>
            </div>

            {/* Front Body */}
            <div className="my-auto py-6 text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed break-keep">
                {currentCard.question}
              </p>
            </div>

            {/* Front Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-indigo-500 animate-spin [animation-duration:4s]" />
                <span>클릭하거나 스페이스바로 답안 확인</span>
              </div>
              <span className="tabular-nums font-mono">
                복습 {currentCard.reviewCount}회
              </span>
            </div>
          </div>

          {/* BACK: Answer */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col justify-between select-none">
            {/* Back Header */}
            <div className="flex items-center justify-between pb-4 border-b border-indigo-800/80">
              <span className="text-xs font-bold text-indigo-300 tracking-wide">
                {currentCard.subject}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                정답 (Answer)
              </span>
            </div>

            {/* Back Body */}
            <div className="my-auto py-6 text-center">
              <p className="text-xl sm:text-2xl font-bold text-emerald-200 leading-relaxed break-keep">
                {currentCard.answer}
              </p>
            </div>

            {/* Back Footer */}
            <div className="pt-4 border-t border-indigo-800/80 flex items-center justify-between text-xs text-indigo-300/80">
              <div className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>클릭하여 문제로 돌아가기</span>
              </div>
              <span>
                {currentCard.isMemorized ? '✓ 현재 암기 완료 상태' : '! 현재 복습 필요 상태'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Answer Evaluation Controls */}
      <div className="space-y-4">
        {/* Next / Prev Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none rounded-xl border border-slate-200 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>이전 카드</span>
          </button>

          <button
            onClick={handleToggleFlip}
            className="px-5 py-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors shadow-xs whitespace-nowrap"
          >
            {isFlipped ? '문제 보기' : '정답 확인'}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === deck.length - 1}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none rounded-xl border border-slate-200 transition-colors shadow-xs"
          >
            <span>다음 카드</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Self Evaluation Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleMark(false)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 active:scale-98 rounded-2xl border border-amber-200 transition-all shadow-xs"
          >
            <AlertCircle className="w-4 h-4" />
            <span>다시 볼래요 (단축키 1)</span>
          </button>

          <button
            onClick={() => handleMark(true)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-98 rounded-2xl border border-emerald-200 transition-all shadow-xs"
          >
            <CheckCircle className="w-4 h-4" />
            <span>완벽히 외웠어요 (단축키 2)</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-slate-400">
            키보드 단축키: <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[10px]">스페이스바</kbd> 뒤집기 · <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[10px]">←</kbd> 이전 · <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[10px]">→</kbd> 다음
          </p>
        </div>
      </div>
    </div>
  );
};
