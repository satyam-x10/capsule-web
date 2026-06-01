import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';
import { ConvoData, VocabularyWord } from '../types/capsule';

interface ConvoArenaProps {
  convo: ConvoData | null;
  isLoading: boolean;
}

export function ConvoArena({ convo, isLoading }: ConvoArenaProps) {
  // Sub-tab navigation
  const [activeSubTab, setActiveSubTab] = useState<'dialogue' | 'vocabulary'>('dialogue');

  // Dialogue Practice States
  const [selectedUtteranceIndex, setSelectedUtteranceIndex] = useState<number | null>(null);
  const [isPracticeModeActive, setIsPracticeModeActive] = useState<boolean>(false);
  const [typedText, setTypedText] = useState<string>('');
  const typingInputRef = useRef<HTMLInputElement>(null);

  // Vocabulary Challenge States
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [shuffledMeanings, setShuffledMeanings] = useState<(VocabularyWord & { originalIndex: number })[]>([]);
  const [vocabAnswers, setVocabAnswers] = useState<Record<number, string>>({}); // indexed by shuffled meanings index
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [incorrectMatchIdx, setIncorrectMatchIdx] = useState<number | null>(null);
  const [vocabResetCounter, setVocabResetCounter] = useState<number>(0);

  // Shuffle Vocabulary when convo changes or reset triggered
  useEffect(() => {
    if (convo && convo.vocabulary) {
      const vocab = convo.vocabulary;
      const words = [...vocab].map((v) => v.word).sort(() => Math.random() - 0.5);
      const meanings = [...vocab]
        .map((v, idx) => ({ ...v, originalIndex: idx }))
        .sort(() => Math.random() - 0.5);
      
      setShuffledWords(words);
      setShuffledMeanings(meanings);
      setVocabAnswers({});
      setSelectedWord(null);
      setIncorrectMatchIdx(null);
    }
  }, [convo, vocabResetCounter]);

  // Focus the input when entering practice mode or switching lines
  useEffect(() => {
    if (isPracticeModeActive && typingInputRef.current) {
      typingInputRef.current.focus();
    }
  }, [selectedUtteranceIndex, isPracticeModeActive]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <span style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>🔄</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
          FETCHING CONVERSATION DATA...
        </span>
      </div>
    );
  }

  if (!convo) {
    return (
      <div className="convo-header-card" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <span style={{ fontSize: '24px' }}>📭</span>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '12px' }}>
          No conversation available for this edition.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
          Try selecting a different date from the sidebar calendar.
        </p>
      </div>
    );
  }

  const { conversation, vocabulary, title, theme, takeaway } = convo;

  // Dialogue Practice Handlers
  const handleSelectUtterance = (idx: number) => {
    setSelectedUtteranceIndex(idx);
    setTypedText('');
    setIsPracticeModeActive(true);
  };

  const handleNextUtterance = () => {
    if (selectedUtteranceIndex !== null && selectedUtteranceIndex < conversation.length - 1) {
      setSelectedUtteranceIndex(selectedUtteranceIndex + 1);
      setTypedText('');
    }
  };

  const handlePrevUtterance = () => {
    if (selectedUtteranceIndex !== null && selectedUtteranceIndex > 0) {
      setSelectedUtteranceIndex(selectedUtteranceIndex - 1);
      setTypedText('');
    }
  };

  const activeUtterance = selectedUtteranceIndex !== null ? conversation[selectedUtteranceIndex] : null;

  // Vocabulary Challenge Handlers
  const handleWordBankPress = (word: string) => {
    const isAlreadyMatched = Object.values(vocabAnswers).includes(word);
    if (isAlreadyMatched) return;

    if (selectedWord === word) {
      setSelectedWord(null);
    } else {
      setSelectedWord(word);
    }
  };

  const handleSlotPress = (meaningIdx: number, correctWord: string) => {
    if (!selectedWord) return;

    if (selectedWord.trim().toLowerCase() === correctWord.trim().toLowerCase()) {
      setVocabAnswers((prev) => ({
        ...prev,
        [meaningIdx]: selectedWord,
      }));
      setSelectedWord(null);
    } else {
      setIncorrectMatchIdx(meaningIdx);
      setTimeout(() => {
        setIncorrectMatchIdx(null);
      }, 800);
    }
  };

  const resetVocabGame = () => {
    setVocabResetCounter((prev) => prev + 1);
  };

  const correctVocabCount = Object.keys(vocabAnswers).length;
  const isVocabFinished = vocabulary && correctVocabCount === vocabulary.length;

  return (
    <div className="content-wrapper" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Overview Header */}
      <div className="convo-header-card">
        <span className="convo-theme">{theme}</span>
        <h2 className="convo-title">{title}</h2>
      </div>

      {/* Tabs */}
      <div className="convo-sub-tabs">
        <button
          onClick={() => { setActiveSubTab('dialogue'); setIsPracticeModeActive(false); }}
          className={`sub-tab-btn ${activeSubTab === 'dialogue' ? 'active' : ''}`}
        >
          Dialogue Practice
        </button>
        <button
          onClick={() => setActiveSubTab('vocabulary')}
          className={`sub-tab-btn ${activeSubTab === 'vocabulary' ? 'active' : ''}`}
        >
          Vocabulary Game
        </button>
      </div>

      {/* dialogue section */}
      {activeSubTab === 'dialogue' && (
        <div className="dialogue-wrapper">
          {isPracticeModeActive && activeUtterance ? (
            // Practice Arena
            <div className="arena-container">
              <div className="arena-header">
                <div className="arena-progress">
                  <span className="arena-progress-text">
                    LINE {selectedUtteranceIndex! + 1} OF {conversation.length}
                  </span>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${((selectedUtteranceIndex! + 1) / conversation.length) * 100}%` }}
                    />
                  </div>
                </div>
                <button onClick={() => setIsPracticeModeActive(false)} className="arena-exit-btn">
                  Exit Practice ✕
                </button>
              </div>

              <div className="arena-card">
                <span className="arena-speaker">{activeUtterance.speaker}</span>

                {/* Character Display */}
                <div className="char-display-box" onClick={() => typingInputRef.current?.focus()}>
                  <div className="char-flow">
                    {activeUtterance.text.split('').map((char, index) => {
                      let statusClass = '';
                      if (index < typedText.length) {
                        if (typedText[index].toLowerCase() === char.toLowerCase()) {
                          statusClass = 'correct';
                        } else {
                          statusClass = 'incorrect';
                        }
                      } else if (index === typedText.length) {
                        statusClass = 'cursor';
                      }

                      return (
                        <span key={index} className={`char-item ${statusClass}`}>
                          {char}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Hidden / Focused input */}
                <input
                  ref={typingInputRef}
                  type="text"
                  className="arena-input"
                  value={typedText}
                  onChange={(e) => {
                    const text = e.target.value;
                    if (text.length <= activeUtterance.text.length) {
                      setTypedText(text);

                      // Check for full line match
                      if (text.toLowerCase() === activeUtterance.text.toLowerCase()) {
                        setTimeout(() => {
                          if (selectedUtteranceIndex !== null && selectedUtteranceIndex < conversation.length - 1) {
                            handleNextUtterance();
                          } else {
                            // Finished the conversation practice
                            setIsPracticeModeActive(false);
                          }
                        }, 400);
                      }
                    }
                  }}
                  placeholder="Type the dialogue exactly as shown above..."
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                />

                {/* Navigation inside typing session */}
                <div className="arena-nav-row">
                  {selectedUtteranceIndex! > 0 && (
                    <button onClick={handlePrevUtterance} className="arena-nav-btn">
                      <ArrowLeft size={16} /> Prev Line
                    </button>
                  )}
                  {selectedUtteranceIndex! < conversation.length - 1 ? (
                    <button onClick={handleNextUtterance} className="arena-nav-btn" style={{ marginLeft: 'auto' }}>
                      Skip Line <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsPracticeModeActive(false)}
                      className="arena-nav-btn primary"
                      style={{ marginLeft: 'auto' }}
                    >
                      Finish Practice
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Dialogue list view
            <>
              <div className="dialogue-instructions">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="section-label">DIALOGUE PRACTICE</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Read through the script below. Click any bubble to practice typing it.
                  </span>
                </div>
                <button onClick={() => handleSelectUtterance(0)} className="dialogue-start-btn">
                  ⚡ Start Session
                </button>
              </div>

              <div className="dialogue-list">
                {conversation.map((utterance, idx) => {
                  const isLeft = idx % 2 === 0;
                  return (
                    <div key={idx} className={`dialogue-bubble-row ${isLeft ? 'left' : 'right'}`}>
                      <div
                        onClick={() => handleSelectUtterance(idx)}
                        className={`dialogue-bubble ${isLeft ? 'left' : 'right'}`}
                        title="Click to type this line"
                      >
                        <span className="bubble-speaker">{utterance.speaker}</span>
                        <p className="bubble-text">{utterance.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* vocabulary section */}
      {activeSubTab === 'vocabulary' && (
        <div>
          <div className="vocab-instructions">
            <span className="section-label">VOCABULARY CHALLENGE</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Match each word in the Word Bank to its definition. Click a word, then click its matching definition card slot.
            </span>
          </div>

          {/* Word Bank */}
          <div className="vocab-word-bank">
            <span className="word-bank-header">WORD BANK</span>
            <div className="word-bank-grid">
              {shuffledWords.map((word, idx) => {
                const isMatched = Object.values(vocabAnswers).includes(word);
                const isSelected = selectedWord === word;
                const classes = [
                  'word-bank-pill',
                  isSelected ? 'selected' : '',
                  isMatched ? 'matched' : ''
                ].filter(Boolean).join(' ');

                return (
                  <button
                    key={idx}
                    onClick={() => handleWordBankPress(word)}
                    disabled={isMatched}
                    className={classes}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Definitions Grid */}
          <div className="vocab-matching-board">
            {shuffledMeanings.map((item, idx) => {
              const matchedWord = vocabAnswers[idx];
              const isCorrect = !!matchedWord;
              const isFlashError = incorrectMatchIdx === idx;
              
              let slotClass = '';
              if (isCorrect) slotClass = 'correct';
              else if (isFlashError) slotClass = 'incorrect';
              else if (matchedWord) slotClass = 'has-word';

              return (
                <div key={idx} className="vocab-match-card">
                  <p className="vocab-definition">{item.meaning}</p>
                  <button
                    onClick={() => handleSlotPress(idx, item.word)}
                    disabled={isCorrect}
                    className={`vocab-slot-btn ${slotClass}`}
                  >
                    {isCorrect ? (
                      <span>✓ {matchedWord}</span>
                    ) : isFlashError ? (
                      <span>✗ Incorrect</span>
                    ) : selectedWord ? (
                      <span>Place "{selectedWord}"</span>
                    ) : (
                      <span>Tap to match</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Score Counter / Win Card */}
          {isVocabFinished ? (
            <div className="vocab-success-card">
              <span className="vocab-success-icon">🏆</span>
              <h3 className="vocab-success-title">Challenge Complete!</h3>
              <p className="vocab-success-desc">
                Amazing work! You successfully matched all {vocabulary.length} vocabulary terms to their definitions.
              </p>
              <button onClick={resetVocabGame} className="vocab-reset-btn">
                Play Again ↻
              </button>
            </div>
          ) : (
            <div className="vocab-score-row">
              <span className="vocab-score-text">
                SCORE: {correctVocabCount} / {vocabulary.length} MATCHED
              </span>
              <button onClick={resetVocabGame} className="arena-exit-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          )}
        </div>
      )}

      {/* Takeaway footer */}
      <div className="takeaway-footer-card" style={{ marginTop: '24px' }}>
        <div className="takeaway-footer-glow" />
        <div className="takeaway-footer-content">
          <span className="section-label" style={{ marginBottom: 0 }}>TODAY'S CONVO TAKEAWAY</span>
          <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            "{takeaway}"
          </p>
        </div>
      </div>
    </div>
  );
}
