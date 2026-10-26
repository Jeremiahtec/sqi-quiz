/**
 * Dashboard.jsx — Host Dashboard
 * Enterprise SaaS quiz grid. Create, Edit, Host, Export, Import, and Duplicate quizzes.
 * Quizzes are persisted to localStorage under 'sqi-quizzes'.
 */
import { useState, useEffect, useRef } from 'react';
import {
  Plus, Play, Pencil, Trash2, HelpCircle, Upload, Download, Copy, Check
} from 'lucide-react';
import { loadQuizzes, saveQuiz, deleteQuizById } from '../../utils/quizStorage';

export default function Dashboard({ onCreateNew, onEdit, onHost }) {
  const [quizzes, setQuizzes] = useState([]);
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

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteQuizById(id);
      setQuizzes(loadQuizzes());
      setDeletingId(null);
      showNotification('Quiz deleted.');
    }, 250);
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
          alert('Invalid quiz format. File must contain a title and a questions array.');
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

  return (
    <div className="layout-light" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* ── Header ───────────────────────────────────────── */}
      <header style={{
        padding: '20px 40px',
        background: 'var(--sqi-white)',
        borderBottom: '1px solid var(--sqi-gray-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--sqi-navy)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem',
          }}>
            🎓
          </div>
          <div>
            <h1 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--sqi-navy)' }}>
              SQI Quiz
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--sqi-text-light)', margin: 0, fontWeight: 500 }}>
              Host Dashboard
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {notification && (
            <span style={{ fontSize: '0.85rem', color: 'var(--opt-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={16} /> {notification}
            </span>
          )}

          <button
            id="import-quiz-btn"
            type="button"
            className="btn-ghost"
            onClick={handleImportClick}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 16px', fontSize: '0.9rem' }}
          >
            <Upload size={16} />
            Import JSON
          </button>

          <button
            id="create-quiz-btn"
            className="btn-primary"
            onClick={onCreateNew}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', fontSize: '0.9rem' }}
          >
            <Plus size={17} />
            Create Quiz
          </button>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────── */}
      <main style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--sqi-navy)' }}>
            Your Quizzes
          </h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--sqi-text-light)', fontWeight: 500 }}>
            {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'} available
          </span>
        </div>

        {quizzes.length === 0 ? (
          <div className="sqi-card animate-slide-up" style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'var(--sqi-gray-bg)', border: '1px solid var(--sqi-gray-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: 'var(--sqi-text-light)'
            }}>
              <HelpCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--sqi-text-dark)' }}>
              No quizzes yet
            </h3>
            <p style={{ color: 'var(--sqi-text-light)', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.5 }}>
              Create your first quiz or import an existing JSON quiz to get started.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={onCreateNew}>
                Create Quiz
              </button>
              <button className="btn-ghost" onClick={handleImportClick}>
                Import JSON
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
            {quizzes.map((q, i) => (
              <div
                key={q.id}
                className="sqi-card animate-slide-up"
                style={{
                  padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--sqi-text-dark)' }}>
                    {q.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--sqi-text-light)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {q.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'var(--sqi-gray-bg)', color: 'var(--sqi-text-dark)', border: '1px solid var(--sqi-gray-border)' }}>
                    {q.questions?.length || 0} Questions
                  </span>
                  <span className="badge" style={{ background: 'var(--sqi-gray-bg)', color: 'var(--sqi-text-light)', border: '1px solid var(--sqi-gray-border)' }}>
                    Updated {new Date(q.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--sqi-gray-border)' }}>
                  <button
                    className="btn-primary"
                    onClick={() => onHost(q)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Play size={16} /> Host Game
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => onEdit(q)}
                    title="Edit Quiz"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => handleDuplicate(q)}
                    title="Duplicate Quiz"
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => handleExport(q)}
                    title="Export as JSON"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => handleDelete(q.id)}
                    title="Delete Quiz"
                    style={{ color: 'var(--sqi-danger)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
