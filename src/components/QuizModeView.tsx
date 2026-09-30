import React, { useState } from 'react';
import { ArrowLeft, Check, X, RotateCcw, Award, AlertTriangle, HelpCircle } from 'lucide-react';
import { FlashCard } from '../types';

interface QuizModeViewProps {
  cards: FlashCard[];
  initialSubject?: string;
  onExit: () => void;
  onUpdateCardStatus: (id: string, memorized: boolean) => void;
}

export const QuizModeView: React.FC<QuizModeViewProps> = ({
  cards,
  initialSubject,
  onExit,
  onUpdateCardStatus,
}) => {
  const [deck, setDeck] = useState<FlashCard[]>(() => {
    const list = initialSubject && initialSubject !== 'ALL'
      ? cards.filter((c) => c.subject === initialSubject)
      : cards;
    return list.length > 0 ? list : cards;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<{ correct: number; incorrect: number }>({ correct: 0, incorrect: 0 });
  const [incorrectCards, setIncorrectCards] = useState<FlashCard[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentCard = deck[currentIndex];

  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim()) return;
    setIsAnswerSubmitted(true);
  };

  const handleSelfGrade = (isCorrect: boolean) => {
    if (!currentCard) return;

    if (isCorrect) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      onUpdateCardStatus(currentCard.id, true);
    } else {
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setIncorrectCards((prev) => [...prev, currentCard]);
      onUpdateCardStatus(currentCard.id, false);
    }

    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestartQuiz = (retryOnlyMissed = false) => {
    if (retryOnlyMissed && incorrectCards.length > 0) {
      setDeck(incorrectCards);
    }
    setCurrentIndex(0);
    setUserAnswer('');
    setIsAnswerSubmitted(false);
    setScore({ correct: 0, incorrect: 0 });
    setIncorrectCards([]);
    setIsFinished(false);
  };

  if (deck.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">테스트할 카드가 없습니다</h2>
        <button
          onClick={onExit}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
        >
          로비로 돌아가기
        </button>
      </div>
    );
  }

  // Quiz Finished Screen
  if (isFinished) {
    const total = score.correct + score.incorrect;
    const accuracy = total > 0 ? Math.round((score.correct / total) * 100) : 0;

    return (
      <div className="max-w-lg mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">자가 진단 테스트 완료!</h2>
          <p className="text-xs text-slate-500">
            취약한 부분을 점검하고 복습 필요 카드를 분류했습니다.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 py-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[11px] text-slate-500 block">정답률</span>
            <span className="text-xl font-bold text-indigo-600 font-mono tabular-nums">{accuracy}%</span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-600 block">맞힌 문제</span>
            <span className="text-xl font-bold text-emerald-600 font-mono tabular-nums">{score.correct}개</span>
          </div>
          <div>
            <span className="text-[11px] text-rose-600 block">취약 문제</span>
            <span className="text-xl font-bold text-rose-600 font-mono tabular-nums">{score.incorrect}개</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {incorrectCards.length > 0 && (
            <button
              onClick={() => handleRestartQuiz(true)}
              className="flex-1 py-3 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>틀린 문제({incorrectCards.length})만 다시 풀기</span>
            </button>
          )}

          <button
            onClick={() => handleRestartQuiz(false)}
            className="flex-1 py-3 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>처음부터 다시</span>
          </button>

          <button
            onClick={onExit}
            className="flex-1 py-3 px-4 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            로비로 가기
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>로비로 나가기</span>
        </button>

        <span className="text-xs font-mono font-medium text-slate-500 tabular-nums">
          테스트 {currentIndex + 1} / {deck.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-indigo-600">{currentCard.subject}</span>
          <span className="text-xs text-slate-400 font-medium">취약점 자가 진단</span>
        </div>

        <div className="py-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            문제
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed">
            {currentCard.question}
          </h2>
        </div>

        {!isAnswerSubmitted ? (
          /* User Input Form */
          <form onSubmit={handleSubmitAnswer} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                정답을 직접 입력해보세요
              </label>
              <input
                type="text"
                placeholder="답안을 입력하고 Enter를 누르세요..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setUserAnswer('(답을 모름)');
                  setIsAnswerSubmitted(true);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                잘 모르겠어요 (정답 확인)
              </button>

              <button
                type="submit"
                disabled={!userAnswer.trim()}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-all shadow-xs"
              >
                정답 확인하기
              </button>
            </div>
          </form>
        ) : (
          /* Review and Self-Grade */
          <div className="space-y-5 pt-2 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  내가 작성한 답
                </span>
                <p className="text-sm font-semibold text-slate-800 break-words">
                  {userAnswer}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                  실제 정답
                </span>
                <p className="text-sm font-bold text-indigo-950 break-words">
                  {currentCard.answer}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center space-y-3">
              <p className="text-xs font-medium text-slate-600">
                내 답안이 실제 정답과 일치하나요?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleSelfGrade(false)}
                  className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors shadow-xs"
                >
                  <X className="w-4 h-4" />
                  <span>틀렸어요 (복습 필요)</span>
                </button>

                <button
                  onClick={() => handleSelfGrade(true)}
                  className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>맞았어요 (암기 완료)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
