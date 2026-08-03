import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { LazyVimEngine } from '../../../utils/lazyvim-engine';
import { keymaps, KEYMAP_CATEGORIES, filterKeymaps, filterKeymapsByCategory, getRandomKeymap } from '../../../utils/lazyvim-keymaps';

const TABS = [
  { id: 'reference', label: 'Reference' },
  { id: 'practice', label: 'Practice' },
  { id: 'sandbox', label: 'Sandbox' },
];

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  return isTouch;
}

export default function LazyVimLearn() {
  const [activeTab, setActiveTab] = useState('reference');

  return (
    <>
      <Head>
        <title>LazyVim Learn — Vibe Tools</title>
        <meta name="description" content="Learn and practice LazyVim keymaps" />
      </Head>

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-[#000000] text-[#f5f5f7]">
          <div className="px-6 md:px-10 py-8 md:py-10">
            <h1 className="font-display text-[40px] md:text-[48px] leading-[1.07] tracking-tight font-semibold mb-2">
              LazyVim Learn
            </h1>
            <p className="text-[19px] leading-[1.21] font-semibold text-[#86868b] max-w-xl">
              Master LazyVim keybindings through reference, practice, and hands-on simulation
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-[#f5f5f7] dark:bg-[#1d1d1f] border-b border-[#d2d2d7] dark:border-[#424245]">
          <div className="px-6 md:px-10 flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-[14px] font-semibold leading-[1.29] transition-colors duration-150 border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'text-[#0071e3] border-[#0071e3]'
                    : 'text-[#6e6e73] border-transparent hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 bg-[#ffffff] dark:bg-[#000000]">
          {activeTab === 'reference' && (
            <ReferenceTab keymaps={keymaps} categories={KEYMAP_CATEGORIES} />
          )}
          {activeTab === 'practice' && (
            <PracticeTab keymaps={keymaps} categories={KEYMAP_CATEGORIES} />
          )}
          {activeTab === 'sandbox' && (
            <SandboxTab keymaps={keymaps} />
          )}
        </div>
      </div>
    </>
  );
}

// ── Reference Tab ────────────────────────────────────────────────

function ReferenceTab({ keymaps, categories }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filtered = useMemo(() => {
    let result = keymaps;
    if (selectedCategory) {
      result = filterKeymapsByCategory(result, selectedCategory);
    }
    if (search.trim()) {
      result = filterKeymaps(result, search);
    }
    return result;
  }, [keymaps, search, selectedCategory]);

  return (
    <div className="px-6 md:px-10 py-6">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search keymaps…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-lg border border-[#d2d2d7] dark:border-[#424245] bg-[#ffffff] dark:bg-[#1d1d1f] text-[17px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-[14px] font-medium leading-[1.29] transition-colors ${
            selectedCategory === null
              ? 'bg-[#0071e3] text-white'
              : 'bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#e8e8ed] dark:hover:bg-[#3a3a3c]'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
            className={`px-3 py-1.5 rounded-full text-[14px] font-medium leading-[1.29] transition-colors ${
              selectedCategory === cat.id
                ? 'bg-[#0071e3] text-white'
                : 'bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#e8e8ed] dark:hover:bg-[#3a3a3c]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-[14px] text-[#6e6e73] mb-4">
        {filtered.length} keymap{filtered.length !== 1 ? 's' : ''}
        {selectedCategory && ` in ${categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}`}
      </p>

      {/* Keymap cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {filtered.map((km) => (
          <div
            key={km.id}
            className="border border-[#d2d2d7] dark:border-[#424245] rounded-lg px-3 py-2.5 hover:border-[#0071e3]/40 hover:shadow-sm transition-colors bg-[#ffffff] dark:bg-[#1d1d1f]"
          >
            <span className="block font-mono text-[13px] font-semibold text-[#0071e3] dark:text-[#2997ff] mb-1 truncate">
              {km.keys}
            </span>
            <span className="block text-[12px] leading-[1.33] text-[#6e6e73] line-clamp-2">
              {km.description}
            </span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-[17px] text-[#6e6e73] text-center py-12">
          No keymaps found for "{search}".
        </p>
      )}
    </div>
  );
}

// ── Practice Tab ─────────────────────────────────────────────────

function PracticeTab({ keymaps, categories }) {
  const isTouch = useIsTouchDevice();
  const [mode, setMode] = useState('flashcard');
  const [selectedCategories, setSelectedCategories] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [inputBuffer, setInputBuffer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [speedrunResults, setSpeedrunResults] = useState(null);
  const inputRef = useRef(null);

  const nextQuestion = useCallback(() => {
    const pool = selectedCategories || categories.map((c) => c.id);
    const km = getRandomKeymap(keymaps, pool);
    setCurrentQuestion(km);
    setInputBuffer('');
    setFeedback(null);
  }, [keymaps, selectedCategories, categories]);

  const startFlashcard = () => {
    setMode('flashcard');
    setStarted(true);
    setFinished(false);
    setScore(0);
    setStreak(0);
    setTotalAttempts(0);
    nextQuestion();
  };

  const startSpeedrun = () => {
    setMode('speedrun');
    setStarted(true);
    setFinished(false);
    setScore(0);
    setStreak(0);
    setTotalAttempts(0);
    setTimeLeft(60);
    setSpeedrunResults(null);
    nextQuestion();
  };

  useEffect(() => {
    if (mode !== 'speedrun' || !started || finished) return;
    if (timeLeft <= 0) {
      finishSpeedrun();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [mode, started, finished, timeLeft]);

  const finishSpeedrun = () => {
    setFinished(true);
    setSpeedrunResults({
      score,
      totalAttempts,
      accuracy: totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0,
    });
  };

  const handlePracticeKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkAnswer();
      return;
    }
    if (e.key === 'Escape') {
      setInputBuffer('');
      return;
    }
    if (e.key === 'Backspace') {
      setInputBuffer((prev) => prev.slice(0, -1));
      return;
    }
    if (e.key.length === 1) {
      setInputBuffer((prev) => prev + e.key);
    }
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;
    const isCorrect = inputBuffer.trim() === currentQuestion.keys;
    setTotalAttempts((t) => t + 1);
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setFeedback({ correct: true, expected: currentQuestion.keys });
    } else {
      setStreak(0);
      setFeedback({ correct: false, expected: currentQuestion.keys });
    }
  };

  const handleNext = () => {
    if (mode === 'speedrun' && timeLeft <= 0) {
      finishSpeedrun();
      return;
    }
    nextQuestion();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) => {
      if (prev === null) return [catId];
      if (prev.includes(catId)) {
        const next = prev.filter((c) => c !== catId);
        return next.length === 0 ? null : next;
      }
      return [...prev, catId];
    });
  };

  // ── Setup screen ──
  if (!started) {
    return (
      <div className="px-6 md:px-10 py-8 max-w-xl mx-auto">
        <h2 className="text-[28px] leading-[1.14] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
          Practice Mode
        </h2>
        <p className="text-[17px] leading-[1.47] text-[#6e6e73] mb-6">
          Choose your mode and categories to practice.
        </p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={startFlashcard}
            className="flex-1 px-5 py-4 rounded-xl border border-[#d2d2d7] dark:border-[#424245] hover:border-[#0071e3] transition-colors text-left"
          >
            <div className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Flashcard</div>
            <div className="text-[14px] text-[#6e6e73]">Study at your own pace with immediate feedback</div>
          </button>
          <button
            onClick={startSpeedrun}
            className="flex-1 px-5 py-4 rounded-xl border border-[#d2d2d7] dark:border-[#424245] hover:border-[#0071e3] transition-colors text-left"
          >
            <div className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Speedrun ⚡</div>
            <div className="text-[14px] text-[#6e6e73]">60-second timed challenge</div>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-[14px] font-semibold text-[#6e6e73] mb-2">Categories (optional filter)</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategories === null || selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-[14px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-[#f5f5f7] dark:bg-[#272729] text-[#86868b]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Speedrun results ──
  if (finished && speedrunResults) {
    return (
      <div className="px-6 md:px-10 py-8 max-w-xl mx-auto text-center">
        <h2 className="text-[28px] leading-[1.14] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
          Time's Up!
        </h2>
        <div className="grid grid-cols-3 gap-4 my-8">
          <div className="bg-[#f5f5f7] dark:bg-[#272729] rounded-xl p-4">
            <div className="text-[32px] font-semibold text-[#0071e3]">{speedrunResults.score}</div>
            <div className="text-[12px] text-[#6e6e73]">Correct</div>
          </div>
          <div className="bg-[#f5f5f7] dark:bg-[#272729] rounded-xl p-4">
            <div className="text-[32px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{speedrunResults.accuracy}%</div>
            <div className="text-[12px] text-[#6e6e73]">Accuracy</div>
          </div>
          <div className="bg-[#f5f5f7] dark:bg-[#272729] rounded-xl p-4">
            <div className="text-[32px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{speedrunResults.totalAttempts}</div>
            <div className="text-[12px] text-[#6e6e73]">Attempted</div>
          </div>
        </div>
        <button
          onClick={startSpeedrun}
          className="px-6 py-3 rounded-full bg-[#0071e3] text-white text-[17px] font-semibold hover:bg-[#0066cc] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Active practice ──
  return (
    <div className="px-6 md:px-10 py-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-[14px] text-[#6e6e73]">
            Score: <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{score}</span>
          </div>
          {streak > 1 && (
            <div className="text-[14px] text-[#ff9f0a]">🔥 {streak} streak</div>
          )}
        </div>
        {mode === 'speedrun' && (
          <div className={`text-[17px] font-semibold ${timeLeft <= 10 ? 'text-[#ff3b30]' : 'text-[#1d1d1f] dark:text-[#f5f5f7]'}`}>
            {timeLeft}s
          </div>
        )}
        <button
          onClick={() => { setStarted(false); setFinished(false); }}
          className="text-[14px] text-[#0071e3] hover:underline"
        >
          Exit
        </button>
      </div>

      {currentQuestion && (
        <>
          <div className="bg-[#f5f5f7] dark:bg-[#272729] rounded-xl p-6 mb-6">
            <p className="text-[12px] text-[#86868b] uppercase tracking-wide mb-2">{currentQuestion.category}</p>
            <p className="text-[21px] leading-[1.38] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {currentQuestion.description}
            </p>
          </div>

          {/* Mobile: multiple choice */}
          {isTouch && !feedback && (
            <div className="grid grid-cols-2 gap-2 mt-4 mb-4">
              {(() => {
                const correct = currentQuestion.keys;
                const wrongPool = keymaps
                  .filter((km) => km.keys !== correct && km.category === currentQuestion.category)
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 3)
                  .map((km) => km.keys);
                const options = [...wrongPool, correct].sort(() => Math.random() - 0.5);
                return options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setInputBuffer(opt);
                      setTimeout(() => {
                        const isCorrect = opt === correct;
                        setTotalAttempts((t) => t + 1);
                        if (isCorrect) {
                          setScore((s) => s + 1);
                          setStreak((s) => s + 1);
                          setFeedback({ correct: true, expected: correct });
                        } else {
                          setStreak(0);
                          setFeedback({ correct: false, expected: correct });
                        }
                      }, 100);
                    }}
                    className="px-3 py-2.5 rounded-lg border border-[#d2d2d7] dark:border-[#424245] font-mono text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:border-[#0071e3] active:bg-[#0071e3]/10 transition-colors"
                  >
                    {opt}
                  </button>
                ));
              })()}
            </div>
          )}

          {/* Desktop: keyboard input */}
          {!isTouch && !feedback ? (
            <div
              className="relative"
              onClick={() => inputRef.current?.focus()}
            >
              <div className="px-4 py-3 rounded-lg border-2 border-[#0071e3] bg-[#ffffff] dark:bg-[#1d1d1f] min-h-[48px] flex items-center cursor-text">
                <span className="font-mono text-[21px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {inputBuffer || <span className="text-[#86868b]">Type the key sequence…</span>}
                </span>
                <span className="inline-block w-0.5 h-5 bg-[#0071e3] ml-0.5 animate-pulse" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value=""
                onKeyDown={handlePracticeKey}
                onChange={() => {}}
                className="sr-only"
                autoFocus
              />
              <button
                onClick={checkAnswer}
                disabled={!inputBuffer.trim()}
                className="mt-3 px-5 py-2 rounded-full bg-[#0071e3] text-white text-[14px] font-semibold hover:bg-[#0066cc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Check (Enter)
              </button>
            </div>
          ) : (
            <div>
              <div className={`px-4 py-3 rounded-lg mb-3 ${
                feedback.correct
                  ? 'bg-[#30d158]/10 border border-[#30d158]/30'
                  : 'bg-[#ff3b30]/10 border border-[#ff3b30]/30'
              }`}>
                <p className={`text-[17px] font-semibold mb-1 ${feedback.correct ? 'text-[#30d158]' : 'text-[#ff3b30]'}`}>
                  {feedback.correct ? '✓ Correct!' : '✗ Incorrect'}
                </p>
                <p className="text-[14px] text-[#6e6e73]">
                  Answer: <code className="font-mono font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] bg-[#f5f5f7] dark:bg-[#272729] px-2 py-0.5 rounded">{feedback.expected}</code>
                </p>
              </div>
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-full bg-[#0071e3] text-white text-[14px] font-semibold hover:bg-[#0066cc] transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Sandbox Tab ──────────────────────────────────────────────────

function SandboxTab({ keymaps }) {
  const isTouch = useIsTouchDevice();
  const [engine, setEngine] = useState(null);
  const [buffer, setBuffer] = useState([]);
  const [cursor, setCursor] = useState({ row: 0, col: 0 });
  const [mode, setMode] = useState('normal');
  const [visualType, setVisualType] = useState(null);
  const [visualAnchor, setVisualAnchor] = useState(null);
  const [actionLog, setActionLog] = useState([]);
  const [lastAction, setLastAction] = useState(null);
  const [waitingSeq, setWaitingSeq] = useState('');
  const sandboxRef = useRef(null);

  useEffect(() => {
    const eng = new LazyVimEngine();
    eng.registerKeymaps(keymaps);
    setEngine(eng);
    setBuffer(eng.buffer);
  }, [keymaps]);

  useEffect(() => {
    sandboxRef.current?.focus();
  }, []);

  const handleSandboxKey = (e) => {
    if (!engine) return;

    let key = e.key;
    if (e.ctrlKey && key !== 'Control') {
      key = `<C-${key}>`;
    }

    const vimKeys = ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'i', 'a', 'o', 'O', 'I', 'A',
      'x', 'd', 'y', 'p', 'P', 'u', 'v', 'V', '0', '$', 'gg', 'G', '{', '}', '%',
      '/', '?', 'n', 'N', '*', '#', '>', '<', 'Escape', 'Enter', 'Backspace', 'Tab',
      'c', 'K', 'g', '[', ']', 'z'];
    if (vimKeys.includes(e.key) || e.ctrlKey) {
      e.preventDefault();
    }

    const result = engine.handleKey(key);
    setBuffer([...engine.buffer]);
    setCursor({ ...engine.cursor });
    setMode(engine.mode);
    setVisualType(engine.visualType);
    setVisualAnchor(engine.visualAnchor ? { ...engine.visualAnchor } : null);
    setActionLog([...engine.actionLog]);
    setLastAction(result);

    if (result.type === 'waiting') {
      setWaitingSeq(result.sequence);
    } else {
      setWaitingSeq('');
    }
  };

  const handleReset = () => {
    if (!engine) return;
    engine.reset();
    setBuffer([...engine.buffer]);
    setCursor({ ...engine.cursor });
    setMode(engine.mode);
    setVisualType(null);
    setVisualAnchor(null);
    setActionLog([]);
    setLastAction(null);
    setWaitingSeq('');
  };

  const getVisualRange = () => {
    if (!visualAnchor || mode !== 'visual') return null;
    return {
      start: Math.min(visualAnchor.row, cursor.row),
      end: Math.max(visualAnchor.row, cursor.row),
    };
  };

  const visualRange = getVisualRange();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-220px)] min-h-[500px]">
      {/* Editor pane */}
      <div
        ref={sandboxRef}
        tabIndex={0}
        onKeyDown={handleSandboxKey}
        className="flex-1 bg-[#1d1d1f] text-[#f5f5f7] font-mono text-[15px] leading-[1.6] p-4 overflow-auto focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0071e3] rounded-lg lg:rounded-r-none"
      >
        <div className="text-[12px] text-[#6e6e73] mb-3 select-none">
          Click here and start typing Vim keys…
        </div>

        {buffer.map((line, rowIdx) => {
          const isSelected = visualRange && rowIdx >= visualRange.start && rowIdx <= visualRange.end;
          const isCursorRow = cursor.row === rowIdx;

          return (
            <div key={rowIdx} className={`flex ${isSelected ? 'bg-[#0071e3]/20' : ''}`}>
              <span className="text-[#6e6e73] text-[12px] w-8 text-right mr-3 select-none flex-shrink-0 leading-[1.6]">
                {rowIdx + 1}
              </span>
              <span className="flex-1 whitespace-pre">
                {isCursorRow && mode !== 'visual' ? (
                  <>
                    <span>{line.slice(0, cursor.col)}</span>
                    <span className="inline-block w-1.5 h-[1.1em] bg-[#0071e3] align-middle mx-[-1px] animate-pulse" />
                    <span>{line.slice(cursor.col)}</span>
                  </>
                ) : isCursorRow && mode === 'visual' ? (
                  <>
                    <span>{line.slice(0, cursor.col)}</span>
                    <span className="inline-block w-1.5 h-[1.1em] bg-[#ff9f0a] align-middle mx-[-1px]" />
                    <span>{line.slice(cursor.col)}</span>
                  </>
                ) : (
                  <span>{line || ' '}</span>
                )}
              </span>
            </div>
          );
        })}

        {/* Statusline */}
        <div className="mt-4 pt-2 border-t border-[#424245] flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded font-semibold ${
              mode === 'normal' ? 'bg-[#0071e3] text-white' :
              mode === 'insert' ? 'bg-[#30d158] text-black' :
              'bg-[#ff9f0a] text-black'
            }`}>
              {mode === 'normal' ? 'NORMAL' : mode === 'insert' ? 'INSERT' : mode.toUpperCase()}
            </span>
            {waitingSeq && (
              <span className="text-[#86868b]">waiting: {waitingSeq}</span>
            )}
          </div>
          <div className="text-[#6e6e73]">
            Ln {cursor.row + 1}, Col {cursor.col + 1}
          </div>
        </div>

        {/* Mobile on-screen key grid */}
        {isTouch && (
          <div className="mt-3 grid grid-cols-8 gap-1.5">
            {['h','j','k','l','w','b','e','i','a','o','x','dd','yy','p','u','Escape'].map((k) => (
              <button
                key={k}
                onPointerDown={(e) => {
                  e.preventDefault();
                  if (!engine) return;
                  for (const ch of k) {
                    const result = engine.handleKey(ch);
                    setBuffer([...engine.buffer]);
                    setCursor({ ...engine.cursor });
                    setMode(engine.mode);
                    setVisualType(engine.visualType);
                    setVisualAnchor(engine.visualAnchor ? { ...engine.visualAnchor } : null);
                    setActionLog([...engine.actionLog]);
                    setLastAction(result);
                    setWaitingSeq(result.type === 'waiting' ? result.sequence : '');
                  }
                }}
                className="px-2 py-2.5 rounded-lg bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-[#f5f5f7] font-mono text-[13px] font-semibold text-center active:bg-[#0071e3] active:text-white transition-colors select-none touch-manipulation"
              >
                {k}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Key inspector sidebar */}
      <div className="lg:w-80 bg-[#f5f5f7] dark:bg-[#272729] border-t lg:border-t-0 lg:border-l border-[#d2d2d7] dark:border-[#424245] p-4 overflow-auto rounded-lg lg:rounded-l-none mt-4 lg:mt-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            Key Inspector
          </h3>
          <button
            onClick={handleReset}
            className="text-[12px] text-[#0071e3] hover:underline"
          >
            Reset Buffer
          </button>
        </div>

        {lastAction && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-[#0071e3]/10 border border-[#0071e3]/20">
            <p className="text-[14px] font-semibold text-[#0071e3]">Last action</p>
            <p className="text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">{lastAction.description}</p>
          </div>
        )}

        <div className="space-y-1.5">
          {[...actionLog].reverse().slice(0, 20).map((entry, i) => (
            <div
              key={i}
              className={`px-2.5 py-1.5 rounded text-[13px] leading-[1.4] ${
                i === 0
                  ? 'bg-[#0071e3]/10 text-[#0071e3] font-medium'
                  : 'text-[#6e6e73]'
              }`}
            >
              <span className="font-mono font-semibold">{entry.action}</span>
              <span className="mx-1.5">—</span>
              {entry.description}
            </div>
          ))}
        </div>

        {actionLog.length === 0 && (
          <p className="text-[13px] text-[#86868b] italic">
            Press keys to see their actions appear here.
          </p>
        )}
      </div>
    </div>
  );
}