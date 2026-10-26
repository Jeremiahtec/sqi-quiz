/**
 * QuizCreator.jsx — Host Quiz Builder
 * Dynamic form to create/edit quizzes.
 * Supports: Multiple Choice (4 opts), True/False, Open-Ended.
 * Saves to localStorage via Dashboard's saveQuiz helper.
 */
import { useState, useCallback } from 'react';
import {
  ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp,
  CheckCircle, Clock, HelpCircle, AlignLeft, ToggleLeft,
  GripVertical, AlertCircle, Code, Image as ImageIcon,
} from 'lucide-react';
import { saveQuiz } from '../../utils/quizStorage';

// ── Helpers ───────────────────────────────────────────────────
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const DEFAULT_OPTIONS = ['', '', '', ''];

function makeQuestion(type = 'multiple-choice') {
  return {
    id: uid(),
    type,
    question: '',
    options:
      type === 'multiple-choice' ? [...DEFAULT_OPTIONS]
      : type === 'true-false'   ? ['True', 'False']
      : [],
    correctAnswer: type === 'open-ended' ? '' : 0,
    timeLimit: 20,
    code: '',
    imageUrl: '',
    explanation: '',
  };
}

// ── Type config ───────────────────────────────────────────────
const TYPES = [
  { value: 'multiple-choice', label: 'Multiple Choice', icon: <HelpCircle size={14} />,  color: 'var(--sqi-accent)', desc: '4 options, one correct' },
  { value: 'true-false',      label: 'True / False',    icon: <ToggleLeft size={14} />,   color: 'var(--sqi-text-dark)', desc: '2 options: True or False' },
  { value: 'open-ended',      label: 'Open Ended',      icon: <AlignLeft size={14} />,    color: 'var(--opt-yellow)', desc: 'Exact text match' },
];

const OPTION_COLORS = ['var(--opt-red)', 'var(--opt-blue)', 'var(--opt-yellow)', 'var(--opt-green)'];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// ── Sub-components ────────────────────────────────────────────

function TypeSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {TYPES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: `1.5px solid ${value === t.value ? t.color : 'var(--sqi-gray-border)'}`,
            background: value === t.value ? `${t.color}11` : 'var(--sqi-white)',
            color: value === t.value ? t.color : 'var(--sqi-text-light)',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

function TimeSlider({ value, onChange }) {
  const marks = [5, 10, 15, 20, 30, 45, 60];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sqi-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Clock size={14} /> Time Limit
        </label>
        <span style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'var(--sqi-navy)',
        }}>
          {value}s
        </span>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {marks.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '6px',
              border: `1.5px solid ${value === m ? 'var(--sqi-accent)' : 'var(--sqi-gray-border)'}`,
              background: value === m ? 'var(--sqi-accent)' : 'var(--sqi-white)',
              color: value === m ? 'white' : 'var(--sqi-text-light)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {m}s
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ question, index, total, onChange, onDelete, onMove }) {
  const [collapsed, setCollapsed] = useState(false);

  const update = (field, val) => onChange({ ...question, [field]: val });

  const updateOption = (i, val) => {
    const opts = [...question.options];
    opts[i] = val;
    onChange({ ...question, options: opts });
  };

  const handleTypeChange = (newType) => {
    const base = makeQuestion(newType);
    onChange({
      ...base,
      id: question.id,
      question: question.question,
      timeLimit: question.timeLimit,
      code: question.code || '',
      imageUrl: question.imageUrl || '',
      explanation: question.explanation || '',
    });
  };

  const typeConf = TYPES.find((t) => t.value === question.type) || TYPES[0];

  return (
    <div
      id={`question-card-${index}`}
      className="sqi-card animate-slide-up"
      style={{
        overflow: 'hidden',
        animationDelay: `${index * 0.04}s`,
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px 20px',
          background: 'var(--sqi-white)',
          borderBottom: collapsed ? 'none' : '1px solid var(--sqi-gray-border)',
          cursor: 'pointer',
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <GripVertical size={18} style={{ color: 'var(--sqi-text-light)', flexShrink: 0 }} />

        <span style={{
          minWidth: '32px', height: '32px', borderRadius: '8px',
          background: 'var(--sqi-gray-bg)',
          border: '1px solid var(--sqi-gray-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.9rem',
          color: 'var(--sqi-text-dark)', flexShrink: 0,
        }}>
          {index + 1}
        </span>

        <span style={{
          flex: 1, fontSize: '1rem', fontWeight: 500,
          color: question.question ? 'var(--sqi-text-dark)' : 'var(--sqi-text-light)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {question.question || 'New question…'}
        </span>

        <span
          className="badge"
          style={{ background: `${typeConf.color}22`, color: typeConf.color, border: `1px solid ${typeConf.color}44`, flexShrink: 0 }}
        >
          {typeConf.icon} {question.timeLimit}s
        </span>

        {/* Move buttons */}
        <div style={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: 'var(--sqi-text-light)', padding: '4px', borderRadius: '6px' }}
          >
            <ChevronUp size={18} />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            style={{ background: 'none', border: 'none', cursor: index === total - 1 ? 'not-allowed' : 'pointer', color: 'var(--sqi-text-light)', padding: '4px', borderRadius: '6px' }}
          >
            <ChevronDown size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--opt-red)', padding: '4px', borderRadius: '6px', flexShrink: 0 }}
          title="Delete question"
        >
          <Trash2 size={16} />
        </button>

        <ChevronDown
          size={18}
          style={{ color: 'var(--sqi-text-light)', flexShrink: 0, transition: 'transform 0.2s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
        />
      </div>

      {/* Card body */}
      {!collapsed && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--sqi-white)' }}>
          {/* Type selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--sqi-text-light)', marginBottom: '8px' }}>
              Question Type
            </label>
            <TypeSelector value={question.type} onChange={handleTypeChange} />
          </div>

          {/* Question text */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--sqi-text-light)', marginBottom: '8px' }}>
              Question Text
            </label>
            <textarea
              className="input-base"
              rows={2}
              placeholder="Enter your question here…"
              value={question.question}
              onChange={(e) => update('question', e.target.value)}
              style={{ resize: 'vertical', fontSize: '1.05rem', fontWeight: 500 }}
            />
          </div>

          {/* Optional Code & Diagram */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--sqi-text-light)', marginBottom: '6px' }}>
                <Code size={14} /> Code Snippet (Optional)
              </label>
              <textarea
                className="input-base"
                rows={3}
                placeholder="function example() { ... }"
                value={question.code || ''}
                onChange={(e) => update('code', e.target.value)}
                style={{
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.85rem',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--sqi-text-light)', marginBottom: '6px' }}>
                <ImageIcon size={14} /> Image / Diagram URL (Optional)
              </label>
              <input
                className="input-base"
                type="url"
                placeholder="https://example.com/diagram.png"
                value={question.imageUrl || ''}
                onChange={(e) => update('imageUrl', e.target.value)}
                style={{ fontSize: '0.9rem' }}
              />
              {question.imageUrl && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={question.imageUrl}
                    alt="Preview"
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid var(--sqi-gray-border)' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--sqi-text-light)' }}>Image loaded</span>
                </div>
              )}
            </div>
          </div>

          {/* Explanation / Key Takeaway */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--sqi-text-light)', marginBottom: '6px' }}>
              💡 Explanation / Key Takeaway (Optional)
            </label>
            <input
              className="input-base"
              type="text"
              placeholder="Brief explanation shown after reveal (e.g. Arrays in JS have a length property...)"
              value={question.explanation || ''}
              onChange={(e) => update('explanation', e.target.value)}
              style={{ fontSize: '0.9rem' }}
            />
          </div>

          {/* Multiple Choice options */}
          {question.type === 'multiple-choice' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--sqi-text-light)', marginBottom: '12px' }}>
                Answer Options (Click ✓ to mark correct)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {question.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Correct radio */}
                    <button
                      type="button"
                      onClick={() => update('correctAnswer', i)}
                      title={`Mark option ${OPTION_LABELS[i]} as correct`}
                      style={{
                        flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%',
                        border: `2px solid ${question.correctAnswer === i ? OPTION_COLORS[i] : 'var(--sqi-gray-border)'}`,
                        background: question.correctAnswer === i ? OPTION_COLORS[i] : 'var(--sqi-white)',
                        color: question.correctAnswer === i ? 'white' : 'var(--sqi-text-light)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {question.correctAnswer === i ? <CheckCircle size={16} /> : <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{OPTION_LABELS[i]}</span>}
                    </button>

                    {/* Option input */}
                    <div style={{
                      flex: 1, position: 'relative',
                      borderRadius: '8px',
                      border: `1.5px solid ${question.correctAnswer === i ? OPTION_COLORS[i] : 'var(--sqi-gray-border)'}`,
                      background: 'var(--sqi-white)',
                      transition: 'all 0.2s',
                    }}>
                      <input
                        className="input-base"
                        type="text"
                        placeholder={`Option ${OPTION_LABELS[i]}`}
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        style={{ border: 'none', background: 'transparent' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* True / False */}
          {question.type === 'true-false' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--sqi-text-light)', marginBottom: '12px' }}>
                Correct Answer
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['True', 'False'].map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => update('correctAnswer', i)}
                    style={{
                      flex: 1, padding: '14px',
                      borderRadius: '8px',
                      border: `2px solid ${question.correctAnswer === i ? (i === 0 ? 'var(--opt-green)' : 'var(--opt-red)') : 'var(--sqi-gray-border)'}`,
                      background: question.correctAnswer === i ? (i === 0 ? 'var(--opt-green)' : 'var(--opt-red)') : 'var(--sqi-white)',
                      color: question.correctAnswer === i ? 'white' : 'var(--sqi-text-light)',
                      fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}
                  >
                    {question.correctAnswer === i && <CheckCircle size={18} />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Open-Ended */}
          {question.type === 'open-ended' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--sqi-text-light)', marginBottom: '8px' }}>
                Correct Answer (exact text match)
              </label>
              <input
                className="input-base"
                type="text"
                placeholder="e.g. TCP/IP"
                value={question.correctAnswer}
                onChange={(e) => update('correctAnswer', e.target.value)}
              />
            </div>
          )}

          {/* Time limit & Double Points row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <TimeSlider value={question.timeLimit} onChange={(v) => update('timeLimit', v)} />
            </div>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: question.doublePoints ? 'rgba(245, 158, 11, 0.12)' : 'var(--sqi-gray-bg)',
                border: `1px solid ${question.doublePoints ? 'rgba(245, 158, 11, 0.4)' : 'var(--sqi-gray-border)'}`,
                cursor: 'pointer',
                userSelect: 'none',
                marginTop: '12px',
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(question.doublePoints)}
                onChange={(e) => update('doublePoints', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: question.doublePoints ? '#d97706' : 'var(--sqi-text-dark)' }}>
                🔥 2X Double Points
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function QuizCreator({ initialQuiz, onSave, onCancel }) {
  const isEditing = !!initialQuiz;

  const [title, setTitle]             = useState(initialQuiz?.title       || '');
  const [description, setDescription] = useState(initialQuiz?.description || '');
  const [questions, setQuestions]     = useState(
    initialQuiz?.questions?.length
      ? initialQuiz.questions
      : [makeQuestion('multiple-choice')]
  );
  const [errors, setErrors]           = useState([]);
  const [saved, setSaved]             = useState(false);

  // ── Question mutations ──────────────────────────────────
  const addQuestion = (type = 'multiple-choice') => {
    setQuestions((qs) => [...qs, makeQuestion(type)]);
  };

  const updateQuestion = useCallback((idx, updated) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? updated : q)));
  }, []);

  const deleteQuestion = useCallback((idx) => {
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  }, []);

  const moveQuestion = useCallback((idx, dir) => {
    setQuestions((qs) => {
      const next = [...qs];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return next;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  // ── Validation ──────────────────────────────────────────
  const validate = () => {
    const errs = [];
    if (!title.trim()) errs.push('Quiz title is required.');
    if (questions.length === 0) errs.push('Add at least one question.');

    questions.forEach((q, i) => {
      if (!q.question.trim()) errs.push(`Q${i + 1}: Question text is required.`);
      if (q.type === 'multiple-choice') {
        const filled = q.options.filter((o) => o.trim()).length;
        if (filled < 2) errs.push(`Q${i + 1}: At least 2 options are required.`);
        if (q.options[q.correctAnswer]?.trim() === '')
          errs.push(`Q${i + 1}: The correct option is empty.`);
      }
      if (q.type === 'open-ended' && !q.correctAnswer?.trim())
        errs.push(`Q${i + 1}: Correct answer text is required.`);
    });

    setErrors(errs);
    return errs.length === 0;
  };

  // ── Save ────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const quiz = {
      id: initialQuiz?.id || uid(),
      title: title.trim(),
      description: description.trim(),
      createdAt: initialQuiz?.createdAt || Date.now(),
      questions: questions.map((q) => ({
        ...q,
        question: q.question.trim(),
        options: q.type === 'open-ended' ? [] : q.options.map((o) => o?.trim() || ''),
        correctAnswer: q.type === 'open-ended' ? q.correctAnswer.trim() : q.correctAnswer,
        doublePoints: Boolean(q.doublePoints),
      })),
    };

    saveQuiz(quiz);
    setSaved(true);
    setTimeout(() => onSave(), 600);
  };

  return (
    <div className="layout-light" style={{ minHeight: '100vh', width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {/* ── Sticky header ──────────────────────────────── */}
      <header style={{
        padding: '16px 40px',
        background: 'var(--sqi-white)',
        borderBottom: '1px solid var(--sqi-gray-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={onCancel}
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ width: '1px', height: '24px', background: 'var(--sqi-gray-border)' }} />
          <h1 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--sqi-navy)' }}>
            {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--sqi-text-light)', fontWeight: 500 }}>
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </span>
          <button
            id="save-quiz-btn"
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={saved}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 24px' }}
          >
            <Save size={16} />
            {saved ? 'Saved ✓' : 'Save Quiz'}
          </button>
        </div>
      </header>

      {/* ── Main form ──────────────────────────────────── */}
      <main style={{ flex: 1, padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {/* Validation errors */}
        {errors.length > 0 && (
          <div
            className="animate-slide-up"
            style={{
              marginBottom: '24px',
              padding: '16px 20px',
              background: 'rgba(225,29,72,0.1)',
              border: '1px solid var(--opt-red)',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertCircle size={16} style={{ color: 'var(--opt-red)' }} />
              <span style={{ fontWeight: 600, color: 'var(--opt-red)', fontSize: '0.9rem' }}>
                Please fix the following issues:
              </span>
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 24px' }}>
              {errors.map((e, i) => (
                <li key={i} style={{ color: 'var(--sqi-text-dark)', fontSize: '0.85rem', marginBottom: '4px' }}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Quiz meta */}
        <div className="sqi-card" style={{ padding: '32px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--sqi-navy)', margin: '0 0 20px' }}>
            Quiz Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--sqi-text-dark)', marginBottom: '8px' }}>
                Title *
              </label>
              <input
                id="quiz-title"
                className="input-base"
                type="text"
                placeholder="e.g. Computer Science 101"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ fontSize: '1.1rem', fontWeight: 500 }}
                maxLength={80}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--sqi-text-dark)', marginBottom: '8px' }}>
                Description (optional)
              </label>
              <textarea
                id="quiz-description"
                className="input-base"
                rows={2}
                placeholder="Brief description of the quiz topic…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
                maxLength={200}
              />
            </div>
          </div>
        </div>

        {/* Questions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              total={questions.length}
              onChange={(updated) => updateQuestion(i, updated)}
              onDelete={() => deleteQuestion(i)}
              onMove={(idx, dir) => moveQuestion(idx, dir)}
            />
          ))}
        </div>

        {/* Add question buttons */}
        <div
          className="sqi-card"
          style={{
            padding: '24px 32px',
            display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--sqi-text-dark)', marginRight: '8px' }}>
            Add question:
          </span>
          {TYPES.map((t) => (
            <button
              key={t.value}
              id={`add-${t.value}`}
              type="button"
              onClick={() => addQuestion(t.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1.5px solid var(--sqi-gray-border)`,
                background: 'var(--sqi-white)',
                color: 'var(--sqi-text-dark)',
                fontSize: '0.9rem', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.color = t.color; }}
              onMouseOut={(e)  => { e.currentTarget.style.borderColor = 'var(--sqi-gray-border)'; e.currentTarget.style.color = 'var(--sqi-text-dark)'; }}
            >
              <Plus size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Bottom save */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--sqi-gray-border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={saved}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px', justifyContent: 'center' }}
          >
            <Save size={18} />
            {saved ? 'Saved ✓' : 'Save Quiz'}
          </button>
        </div>
      </main>
    </div>
  );
}
