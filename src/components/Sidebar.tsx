import React from 'react';
import { Home, BookOpen, MessageSquare, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateString } from '../services/capsuleApi';

interface SidebarProps {
  activeTab: 'home' | 'capsules' | 'convo';
  setActiveTab: (tab: 'home' | 'capsules' | 'convo') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onOpenCalendar: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  selectedDate,
  setSelectedDate,
  onOpenCalendar
}: SidebarProps) {
  // Helper to adjust current selected date by +/- offset days
  const adjustDate = (offset: number) => {
    if (!selectedDate || !selectedDate.includes('-')) return;
    const [yearStr, monthStr, dayStr] = selectedDate.split('-');
    const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
    date.setDate(date.getDate() + offset);
    
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside className="sidebar">
        <div>
          {/* Logo & Branding */}
          <div className="brand-section">
            <div className="brand-logo-container">
              <span className="brand-logo">💊</span>
              <h1 className="brand-title">Capsule</h1>
            </div>
            <span className="brand-subtitle">Hi, Satyam</span>
          </div>

          {/* Navigation Links */}
          <nav className="nav-links">
            <button
              onClick={() => setActiveTab('home')}
              className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
            >
              <Home size={18} className="nav-icon" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setActiveTab('capsules')}
              className={`nav-link ${activeTab === 'capsules' ? 'active' : ''}`}
            >
              <BookOpen size={18} className="nav-icon" />
              <span>Daily Capsules</span>
            </button>
            <button
              onClick={() => setActiveTab('convo')}
              className={`nav-link ${activeTab === 'convo' ? 'active' : ''}`}
            >
              <MessageSquare size={18} className="nav-icon" />
              <span>Conversation</span>
            </button>
          </nav>
        </div>

        {/* Date Selector Box in Sidebar */}
        <div className="sidebar-date-box">
          <div className="sidebar-date-header">
            <span className="sidebar-date-title">DAILY EDITION</span>
            <button onClick={onOpenCalendar} className="calendar-trigger" title="Open Calendar">
              <Calendar size={15} />
            </button>
          </div>
          <div className="sidebar-date-body">
            <button onClick={() => adjustDate(-1)} className="date-nav-btn" title="Previous Day">
              <ChevronLeft size={14} />
            </button>
            <span className="sidebar-date-value">{formatDateString(selectedDate)}</span>
            <button onClick={() => adjustDate(1)} className="date-nav-btn" title="Next Day">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* User Profile Info Footer */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">S</div>
            <span className="user-name">Satyam</span>
          </div>
        </div>
      </aside>

      {/* Floating Bottom Nav Bar for Mobile Viewports */}
      <div className="mobile-nav-bar">
        <button
          onClick={() => setActiveTab('home')}
          className={`mobile-nav-btn ${activeTab === 'home' ? 'active' : ''}`}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('capsules')}
          className={`mobile-nav-btn ${activeTab === 'capsules' ? 'active' : ''}`}
        >
          <BookOpen size={20} />
          <span>Capsules</span>
        </button>
        <button
          onClick={() => setActiveTab('convo')}
          className={`mobile-nav-btn ${activeTab === 'convo' ? 'active' : ''}`}
        >
          <MessageSquare size={20} />
          <span>Convo</span>
        </button>
        <button
          onClick={onOpenCalendar}
          className="mobile-nav-btn"
        >
          <Calendar size={20} />
          <span>Dates</span>
        </button>
      </div>
    </>
  );
}
