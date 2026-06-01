'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Calendar } from '../components/Calendar';
import { CapsuleReader } from '../components/CapsuleReader';
import { ConvoArena } from '../components/ConvoArena';
import {
  getSections,
  getDayCapsules,
  getConvo,
  getTodayDateStr
} from '../services/capsuleApi';
import { SectionInfo, Capsule, ConvoData } from '../types/capsule';
import { BookOpen, Award, Flame } from 'lucide-react';

// Seed generator for date-based random values (like random pictures)
const getDateSeed = (dateStr: string): number => {
  if (!dateStr) return 0;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 10000;
};

// Maps section IDs to modern emojis
const getSectionEmoji = (id: number): string => {
  switch (id) {
    case 1: return '🤖';
    case 2: return '💻';
    case 3: return '📈';
    case 4: return '🗣️';
    case 5: return '💰';
    case 6: return '🧠';
    default: return '📦';
  }
};

export default function HomeDashboard() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'capsules' | 'convo'>('home');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);

  // Data states
  const [sections, setSections] = useState<SectionInfo[]>([]);
  const [dailyCapsules, setDailyCapsules] = useState<Capsule[]>([]);
  const [convoData, setConvoData] = useState<ConvoData | null>(null);

  // Selected reading capsule
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Loading & Error states
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [capsulesError, setCapsulesError] = useState<string | null>(null);
  const [convoError, setConvoError] = useState<string | null>(null);

  // Set today's date after hydration to avoid SSR date-mismatch warnings
  useEffect(() => {
    setSelectedDate(getTodayDateStr());
    setHasHydrated(true);
  }, []);

  // Fetch sections list once
  useEffect(() => {
    if (!hasHydrated) return;
    async function fetchSectionsList() {
      try {
        const data = await getSections();
        setSections(data);
      } catch (err) {
        console.error('[Dashboard] Error fetching sections:', err);
      }
    }
    fetchSectionsList();
  }, [hasHydrated]);

  // Fetch daily capsules and convo when selectedDate changes
  useEffect(() => {
    if (!hasHydrated || !selectedDate) return;

    async function fetchDailyData() {
      setIsDataLoading(true);
      setCapsulesError(null);
      setConvoError(null);

      // Fetch Capsules
      try {
        const caps = await getDayCapsules(selectedDate);
        setDailyCapsules(caps);
      } catch (err) {
        console.error('[Dashboard] Error fetching daily capsules:', err);
        setDailyCapsules([]);
        setCapsulesError('Failed to retrieve daily capsules.');
      }

      // Fetch Conversation
      try {
        const convo = await getConvo(selectedDate);
        setConvoData(convo);
      } catch (err) {
        console.error('[Dashboard] Error fetching daily conversation:', err);
        setConvoData(null);
        setConvoError('Failed to retrieve daily conversation.');
      } finally {
        setIsDataLoading(false);
      }
    }

    fetchDailyData();
  }, [hasHydrated, selectedDate]);

  // Handle clicking a section card
  const handleSectionClick = (sectionId: number) => {
    const capsule = dailyCapsules.find((c) => c.sectionId === sectionId) || null;
    setSelectedCapsule(capsule);
    setIsReaderOpen(true);
  };

  // Prevent rendering before hydration has occurred
  if (!hasHydrated) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '32px', color: '#ffffff', animation: 'spin 1.5s linear infinite' }}>🔄</span>
      </div>
    );
  }

  // derive picture seed
  const pictureSeed = getDateSeed(selectedDate);

  return (
    <div className="app-container">
      {/* Sidebar / Navigation controls */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onOpenCalendar={() => setShowCalendar(true)}
      />

      {/* Main content display area */}
      <main className="main-viewport">
        {activeTab === 'home' && (
          <div className="content-wrapper">
            <div className="welcome-hero">
              <span className="brand-subtitle">DASHBOARD</span>
              <h2 className="welcome-title">Welcome back, Satyam</h2>
              <p className="welcome-subtitle">Here is your daily dose of learning for today.</p>
            </div>

            <div className="home-grid">
              {/* Daily View Image Card */}
              <div className="daily-image-card">
                <span className="image-tag">🖼️ DAILY VIEW</span>
                <img
                  src={`https://picsum.photos/800/450?random=${pictureSeed}`}
                  alt="Daily Inspiration"
                  className="daily-img"
                />
              </div>

              {/* Learning stats / navigation buttons */}
              <div className="dashboard-stats">
                <div className="stat-card" onClick={() => setActiveTab('capsules')}>
                  <div className="stat-icon" style={{ color: 'var(--color-accent)' }}>
                    <BookOpen size={22} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Daily Capsules</span>
                    <span className="stat-value">6 Topics available</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab('convo')}>
                  <div className="stat-icon" style={{ color: '#E5A93C' }}>
                    <Award size={22} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Dialogue Practice</span>
                    <span className="stat-value">Interactive typing active</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab('convo')}>
                  <div className="stat-icon" style={{ color: '#4CAF50' }}>
                    <Flame size={22} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Vocabulary Match</span>
                    <span className="stat-value">Challenge is ready</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Short review of sections summary list */}
            <div style={{ marginTop: '16px' }}>
              <div className="section-intro" style={{ marginBottom: '16px' }}>
                <span className="section-label">TOPICS TODAY</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Click on any category below or browse the Capsules tab to read.</p>
              </div>
              <div className="capsules-grid">
                {sections.slice(0, 3).map((section) => (
                  <div
                    key={section.id}
                    className="capsule-card"
                    style={{ height: '140px' }}
                    onClick={() => {
                      setActiveTab('capsules');
                      setTimeout(() => handleSectionClick(section.id), 50);
                    }}
                  >
                    <span className="capsule-emoji-bg">{getSectionEmoji(section.id)}</span>
                    <span className="capsule-category">{section.name.split(' ')[0]}</span>
                    <h3 className="capsule-title" style={{ fontSize: '14px', marginTop: '4px' }}>{section.name}</h3>
                    <div className="capsule-footer" style={{ marginTop: '8px' }}>
                      <span className="capsule-action-tag" style={{ fontSize: '10px' }}>READ NOW →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'capsules' && (
          <div className="content-wrapper">
            <div className="section-intro">
              <span className="section-label">DAILY CAPSULES</span>
              <h2 className="section-title">Today's Reading Topics</h2>
            </div>

            {isDataLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
                <span style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>🔄</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  FETCHING DAILY CAPSULES...
                </span>
              </div>
            ) : capsulesError ? (
              <div className="convo-header-card" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>{capsulesError}</p>
                <button
                  onClick={() => setSelectedDate(selectedDate)}
                  className="calendar-close-btn"
                  style={{ maxWidth: '120px', marginTop: '16px' }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="capsules-grid">
                {sections.map((section) => {
                  const hasCapsule = dailyCapsules.some((c) => c.sectionId === section.id);
                  return (
                    <div
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className="capsule-card"
                      style={{ opacity: hasCapsule ? 1 : 0.6 }}
                    >
                      <span className="capsule-emoji-bg">{getSectionEmoji(section.id)}</span>
                      <span className="capsule-category">{section.name}</span>
                      <h3 className="capsule-title">
                        {dailyCapsules.find((c) => c.sectionId === section.id)?.title || section.description}
                      </h3>
                      <div className="capsule-footer">
                        <span className="capsule-readtime">
                          {dailyCapsules.find((c) => c.sectionId === section.id)?.readTime || 'Not loaded'}
                        </span>
                        <span className="capsule-action-tag">
                          {hasCapsule ? 'Read Topic →' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'convo' && (
          <ConvoArena convo={convoData} isLoading={isDataLoading} />
        )}
      </main>

      {/* Calendar Overlay */}
      {showCalendar && (
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {/* Capsule Reader Slide Drawer */}
      {isReaderOpen && (
        <CapsuleReader
          capsule={selectedCapsule}
          isLoading={isDataLoading}
          onClose={() => {
            setSelectedCapsule(null);
            setIsReaderOpen(false);
          }}
        />
      )}
    </div>
  );
}
