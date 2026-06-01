import React from 'react';
import { X, Clock, Calendar } from 'lucide-react';
import { Capsule } from '../types/capsule';
import { formatDateString } from '../services/capsuleApi';

interface CapsuleReaderProps {
  capsule: Capsule | null;
  isLoading: boolean;
  onClose: () => void;
}

export function CapsuleReader({ capsule, isLoading, onClose }: CapsuleReaderProps) {
  if (!capsule && !isLoading) return null;

  return (
    <div className="reader-drawer-overlay" onClick={onClose}>
      <div className="reader-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="reader-header">
          <span className="reader-meta-top">CAPSULE READER</span>
          <button onClick={onClose} className="reader-close-btn" title="Close Reader">
            Close ✕
          </button>
        </header>

        {/* Content Area */}
        <div className="reader-content-scroll">
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
              <span style={{ fontSize: '28px', animation: 'spin 1s linear infinite' }}>🔄</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                LOADING CAPSULE...
              </span>
            </div>
          ) : capsule ? (
            <>
              {/* Title & Category & Metadata */}
              <div className="reader-title-section">
                <span className="reader-category">{capsule.category}</span>
                <h2 className="reader-title">{capsule.title}</h2>
                <div className="reader-meta-row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} /> {capsule.readTime}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} /> Published: {formatDateString(capsule.date)}
                  </span>
                </div>
              </div>

              <div className="reader-divider" />

              {/* Body paragraphs */}
              <article className="reader-body">
                {capsule.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </article>

              {/* Takeaway Section */}
              <div className="reader-takeaway">
                <span className="takeaway-label">KEY TAKEAWAY</span>
                <p className="takeaway-text">"{capsule.takeaway}"</p>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No capsule available for this category today.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
