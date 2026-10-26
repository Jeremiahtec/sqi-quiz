/**
 * Dashboard.jsx — Host Command Center
 * Ultra-modern, dark-themed quiz management console for SQI Quiz Arena.
 * Create, Edit, Launch, Export, Import, Duplicate, and Search quizzes.
 */
import { useState, useEffect, useRef } from 'react';
import {
  Plus, Play, Pencil, Trash2, HelpCircle, Upload, Download, Copy,
  Check, Search, Sparkles, Layers, BookOpen, Clock, ArrowRight
} from 'lucide-react';
import { loadQuizzes, saveQuiz, deleteQuizById } from '../../utils/quizStorage';

export default function Dashboard({ onCreateNew, onEdit, onHost }) {
  const [quizzes, setQuizzes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setQuizzes(loadQuizzes());
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDelete = (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    setDeletingId(id);
    setTimeout(() => {
      deleteQuizById(id);
      setQuizzes(loadQuizzes());
      setDeletingId(null);
      showNotification('Quiz deleted successfully.');
    }, 200);
  };

  const handleDuplicate = (quiz) => {
    const copy = {
      ...quiz,
      id: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `${quiz.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    saveQuiz(copy);
    setQuizzes(loadQuizzes());
    showNotification(`Duplicated "${quiz.title}".`);
  };

  const handleExport = (quiz) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(quiz, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    const safeTitle = (quiz.title || 'quiz').toLowerCase().replace(/[^a-z0-9]/g, '-');
    dlAnchor.setAttribute('download', `${safeTitle}.json`);
    dlAnchor.click();
    showNotification(`Exported "${quiz.title}".`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (!imported.title || !Array.isArray(imported.questions)) {
          alert('Invalid quiz format. File must contain a title and questions array.');
          return;
        }
        imported.id = `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        imported.createdAt = new Date().toISOString();
        saveQuiz(imported);
        setQuizzes(loadQuizzes());
        showNotification(`Successfully imported "${imported.title}"!`);
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter quizzes by search query
  const filteredQuizzes = quizzes.filter((q) => {
    const matchTitle = (q.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchDesc = (q.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchTitle || matchDesc;
  });

  const totalQuestions = quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);

  return (
    <div className="layout-navy" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* ── Top Navigation Bar ─────────────────────────────── */}
      <header
        style={{
          padding: '16px 36px',
          background: 'rgba(10, 17, 40, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/sqi-logo.png"
            alt="SQI College of ICT"
            style={{
              width: '42px',
              height: '42px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.4))',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.01em' }}>
                SQI Quiz
              </h1>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(37, 99, 235, 0.25)',
                  color: '#60a5fa',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  letterSpacing: '0.06em',
                }}
              >
                Arena
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', margin: 0, fontWeight: 500 }}>
              Host Command Center
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {notification && (
            <span
              className="animate-fade-in"
              style={{
                fontSize: '0.85rem',
                color: '#34d399',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                background: 'rgba(16, 185, 129, 0.12)',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <Check size={15} /> {notification}
            </span>
          )}

          <button
            id="import-quiz-btn"
            type="button"
            className="btn-ghost"
            onClick={handleImportClick}
            style={{ fontSize: '0.88rem', padding: '9px 16px' }}
          >
            <Upload size={15} />
            <span>Import JSON</span>
          </button>

          <button
            id="create-quiz-btn"
            className="btn-primary"
            onClick={onCreateNew}
            style={{ fontSize: '0.88rem', padding: '9px 18px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
          >
            <Plus size={16} />
            <span>Create Quiz</span>
          </button>
        </div>
      </header>

      {/* ── Main Container ─────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          padding: '36px 36px 60px',
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* ── Hero Banner & Quick Stats ─────────────────────── */}
        <section
          className="sqi-card-dark animate-slide-up"
          style={{
            padding: '30px 36px',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(20, 32, 70, 0.75) 0%, rgba(13, 22, 50, 0.85) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background glow circle */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '240px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Sparkles size={14} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Interactive Quiz Engine
                </span>
              </div>
              <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
                Quiz Command Center
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0, maxWidth: '580px', lineHeight: 1.5 }}>
                Launch live interactive competitions for the classroom or projector. Students join seamlessly on mobile devices via QR code or Game PIN.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div
                style={{
                  padding: '14px 20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  minWidth: '120px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  <Layers size={13} style={{ color: '#60a5fa' }} />
                  <span>Quizzes</span>
                </div>
                <span className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  {quizzes.length}
                </span>
              </div>

              <div
                style={{
                  padding: '14px 20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  minWidth: '120px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  <BookOpen size={13} style={{ color: '#a78bfa' }} />
                  <span>Questions</span>
                </div>
                <span className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  {totalQuestions}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Search and Filter Bar ─────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Your Quiz Collection
            </h3>
            <span
              style={{
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.5)',
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '3px 10px',
                borderRadius: '999px',
                fontWeight: 600,
              }}
            >
              {filteredQuizzes.length} available
            </span>
          </div>

          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quizzes..."
              className="input-dark"
              style={{
                paddingLeft: '38px',
                paddingTop: '9px',
                paddingBottom: '9px',
                fontSize: '0.88rem',
                borderRadius: '10px',
              }}
            />
          </div>
        </div>

        {/* ── Quiz Cards Grid ──────────────────────────────── */}
        {filteredQuizzes.length === 0 ? (
          <div
            className="sqi-card-dark animate-scale-in"
            style={{
              padding: '64px 32px',
              textAlign: 'center',
              borderRadius: '20px',
              background: 'rgba(16, 27, 59, 0.5)',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <HelpCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>
              {searchQuery ? 'No matching quizzes found' : 'No quizzes in your library'}
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.5 }}>
              {searchQuery
                ? `No results match "${searchQuery}". Clear your search or create a new quiz.`
                : 'Create your first interactive quiz or import a JSON quiz template to get started.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {searchQuery ? (
                <button className="btn-ghost" onClick={() => setSearchQuery('')}>
                  Clear Search
                </button>
              ) : (
                <>
                  <button className="btn-primary" onClick={onCreateNew}>
                    <Plus size={16} /> Create Quiz
                  </button>
                  <button className="btn-ghost" onClick={handleImportClick}>
                    <Upload size={15} /> Import JSON
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '22px',
            }}
          >
            {filteredQuizzes.map((q, i) => {
              const qCount = q.questions?.length || 0;
              const estTime = Math.max(1, Math.round(qCount * 0.75));

              return (
                <div
                  key={q.id}
                  className="sqi-card-dark animate-slide-up"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '18px',
                    borderRadius: '18px',
                    animationDelay: `${i * 0.05}s`,
                    opacity: deletingId === q.id ? 0.3 : 1,
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top card accent line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #2563EB, #7C3AED)',
                    }}
                  />

                  {/* Header & Description */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background: 'rgba(37, 99, 235, 0.18)',
                          color: '#60a5fa',
                          border: '1px solid rgba(37, 99, 235, 0.3)',
                        }}
                      >
                        SQI Arena
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                        <Clock size={13} />
                        <span>~{estTime} min</span>
                      </div>
                    </div>

                    <h4
                      className="font-display"
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        margin: '0 0 8px',
                        color: '#ffffff',
                        lineHeight: 1.3,
                      }}
                    >
                      {q.title}
                    </h4>

                    <p
                      style={{
                        fontSize: '0.86rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                        minHeight: '2.6em',
                      }}
                    >
                      {q.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        fontWeight: 600,
                      }}
                    >
                      {qCount} {qCount === 1 ? 'Question' : 'Questions'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontWeight: 500,
                      }}
                    >
                      Updated {new Date(q.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <button
                      className="btn-primary"
                      onClick={() => onHost(q)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        gap: '7px',
                        borderRadius: '10px',
                      }}
                    >
                      <Play size={16} fill="currentColor" />
                      <span>Host Game</span>
                    </button>

                    <button
                      className="btn-ghost"
                      onClick={() => onEdit(q)}
                      title="Edit Quiz"
                      style={{ padding: '10px', borderRadius: '10px' }}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      className="btn-ghost"
                      onClick={() => handleDuplicate(q)}
                      title="Duplicate Quiz"
                      style={{ padding: '10px', borderRadius: '10px' }}
                    >
                      <Copy size={15} />
                    </button>

                    <button
                      className="btn-ghost"
                      onClick={() => handleExport(q)}
                      title="Export as JSON"
                      style={{ padding: '10px', borderRadius: '10px' }}
                    >
                      <Download size={15} />
                    </button>

                    <button
                      className="btn-ghost"
                      onClick={() => handleDelete(q.id, q.title)}
                      title="Delete Quiz"
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        color: 'rgba(244, 63, 94, 0.8)',
                        borderColor: 'rgba(244, 63, 94, 0.2)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(244, 63, 94, 0.15)';
                        e.currentTarget.style.color = '#f43f5e';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = 'rgba(244, 63, 94, 0.8)';
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Quick "Add Quiz" dashed card */}
            <div
              onClick={onCreateNew}
              className="animate-slide-up"
              style={{
                borderRadius: '18px',
                border: '2px dashed rgba(255, 255, 255, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px 24px',
                minHeight: '220px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: 'rgba(255, 255, 255, 0.015)',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.5)';
                e.currentTarget.style.background = 'rgba(37, 99, 235, 0.05)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.015)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(37, 99, 235, 0.15)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <Plus size={22} />
              </div>
              <span className="font-display" style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>
                Create New Quiz
              </span>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.45)', margin: 0 }}>
                Multiple choice, True/False, or Open-ended
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
