import React, { useState, useEffect } from 'react';
import { X, Check, BookPlus, Sparkles } from 'lucide-react';
import { FlashCard } from '../types';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: { subject: string; question: string; answer: string; id?: string }) => void;
  availableSubjects: string[];
  onAddNewSubject: (subject: string) => void;
  initialCard?: FlashCard | null;
  defaultSubject?: string;
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableSubjects,
  onAddNewSubject,
  initialCard,
  defaultSubject,
}) => {
  const [subject, setSubject] = useState<string>('');
  const [isCustomSubject, setIsCustomSubject] = useState<boolean>(false);
  const [customSubjectName, setCustomSubjectName] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialCard) {
        setSubject(initialCard.subject);
        setQuestion(initialCard.question);
        setAnswer(initialCard.answer);
        setIsCustomSubject(!availableSubjects.includes(initialCard.subject));
        setCustomSubjectName(initialCard.subject);
      } else {
        const initialSub = defaultSubject && defaultSubject !== 'ALL' ? defaultSubject : (availableSubjects[0] || '과학');
        setSubject(initialSub);
        setQuestion('');
        setAnswer('');
        setIsCustomSubject(false);
        setCustomSubjectName('');
      }
      setErrorMsg('');
    }
  }, [isOpen, initialCard, defaultSubject, availableSubjects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubject = (isCustomSubject ? customSubjectName : subject).trim();
    const cleanQuestion = question.trim();
    const cleanAnswer = answer.trim();

    if (!finalSubject) {
      setErrorMsg('어느 과목인지 선택하거나 입력해주세요.');
      return;
    }
    if (!cleanQuestion) {
      setErrorMsg('문제 칸을 작성해주세요.');
      return;
    }
    if (!cleanAnswer) {
      setErrorMsg('답안 칸을 작성해주세요.');
      return;
    }

    if (isCustomSubject && customSubjectName.trim()) {
      onAddNewSubject(customSubjectName.trim());
    }

    onSave({
      id: initialCard?.id,
      subject: finalSubject,
      question: cleanQuestion,
      answer: cleanAnswer,
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialCard ? '카드 수정하기' : '새 플래시카드 만들기'}
              </h2>
              <p className="text-xs text-slate-500">
                문제와 답, 과목만 쏙 입력하여 취약점을 채워보세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* 1. Subject Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                과목 선택 <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomSubject(!isCustomSubject);
                  setCustomSubjectName('');
                }}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 underline transition-colors"
              >
                {isCustomSubject ? '기존 과목 목록에서 선택' : '+ 새 과목 직접 입력'}
              </button>
            </div>

            {isCustomSubject ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="예: 과학, 물리, 화학, 일본어 등"
                  value={customSubjectName}
                  onChange={(e) => setCustomSubjectName(e.target.value)}
                  maxLength={20}
                  className="w-full px-3.5 py-2 text-sm border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-indigo-50/20"
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {availableSubjects.map((sub) => {
                  const isSelected = subject === sub;
                  return (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => setSubject(sub)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Question Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                문제 (Question) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">예: 물은 몇 도에서 끓나?</span>
            </div>
            <textarea
              rows={3}
              placeholder="외우고 싶거나 취약한 문제를 입력하세요."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 3. Answer Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                답안 (Answer) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">예: 100도</span>
            </div>
            <textarea
              rows={3}
              placeholder="문제에 해당하는 정확한 답안을 입력하세요."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              단축키: <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Enter</kbd>로 저장
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{initialCard ? '수정 완료' : '카드 저장'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
