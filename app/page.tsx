'use client';

import React, { useState, useEffect } from 'react';
import ReviewDashboard from "./components/ReviewDashboard";
import LoginPage from "./components/LoginPage";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('cmptncy_auth_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('cmptncy_auth_token');
    localStorage.removeItem('cmptncy_user');
    setIsAuthenticated(false);
  };

  // Show loading spinner while checking initial auth status
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // BEFORE LOGIN: Show ONLY Login Page (No database or dashboard rendered)
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // AFTER LOGIN: Load Dashboard
  return (
    <main className="min-h-screen">
      <ReviewDashboard onLogout={handleLogout} />
    </main>
  );
}
