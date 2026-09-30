import React from 'react';
import { Plus, BookOpen, Layers, CheckSquare } from 'lucide-react';
import { ViewMode } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface HeaderProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenAddModal: () => void;
  totalCardsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  onOpenAddModal,
  totalCardsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectView('lobby')}
            className="text-left group flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-indigo-700 transition-colors">
              R
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Remembering
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectView('lobby')}
            className={`flex items-center gap-1.5 transition-colors pb-0.5 border-b-2 ${
              currentView === 'lobby'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>카드 보관함</span>
            <span className="text-xs text-slate-400 font-normal">({totalCardsCount})</span>
          </button>

          <button
            onClick={() => onSelectView('study')}
            className={`flex items-center gap-1.5 transition-colors pb-0.5 border-b-2 ${
              currentView === 'study'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>플래시카드 암기</span>
          </button>

          <button
            onClick={() => onSelectView('quiz')}
            className={`flex items-center gap-1.5 transition-colors pb-0.5 border-b-2 ${
              currentView === 'quiz'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>자가 진단 테스트</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions + Audio Player */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Player Widget */}
          <AudioPlayer />

          {/* Quick Add Card Action */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">새 카드 추가</span>
            <span className="sm:hidden">추가</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="md:hidden flex border-t border-slate-100 bg-slate-50/50 px-4 py-2 justify-around text-xs font-medium">
        <button
          onClick={() => onSelectView('lobby')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md ${
            currentView === 'lobby' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>보관함 ({totalCardsCount})</span>
        </button>
        <button
          onClick={() => onSelectView('study')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md ${
            currentView === 'study' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>암기 모드</span>
        </button>
        <button
          onClick={() => onSelectView('quiz')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md ${
            currentView === 'quiz' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-600'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>테스트</span>
        </button>
      </div>
    </header>
  );
};
