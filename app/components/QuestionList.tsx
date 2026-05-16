import React from 'react';
import { Question } from '../types';

interface QuestionListProps {
  questions: Question[];
  selectedId?: string;
  onSelect: (question: Question) => void;
  isLoading: boolean;
}

export default function QuestionList({ questions, selectedId, onSelect, isLoading }: QuestionListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      {questions.map((q) => (
        <button
          key={q.questionId}
          onClick={() => onSelect(q)}
          className={`group relative flex flex-col items-start gap-1 p-4 text-left transition-all duration-300 rounded-xl border border-transparent
            ${selectedId === q.questionId 
              ? 'bg-zinc-900/5 dark:bg-white/5 border-zinc-200 dark:border-white/10 shadow-lg scale-[1.02]' 
              : 'hover:bg-zinc-900/5 dark:hover:bg-white/5 hover:border-zinc-100 dark:hover:border-white/5'
            }`}
        >
          <div className="flex w-full items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">
                {q.chapter} • {q.conceptDisplayName}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-600 italic">
                {q.topic} › {q.subtopic}
              </span>
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider
              ${q.reviewStatus?.toUpperCase() === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                q.reviewStatus?.toUpperCase() === 'REJECTED' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 
                'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              {q.reviewStatus || 'PENDING'}
            </span>
          </div>
          <p className="line-clamp-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">
            {q.stem}
          </p>
          <div className="flex gap-2 mt-1">
             <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
               {q.questionType}
             </span>
             <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
               {q.difficulty}
             </span>
          </div>
        </button>
      ))}
    </div>
  );
}
