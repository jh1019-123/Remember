import React, { useState } from 'react';
import { Plus, Check, X, BookOpen, Layers } from 'lucide-react';
import { FlashCard } from '../types';

interface SubjectFilterBarProps {
  selectedSubject: string; // 'ALL' or specific subject
  onSelectSubject: (subject: string) => void;
  subjects: string[];
  cards: FlashCard[];
  onAddSubject: (newSubject: string) => void;
}

export const SubjectFilterBar: React.FC<SubjectFilterBarProps> = ({
  selectedSubject,
  onSelectSubject,
  subjects,
  cards,
  onAddSubject,
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newSubInput, setNewSubInput] = useState<string>('');

  const getSubjectCardCount = (sub: string) => {
    return cards.filter((c) => c.subject === sub).length;
  };

  const handleAddNewSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSubInput.trim();
    if (clean && !subjects.includes(clean)) {
      onAddSubject(clean);
      onSelectSubject(clean);
      setNewSubInput('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Segmented Selector */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-full overflow-x-auto scrollbar-none">
          {/* 전체 카드 확인하기 Tab */}
          <button
            onClick={() => onSelectSubject('ALL')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              selectedSubject === 'ALL'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>전체 카드 확인하기</span>
            <span
              className={`text-[11px] font-mono tabular-nums ${
                selectedSubject === 'ALL' ? 'text-indigo-600 font-bold' : 'text-slate-400'
              }`}
            >
              {cards.length}
            </span>
          </button>

          {/* 과목별 카드 Tabs */}
          {subjects.map((sub) => {
            const isSelected = selectedSubject === sub;
            const count = getSubjectCardCount(sub);
            return (
              <button
                key={sub}
                onClick={() => onSelectSubject(sub)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{sub}</span>
                <span
                  className={`text-[11px] font-mono tabular-nums ${
                    isSelected ? 'text-indigo-600 font-bold' : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add Subject Button / Input */}
        <div className="flex items-center">
          {isAdding ? (
            <form onSubmit={handleAddNewSubject} className="flex items-center gap-1">
              <input
                type="text"
                placeholder="과목 이름..."
                value={newSubInput}
                onChange={(e) => setNewSubInput(e.target.value)}
                maxLength={15}
                className="px-2.5 py-1 text-xs border border-indigo-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-28 bg-white"
                autoFocus
              />
              <button
                type="submit"
                className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                title="과목 추가"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewSubInput('');
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                title="취소"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-lg border border-dashed border-slate-300 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>과목 추가</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
