'use client';

import React, { useState, useEffect } from 'react';
import QuestionList from './QuestionList';
import QuestionReviewForm from './QuestionReviewForm';
import { Question, ReviewRequest, PaginatedResponse, ApiResponse } from '../types';

export default function ReviewDashboard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/questions?page=0&size=50&sortBy=questionId&direction=asc');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data: PaginatedResponse<Question> = await response.json();
      setQuestions(data.content);
      if (data.content.length > 0 && !selectedQuestion) {
        setSelectedQuestion(data.content[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleReviewSubmit = async (review: ReviewRequest) => {
    try {
      const response = await fetch('http://localhost:8080/api/reviews', {
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
        <div className="p-8 border-b border-zinc-100 dark:border-white/5">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Review Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Pending items to review</p>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Connection Error</h2>
            <p className="text-zinc-500 max-w-sm">{error}. Please make sure the backend API is running at http://localhost:8080.</p>
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
