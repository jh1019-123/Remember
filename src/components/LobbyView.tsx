import React, { useState, useMemo } from 'react';
import { Search, Plus, BookOpen, CheckSquare, Sparkles, Filter, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { FlashCard, ViewMode } from '../types';
import { SubjectFilterBar } from './SubjectFilterBar';
import { CardItem } from './CardItem';

interface LobbyViewProps {
  cards: FlashCard[];
  subjects: string[];
  selectedSubject: string;
  onSelectSubject: (sub: string) => void;
  onAddSubject: (newSub: string) => void;
  onToggleMemorized: (id: string) => void;
  onEditCard: (card: FlashCard) => void;
  onDeleteCard: (id: string) => void;
  onClearAllCards?: () => void;
  onOpenAddModal: () => void;
  onStartStudy: (targetSubject?: string) => void;
  onStartQuiz: (targetSubject?: string) => void;
}

type StatusFilter = 'all' | 'need_review' | 'memorized';

export const LobbyView: React.FC<LobbyViewProps> = ({
  cards,
  subjects,
  selectedSubject,
  onSelectSubject,
  onAddSubject,
  onToggleMemorized,
  onEditCard,
  onDeleteCard,
  onClearAllCards,
  onOpenAddModal,
  onStartStudy,
  onStartQuiz,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Filter cards by subject, search, and status
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // 1. Subject filter
      if (selectedSubject !== 'ALL' && card.subject !== selectedSubject) {
        return false;
      }
      // 2. Status filter
      if (statusFilter === 'need_review' && card.isMemorized) {
        return false;
      }
      if (statusFilter === 'memorized' && !card.isMemorized) {
        return false;
      }
      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuestion = card.question.toLowerCase().includes(query);
        const matchesAnswer = card.answer.toLowerCase().includes(query);
        const matchesSub = card.subject.toLowerCase().includes(query);
        return matchesQuestion || matchesAnswer || matchesSub;
      }
      return true;
    });
  }, [cards, selectedSubject, statusFilter, searchQuery]);

  // Overall statistics
  const currentDeckCards = selectedSubject === 'ALL'
    ? cards
    : cards.filter((c) => c.subject === selectedSubject);

  const totalCount = currentDeckCards.length;
  const memorizedCount = currentDeckCards.filter((c) => c.isMemorized).length;
  const needReviewCount = totalCount - memorizedCount;
  const progressPercent = totalCount > 0 ? Math.round((memorizedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Lobby Banner / Study Deck Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>학생들을 위한 스마트 암기 노트</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              {selectedSubject === 'ALL' ? '전체 과목 카드 보관함' : `${selectedSubject} 과목 카드 보관함`}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              취약한 문제를 카드에 적어두고 반복해서 복습하세요. 차분한 배경음악을 들으며 헷갈리는 개념을 완벽하게 내 것으로 만들 수 있습니다.
            </p>
          </div>

          {/* Quick CTA Launchers */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <button
              onClick={() => onStartStudy(selectedSubject === 'ALL' ? undefined : selectedSubject)}
              disabled={filteredCards.length === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs transition-all active:scale-98 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              <span>플래시카드 암기 시작</span>
            </button>
            <button
              onClick={() => onStartQuiz(selectedSubject === 'ALL' ? undefined : selectedSubject)}
              disabled={filteredCards.length === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all whitespace-nowrap"
            >
              <CheckSquare className="w-4 h-4" />
              <span>테스트 모드</span>
            </button>
          </div>
        </div>

        {/* Deck Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-slate-500 block">전체 카드 수</span>
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {totalCount}개
            </span>
          </div>

          <div>
            <span className="text-[11px] text-amber-600 block">복습 필요 (취약점)</span>
            <span className="text-xl font-bold text-amber-600 font-mono tabular-nums">
              {needReviewCount}개
            </span>
          </div>

          <div>
            <span className="text-[11px] text-emerald-600 block">암기 완료</span>
            <span className="text-xl font-bold text-emerald-600 font-mono tabular-nums">
              {memorizedCount}개
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>암기 달성률</span>
              <span className="font-semibold text-indigo-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Subject Tabs (과목별로 카드 확인하기 / 전체 카드 확인하기) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <SubjectFilterBar
          selectedSubject={selectedSubject}
          onSelectSubject={onSelectSubject}
          subjects={subjects}
          cards={cards}
          onAddSubject={onAddSubject}
        />

        {/* 3. Search and Secondary Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="문제나 정답 검색 (예: 물은 몇 도, 광합성...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                지우기
              </button>
            )}
          </div>

          {/* Filter Status Selector */}
          <div className="flex items-center gap-1 self-end sm:self-auto text-xs">
            <span className="text-slate-400 mr-1 text-[11px] hidden md:inline">상태 필터:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setStatusFilter('need_review')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1 ${
                statusFilter === 'need_review'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <span>복습 필요</span>
              <span className="text-[10px] tabular-nums font-mono">({needReviewCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('memorized')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1 ${
                statusFilter === 'memorized'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <span>암기 완료</span>
              <span className="text-[10px] tabular-nums font-mono">({memorizedCount})</span>
            </button>

            {cards.length > 0 && onClearAllCards && (
              <button
                onClick={onClearAllCards}
                className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors font-medium ml-1"
                title="모든 카드 일괄 삭제"
              >
                전체 비우기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Cards Grid Display */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onToggleMemorized={onToggleMemorized}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery ? '검색 결과가 없습니다' : '표시할 카드가 없습니다'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `'${searchQuery}'에 일치하는 카드가 없습니다. 검색어를 변경해보세요.`
                : '새로운 취약점 문제와 답을 작성해 나만의 카드를 추가해보세요!'}
            </p>
          </div>
          <div>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>새 카드 만들기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
