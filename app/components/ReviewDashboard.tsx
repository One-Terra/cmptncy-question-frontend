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
  const [totalQuestions, setTotalQuestions] = useState(0);

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
      // First request to get the dynamic total count
      const initialUrl = selectedChapter 
        ? `/api/questions?chapter=${encodeURIComponent(selectedChapter)}&page=0&size=1`
        : `/api/questions?page=0&size=1`;
        
      const initialResponse = await fetch(initialUrl);
      if (!initialResponse.ok) throw new Error('Failed to fetch initial questions data');
      const initialData: PaginatedResponse<Question> = await initialResponse.json();
      
      const dynamicSize = initialData.totalElements > 0 ? initialData.totalElements : 1000;

      const url = selectedChapter 
        ? `/api/questions?chapter=${encodeURIComponent(selectedChapter)}&page=0&size=${dynamicSize}&sortBy=chapter&direction=asc`
        : `/api/questions?page=0&size=${dynamicSize}&sortBy=questionId&direction=asc`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data: PaginatedResponse<Question> = await response.json();
      setQuestions(data.content);
      setTotalQuestions(data.totalElements || 0);
      
      if (selectedQuestion) {
        const updated = data.content.find(q => q.questionId === selectedQuestion.questionId);
        if (updated) {
          setSelectedQuestion(updated);
        } else {
          setSelectedQuestion(data.content.length > 0 ? data.content[0] : null);
        }
      } else {
        setSelectedQuestion(data.content.length > 0 ? data.content[0] : null);
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

  // Analytics Calculations
  const reviewedCount = questions.filter(q => q.reviewStatus?.toUpperCase() === 'APPROVED' || q.reviewStatus?.toUpperCase() === 'REJECTED').length;
  const pendingCount = questions.filter(q => !q.reviewStatus || q.reviewStatus?.toUpperCase() === 'PENDING').length;
  const loadedCount = questions.length;
  const reviewProgress = loadedCount > 0 ? Math.round((reviewedCount / loadedCount) * 100) : 0;
  
  const totalChaptersQuestions = chapterCounts.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black overflow-hidden">
      {/* Sidebar - Left */}
      <div className="w-[400px] flex flex-col border-r border-zinc-100 dark:border-white/5 bg-white dark:bg-black z-10">
        <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex-shrink-0">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Cmptncy Review Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Pending items to review</p>
          
          {/* Chapter Filter Dashboard */}
          {chapterCounts.length > 0 && (
            <div className="mt-6">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">Filter by Chapter</h2>
              <div className="flex overflow-x-auto gap-2 pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                <button
                  onClick={() => setSelectedChapter(null)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
                    ${selectedChapter === null 
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg shadow-zinc-200 dark:shadow-none' 
                      : 'bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white border border-zinc-200 dark:border-white/10'}`}
                >
                  All Questions
                </button>
                {chapterCounts.map((chapterCount) => (
                  <button
                    key={chapterCount.chapter}
                    onClick={() => setSelectedChapter(chapterCount.chapter)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
                      ${selectedChapter === chapterCount.chapter 
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg shadow-zinc-200 dark:shadow-none' 
                        : 'bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white border border-zinc-200 dark:border-white/10'}`}
                  >
                    <span>{chapterCount.chapter}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] 
                      ${selectedChapter === chapterCount.chapter 
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black' 
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
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

      {/* Analytics Panel - Right Sidebar */}
      <div className="w-[320px] flex flex-col border-l border-zinc-100 dark:border-white/5 bg-white dark:bg-black overflow-y-auto hidden xl:flex">
        <div className="p-8 border-b border-zinc-100 dark:border-white/5">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Analytics</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Real-time review stats</p>
        </div>
        
        <div className="p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Current Scope</h3>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">
              {selectedChapter ? selectedChapter : "All Questions"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Total</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                {selectedChapter ? totalQuestions : totalChaptersQuestions}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Loaded</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">{loadedCount}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Review Progress (Loaded)</h3>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Reviewed
                </span>
                <span className="text-zinc-900 dark:text-white">{reviewedCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-amber-500 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Pending
                </span>
                <span className="text-zinc-900 dark:text-white">{pendingCount}</span>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                  style={{ width: `${reviewProgress}%` }}
                />
              </div>
              <div className="text-right text-xs font-bold text-zinc-400">
                {reviewProgress}% Complete
              </div>
            </div>
          </div>

          {!selectedChapter && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Chapter Breakdown</h3>
              <div className="flex flex-col gap-2">
                {chapterCounts.map(c => (
                  <div key={c.chapter} className="flex justify-between items-center text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">{c.chapter}</span>
                    <span className="font-semibold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-xs">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
