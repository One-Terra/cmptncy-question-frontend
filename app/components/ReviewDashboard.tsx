'use client';

import React, { useState, useEffect } from 'react';
import QuestionList from './QuestionList';
import QuestionReviewForm from './QuestionReviewForm';
import { Question, ReviewRequest, PaginatedResponse, ApiResponse, ChapterCount } from '../types';

export default function ReviewDashboard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  const [chapterCounts, setChapterCounts] = useState<ChapterCount[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const fetchChapterCounts = async () => {
    try {
      const response = await fetch(`/api/questions/chapter-counts`);
      if (response.ok) {
        const data = await response.json();
        setChapterCounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch chapter counts:', err);
    }
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = selectedChapter 
        ? `/api/questions?chapter=${encodeURIComponent(selectedChapter)}&page=0&size=50&sortBy=questionId&direction=asc`
        : `/api/questions?page=0&size=50&sortBy=questionId&direction=asc`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data: PaginatedResponse<Question> = await response.json();
      setQuestions(data.content);
      
      if (selectedQuestion) {
        const updated = data.content.find(q => q.questionId === selectedQuestion.questionId);
        if (updated) setSelectedQuestion(updated);
      } else if (data.content.length > 0) {
        setSelectedQuestion(data.content[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChapterCounts();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedChapter]);

  const handleReviewSubmit = async (review: ReviewRequest) => {
    try {
      const response = await fetch(`/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify(review),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      const result: ApiResponse<any> = await response.json();
      alert(result.message || 'Review submitted successfully!');

      // Refresh list to show updated status
      await fetchQuestions();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black overflow-hidden">
      {/* Sidebar */}
      <div className="w-[400px] flex flex-col border-r border-zinc-100 dark:border-white/5">
        <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex-shrink-0">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Cmptncy Review Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Pending items to review</p>
          
          {/* Chapter Filter Dashboard */}
          {chapterCounts.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">Filter by Chapter</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedChapter(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                    ${selectedChapter === null 
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md' 
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                >
                  All
                </button>
                {chapterCounts.map((chapterCount) => (
                  <button
                    key={chapterCount.chapter}
                    onClick={() => setSelectedChapter(chapterCount.chapter)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                      ${selectedChapter === chapterCount.chapter 
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md' 
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                  >
                    <span className="max-w-[150px] truncate">{chapterCount.chapter}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] 
                      ${selectedChapter === chapterCount.chapter 
                        ? 'bg-white/20 dark:bg-black/20' 
                        : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                      {chapterCount.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <QuestionList
          questions={questions}
          selectedId={selectedQuestion?.questionId}
          onSelect={setSelectedQuestion}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-900/10">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Connection Error</h2>
            <p className="text-zinc-500 max-w-sm">{error}. Please make sure the backend API is running.</p>
            <button
              onClick={fetchQuestions}
              className="px-6 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black rounded-lg font-medium hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        ) : selectedQuestion ? (
          <QuestionReviewForm
            question={selectedQuestion}
            onSubmit={handleReviewSubmit}
            onReviewChange={fetchQuestions}
          />
        ) : !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <p>No questions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
