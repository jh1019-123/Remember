import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Edit2, Trash2, RotateCw } from 'lucide-react';
import { FlashCard } from '../types';

interface CardItemProps {
  card: FlashCard;
  onToggleMemorized: (id: string) => void;
  onEdit: (card: FlashCard) => void;
  onDelete: (id: string) => void;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onToggleMemorized,
  onEdit,
  onDelete,
}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 bg-white ${
        card.isMemorized
          ? 'border-slate-200/80 bg-white/70 shadow-xs'
          : 'border-amber-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      <div>
        {/* Card Header: Subject & Actions */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-indigo-600">{card.subject}</span>
            <span className="text-slate-300">·</span>
            <span className={card.isMemorized ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
              {card.isMemorized ? '암기 완료' : '복습 필요 (취약점)'}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(card)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="카드 수정"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(card.id)}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="카드 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Question Area */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            문제
          </div>
          <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-4">
            {card.question}
          </p>
        </div>

        {/* Answer Area (Expandable / Revealable) */}
        <div className="mt-2">
          {isRevealed ? (
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100/80 text-slate-900 space-y-1 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  정답
                </span>
                <button
                  onClick={() => setIsRevealed(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <EyeOff className="w-3 h-3" />
                  <span>숨기기</span>
                </button>
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed break-words">
                {card.answer}
              </p>
            </div>
          ) : (
            <button
              onClick={() => setIsRevealed(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span>정답 확인하기</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Footer: Memorized Status Toggle */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={() => onToggleMemorized(card.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
            card.isMemorized
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          {card.isMemorized ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>암기 완료됨</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>취약점 보완하기</span>
            </>
          )}
        </button>

        <span className="text-[11px] text-slate-400 tabular-nums">
          복습 {card.reviewCount}회
        </span>
      </div>
    </div>
  );
};
