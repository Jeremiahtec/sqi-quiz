/**
 * quizStorage.js
 * LocalStorage management for SQI Quizzes with pre-seeded sample quiz.
 */

const STORAGE_KEY = 'sqi-quizzes';

const DEFAULT_QUIZZES = [
  {
    id: 'sample-sqi-ict-101',
    title: 'SQI Web Development & ICT Foundations',
    description: 'Core concepts in modern web development, JavaScript ES6+, and computing fundamentals.',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is the output of this JavaScript snippet?',
        code: 'const a = [1, 2, 3];\nconst b = [...a, 4];\nconsole.log(b.length);',
        options: ['3', '4', 'undefined', 'TypeError'],
        correctAnswer: 1,
        timeLimit: 20,
        explanation: 'The spread operator (...) copies elements of a into b and appends 4, giving b.length === 4.',
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'HTTP is a stateless protocol by default.',
        options: ['True', 'False'],
        correctAnswer: 0,
        timeLimit: 15,
        explanation: 'HTTP is stateless; each request executes independently unless state is preserved with cookies or session tokens.',
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'Which CSS property creates a flexbox container?',
        options: ['display: flex', 'flex-direction: row', 'position: relative', 'align-items: center'],
        correctAnswer: 0,
        timeLimit: 20,
        explanation: 'Setting display: flex turns the element into a flex container and enables flex layout for its child elements.',
      },
      {
        id: 'q4',
        type: 'open-ended',
        question: 'What standard CLI tool serves as the default package manager for Node.js?',
        correctAnswer: 'npm',
        timeLimit: 20,
        explanation: 'npm (Node Package Manager) is bundled by default with Node.js for managing project dependencies.',
      },
    ],
  },
];

export function loadQuizzes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUIZZES));
      return DEFAULT_QUIZZES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUIZZES));
      return DEFAULT_QUIZZES;
    }
    return parsed;
  } catch {
    return DEFAULT_QUIZZES;
  }
}

export function saveQuiz(quiz) {
  const quizzes = loadQuizzes();
  const idx = quizzes.findIndex((q) => q.id === quiz.id);
  if (idx >= 0) quizzes[idx] = quiz;
  else quizzes.unshift(quiz);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
}

export function deleteQuizById(id) {
  const quizzes = loadQuizzes().filter((q) => q.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
}
