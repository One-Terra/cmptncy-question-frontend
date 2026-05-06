'use client';

import React, { useState } from 'react';
import { Question, ReviewRequest } from '../types';

interface QuestionReviewFormProps {
  question: Question;
  onSubmit: (review: ReviewRequest) => Promise<void>;
}

export default function QuestionReviewForm({ question, onSubmit }: QuestionReviewFormProps) {
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        questionId: question.questionId,
        reviewerId: 'R1', // Default or from context
        reviewType: question.questionType,
        decision,
        feedback: { quality: decision === 'APPROVED' ? 'good' : 'improvement needed' },
        comments,
      });
      setComments('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedOptions = React.useMemo(() => {
    try {
      if (!question.options) return [];
      const data = JSON.parse(question.options);
      return data.options || [];
    } catch (e) {
      return [];
    }
  }, [question.options]);

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{question.questionId}</h2>
          <span className="text-sm px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400">
            {question.questionType}
          </span>
        </div>
        
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-white/10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Question Stem</h3>
          <p className="text-lg leading-relaxed text-zinc-800 dark:text-zinc-200">
            {question.stemEnglish}
          </p>
        </div>

        {/* Options Section */}
        {parsedOptions.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {parsedOptions.map((opt: any) => {
                const isCorrect = question.correctOptionIds?.includes(opt.id);
                return (
                  <div 
                    key={opt.id} 
                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all
                      ${isCorrect 
                        ? 'bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20' 
                        : 'bg-white dark:bg-zinc-900/30 border-zinc-200 dark:border-white/10'}`}
                  >
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold
                      ${isCorrect 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                      {opt.id}
                    </span>
                    <span className="text-zinc-800 dark:text-zinc-200">{opt.text}</span>
                    {isCorrect && (
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        Correct
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/10">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Primary Concept</h3>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">{question.conceptIdPrimary}</p>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/10">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Difficulty</h3>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">{question.difficultyLevel}</p>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/10">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Marks</h3>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">{question.marks}</p>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/10">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Correct Options</h3>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">{question.correctOptionIds?.join(', ') || 'None'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Decision</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setDecision('APPROVED')}
              className={`flex-1 py-3 rounded-xl border-2 transition-all duration-200 font-bold
                ${decision === 'APPROVED' 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]' 
                  : 'bg-white dark:bg-black border-zinc-200 dark:border-white/10 text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20'}`}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setDecision('REJECTED')}
              className={`flex-1 py-3 rounded-xl border-2 transition-all duration-200 font-bold
                ${decision === 'REJECTED' 
                  ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]' 
                  : 'bg-white dark:bg-black border-zinc-200 dark:border-white/10 text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20'}`}
            >
              Reject
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="comments" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Review Comments</label>
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add your review comments here..."
            className="w-full h-32 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-white/10 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-white/20 outline-none transition-all resize-none text-zinc-800 dark:text-zinc-200"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !comments}
          className="w-full py-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black rounded-2xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Submitting...
            </div>
          ) : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
