import { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

const CENTER_X = 600;
const NODE_RADIUS = 28;
const DOT_THRESHOLD_MS = 250;
const INACTIVITY_MS = 800;
const GLOW_DURATION_MS = 1500;
const TONE_FREQ = 700;

const MORSE_NODES = [
  [null, 1, 2, CENTER_X, 100],           // 0: Root
  ['E', 3, 4, CENTER_X - 200, 200],      // 1: E (.)
  ['T', 5, 6, CENTER_X + 200, 200],      // 2: T (-)
  ['I', 7, 8, CENTER_X - 320, 300],      // 3: I (..)
  ['A', 9, 10, CENTER_X - 80, 300],      // 4: A (.-)
  ['N', 11, 12, CENTER_X + 80, 300],     // 5: N (-.)
  ['M', 13, 14, CENTER_X + 320, 300],    // 6: M (--)
  ['S', 15, 16, CENTER_X - 400, 420],    // 7: S (...)
  ['U', 17, 18, CENTER_X - 240, 420],    // 8: U (..-)
  ['R', 19, 20, CENTER_X - 120, 420],    // 9: R (.-.)
  ['W', 21, 22, CENTER_X + 40, 420],     // 10: W (.--)
  ['D', 23, 24, CENTER_X + 160, 420],    // 11: D (-..)
  ['K', 25, 26, CENTER_X + 280, 420],    // 12: K (-.-)
  ['G', 27, 28, CENTER_X + 400, 420],    // 13: G (--.)
  ['O', 29, 30, CENTER_X + 520, 420],    // 14: O (---)
  ['H', -1, -1, CENTER_X - 480, 540],    // 15: H (....)
  ['V', -1, -1, CENTER_X - 360, 540],    // 16: V (...-)
  ['F', -1, -1, CENTER_X - 280, 540],    // 17: F (..-.)
  [null, 31, -1, CENTER_X - 200, 540],   // 18: empty
  ['L', -1, -1, CENTER_X - 120, 540],    // 19: L (.-.)
  [null, 32, -1, CENTER_X - 40, 540],    // 20: empty
  ['P', -1, -1, CENTER_X + 40, 540],     // 21: P (.--.)
  ['J', -1, -1, CENTER_X + 120, 540],    // 22: J (.---)
  ['B', -1, -1, CENTER_X + 200, 540],    // 23: B (-...)
  ['X', -1, -1, CENTER_X + 280, 540],    // 24: X (-..-)
  ['C', -1, -1, CENTER_X + 360, 540],    // 25: C (-.-.)
  ['Y', -1, -1, CENTER_X + 440, 540],    // 26: Y (-.--)
  ['Z', -1, -1, CENTER_X + 520, 540],    // 27: Z (--..)
  ['Q', -1, -1, CENTER_X + 600, 540],    // 28: Q (--.-)
  [null, -1, -1, CENTER_X + 560, 540],   // 29: empty
  [null, -1, -1, CENTER_X + 640, 540],   // 30: empty
  ['?', -1, -1, CENTER_X - 240, 640],    // 31: ? (..--)
  ['?', -1, -1, CENTER_X - 80, 640],     // 32: ? (.-.--)
];

const MORSE_MAP = {
  'A': '.-',   'B': '-...', 'C': '-.-.', 'D': '-..',  'E': '.',
  'F': '..-.', 'G': '--.',  'H': '....', 'I': '..',   'J': '.---',
  'K': '-.-',  'L': '.-..', 'M': '--',   'N': '-.',   'O': '---',
  'P': '.--.', 'Q': '--.-', 'R': '.-.',  'S': '...',  'T': '-',
  'U': '..-',  'V': '...-', 'W': '.--',  'X': '-..-', 'Y': '-.--',
  'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
};

function textToMorse(text) {
  const cleaned = text.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words
    .map((word) =>
      word
        .split('')
        .map((ch) => MORSE_MAP[ch] || '')
        .filter(Boolean)
        .join(' '),
    )
    .join(' / ');
}

function traverseNode(code) {
  let current = 0;
  for (const signal of code) {
    const node = MORSE_NODES[current];
    const next = signal === '.' ? node[1] : node[2];
    if (next === -1) return current;
    current = next;
  }
  return current;
}

function getPathNodes(code) {
  const nodes = [];
  let current = 0;
  nodes.push(current);
  for (const signal of code) {
    const node = MORSE_NODES[current];
    const next = signal === '.' ? node[1] : node[2];
    if (next === -1) break;
    current = next;
    nodes.push(current);
  }
  return nodes;
}

function isLeaf(idx) {
  const node = MORSE_NODES[idx];
  return node[1] === -1 && node[2] === -1;
}

function findNodeByLetter(letter) {
  for (let i = 0; i < MORSE_NODES.length; i++) {
    if (MORSE_NODES[i][0] === letter) return i;
  }
  return -1;
}

export default function MorseTool() {
  const [output, setOutput] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [glowLetter, setGlowLetter] = useState(null);
  const [error, setError] = useState('');
  const [pulsePhase, setPulsePhase] = useState(0);
  const [keyPressed, setKeyPressed] = useState(false);
  const [lastSignal, setLastSignal] = useState(null);
  const [activeTab, setActiveTab] = useState('translator');
  const [showWave, setShowWave] = useState(false);

  // Practice mode state
  const [practiceSentence, setPracticeSentence] = useState('');
  const [practiceAuthor, setPracticeAuthor] = useState('');
  const [userTranslation, setUserTranslation] = useState('');
  const [wpm, setWpm] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceResult, setPracticeResult] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const commitTimerRef = useRef(null);
  const currentCodeRef = useRef('');
  const currentNodeRef = useRef(0);
  const glowTimerRef = useRef(null);
  const pressStartRef = useRef(0);
  const keyPressedRef = useRef(false);
  const playingRef = useRef(false);
  const scheduledNodesRef = useRef([]);

  currentCodeRef.current = currentCode;
  currentNodeRef.current = traverseNode(currentCode);
  keyPressedRef.current = keyPressed;

  const currentNode = currentNodeRef.current;
  const pathNodes = getPathNodes(currentCode);
  const currentLetter = MORSE_NODES[currentNode][0];
  const atLeaf = isLeaf(currentNode);
  const pulse = (Math.sin(pulsePhase * 0.15) + 1) / 2;

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const startTone = useCallback(() => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = TONE_FREQ;
      gain.gain.setValueAtTime(0.0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = { osc, gain, ctx };
    } catch (e) {
      oscRef.current = null;
    }
  }, [getAudioCtx]);

  const stopTone = useCallback(() => {
    if (!oscRef.current) return;
    try {
      const { osc, gain, ctx } = oscRef.current;
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value || 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Oscillator may already be stopped
    }
    oscRef.current = null;
  }, []);

  const commitCurrent = useCallback(() => {
    const code = currentCodeRef.current;
    const nodeIdx = currentNodeRef.current;
    if (!code) return;
    const letter = MORSE_NODES[nodeIdx][0];
    if (letter) {
      setOutput((prev) => prev + letter);
      setGlowLetter(letter);
      if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
      glowTimerRef.current = setTimeout(() => setGlowLetter(null), GLOW_DURATION_MS);
    }
    setCurrentCode('');
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  }, []);

  const processSignal = useCallback(
    (signal) => {
      const code = currentCodeRef.current;
      const nodeIdx = currentNodeRef.current;
      const node = MORSE_NODES[nodeIdx];
      const next = signal === '.' ? node[1] : node[2];

      if (next === -1) {
        setError('Invalid Morse sequence');
        setTimeout(() => setError(''), 1500);
        return;
      }

      setCurrentCode(code + signal);

      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current);
        commitTimerRef.current = null;
      }

      if (isLeaf(next)) {
        const leafLetter = MORSE_NODES[next][0];
        if (leafLetter) {
          setOutput((prev) => prev + leafLetter);
          setGlowLetter(leafLetter);
          if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
          glowTimerRef.current = setTimeout(() => setGlowLetter(null), GLOW_DURATION_MS);
        }
        setCurrentCode('');
      } else {
        commitTimerRef.current = setTimeout(() => {
          commitCurrent();
        }, INACTIVITY_MS);
      }
    },
    [commitCurrent],
  );

  const fireSignal = useCallback(() => {
    const duration = Date.now() - pressStartRef.current;
    const isDot = duration < DOT_THRESHOLD_MS;
    const signal = isDot ? '.' : '-';

    setLastSignal({ type: isDot ? 'dot' : 'dash', time: Date.now() });
    setShowWave(true);
    setTimeout(() => {
      setShowWave(false);
      setLastSignal(null);
    }, 600);

    processSignal(signal);
  }, [processSignal]);

  const handlePressStart = useCallback(
    (e) => {
      e.preventDefault();
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current);
        commitTimerRef.current = null;
      }
      pressStartRef.current = Date.now();
      setKeyPressed(true);
      startTone();
    },
    [startTone],
  );

  const handlePressEnd = useCallback(
    (e) => {
      e.preventDefault();
      if (!keyPressedRef.current) return;
      setKeyPressed(false);
      stopTone();
      fireSignal();
    },
    [stopTone, fireSignal],
  );

  const handleKeyCancel = useCallback(() => {
    if (!keyPressedRef.current) return;
    setKeyPressed(false);
    stopTone();
  }, [stopTone]);

  const handleCommit = useCallback(() => {
    commitCurrent();
  }, [commitCurrent]);

  const handleClear = useCallback(() => {
    setOutput('');
    setCurrentCode('');
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  }, []);

  const handleBackspace = useCallback(() => {
    setOutput((prev) => prev.slice(0, -1));
  }, []);

  const handleWordSpace = useCallback(() => {
    setOutput((prev) => prev + ' ');
  }, []);

  // ── Practice mode ──

  const scheduleToneAt = useCallback((ctx, startTime, durationSec) => {
    if (!playingRef.current) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = TONE_FREQ;
    const fadeIn = Math.min(0.005, durationSec / 4);
    const fadeOut = Math.min(0.005, durationSec / 4);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + fadeIn);
    gain.gain.setValueAtTime(0.3, startTime + durationSec - fadeOut);
    gain.gain.linearRampToValueAtTime(0, startTime + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + durationSec);
    scheduledNodesRef.current.push(osc);
  }, []);

  const stopPlayback = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
    scheduledNodesRef.current.forEach((node) => {
      try { node.stop(); } catch (e) { /* already stopped */ }
      try { node.disconnect(); } catch (e) { /* already disconnected */ }
    });
    scheduledNodesRef.current = [];
  }, []);

  const playMorseCode = useCallback(() => {
    const ctx = getAudioCtx();
    if (!ctx || !practiceSentence) return;

    stopPlayback();
    playingRef.current = true;
    setIsPlaying(true);

    const morseStr = textToMorse(practiceSentence);
    if (!morseStr) {
      setIsPlaying(false);
      playingRef.current = false;
      return;
    }

    const unitSec = (1200 / wpm) / 1000;
    const scheduleAhead = 0.08;
    let t = ctx.currentTime + scheduleAhead;

    for (const ch of morseStr) {
      if (!playingRef.current) break;
      if (ch === '.') {
        scheduleToneAt(ctx, t, unitSec);
        t += unitSec + unitSec; // beep + intra-char gap
      } else if (ch === '-') {
        scheduleToneAt(ctx, t, 3 * unitSec);
        t += 3 * unitSec + unitSec; // beep + intra-char gap
      } else if (ch === ' ') {
        t += 2 * unitSec; // letter gap (1 already counted from last signal, add 2 = 3 total)
      } else if (ch === '/') {
        t += 6 * unitSec; // word gap (1 already counted, add 6 = 7 total)
      }
    }

    const totalDuration = t - ctx.currentTime;
    setTimeout(() => {
      if (playingRef.current) {
        setIsPlaying(false);
        playingRef.current = false;
      }
    }, Math.max(totalDuration * 1000 + 200, 100));
  }, [getAudioCtx, practiceSentence, wpm, stopPlayback, scheduleToneAt]);

  const fetchSentence = useCallback(async () => {
    setIsLoadingQuote(true);
    setPracticeResult(null);
    setShowAnswer(false);
    setUserTranslation('');
    try {
      const res = await fetch('https://api.quotable.io/random?minLength=20&maxLength=120');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setPracticeSentence(data.content);
      setPracticeAuthor(data.author);
    } catch (e) {
      const fallbacks = [
        { content: 'The only way to do great work is to love what you do', author: 'Steve Jobs' },
        { content: 'Life is what happens when you are busy making other plans', author: 'John Lennon' },
        { content: 'The journey of a thousand miles begins with a single step', author: 'Lao Tzu' },
        { content: 'In the middle of difficulty lies opportunity', author: 'Albert Einstein' },
        { content: 'Simplicity is the ultimate sophistication', author: 'Leonardo da Vinci' },
      ];
      const quote = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      setPracticeSentence(quote.content);
      setPracticeAuthor(quote.author);
    }
    setIsLoadingQuote(false);
  }, []);

  const checkAnswer = useCallback(() => {
    const normalize = (s) =>
      s
        .toUpperCase()
        .replace(/[^A-Z0-9 ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const user = normalize(userTranslation);
    const actual = normalize(practiceSentence);
    if (user === actual) {
      setPracticeResult('correct');
      setShowAnswer(false);
    } else {
      setPracticeResult('incorrect');
      setShowAnswer(true);
    }
  }, [userTranslation, practiceSentence]);

  const revealAnswer = useCallback(() => {
    setShowAnswer(true);
    setPracticeResult('incorrect');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (!keyPressedRef.current) {
          handlePressStart(e);
        }
      } else if (e.key === 'Backspace' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleWordSpace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handlePressEnd(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleKeyCancel);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleKeyCancel);
    };
  }, [handlePressStart, handlePressEnd, handleKeyCancel, handleBackspace, handleWordSpace, handleClear]);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      setPulsePhase((p) => p + 1);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return () => {
      running = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
      if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
      stopTone();
    };
  }, [stopTone]);

  const glowNodeIdx = glowLetter ? findNodeByLetter(glowLetter) : -1;
  const pathSet = new Set(pathNodes);
  const pressDuration = keyPressed ? Date.now() - pressStartRef.current : 0;
  const willBeDash = pressDuration >= DOT_THRESHOLD_MS;

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Morse Code - Vibe Tools</title>
        <meta name="description" content="Interactive Morse code translator with telegraph key and visual binary tree" />
      </Head>
      <header className="border-b border-border py-8 pb-0">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">
            Morse Code Translator
          </h1>
          <p className="text-body text-textMuted">
            {activeTab === 'translator'
              ? 'Press &amp; hold the telegraph key or Space bar — quick press = dot, long press = dash'
              : 'Listen to Morse code radio and practice your translation skills'}
          </p>

          {/* Tab bar */}
          <div className="flex gap-0 mt-6" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'translator'}
              onClick={() => setActiveTab('translator')}
              className={`px-5 py-2.5 text-control font-medium border-b-2 transition-colors duration-150 ${
                activeTab === 'translator'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-textDim hover:text-text'
              }`}
            >
              <span className="mr-1.5">⚡</span> Telegraph Key
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'practice'}
              onClick={() => setActiveTab('practice')}
              className={`px-5 py-2.5 text-control font-medium border-b-2 transition-colors duration-150 ${
                activeTab === 'practice'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-textDim hover:text-text'
              }`}
            >
              <span className="mr-1.5">📻</span> Practice
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {activeTab === 'translator' && (
        <div className="space-y-5">
          {/* SVG Tree */}
          <div className="border border-border rounded-lg overflow-hidden bg-input">
            <svg
              viewBox="0 0 1320 720"
              width="100%"
              preserveAspectRatio="xMidYMid meet"
              style={{ maxHeight: '50vh', display: 'block', height: 'auto' }}
            >
              <defs>
                <filter id="morse-glow-active">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="morse-glow-path">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="morse-glow-letter">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width="1320" height="720" fill="transparent" />

              {MORSE_NODES.map((node, i) => {
                const [, dotChild, dashChild, x, y] = node;
                const elements = [];

                if (dotChild !== -1) {
                  const child = MORSE_NODES[dotChild];
                  const active = currentNode === dotChild || pathSet.has(dotChild);
                  elements.push(
                    <line
                      key={`dot-${i}-${dotChild}`}
                      x1={x} y1={y} x2={child[3]} y2={child[4]}
                      stroke={active ? '#00ff78' : 'var(--border)'}
                      strokeWidth={active ? 5 : 3}
                      strokeLinecap="round"
                      filter={active ? 'url(#morse-glow-path)' : undefined}
                    />,
                  );
                }

                if (dashChild !== -1) {
                  const child = MORSE_NODES[dashChild];
                  const active = currentNode === dashChild || pathSet.has(dashChild);
                  elements.push(
                    <line
                      key={`dash-${i}-${dashChild}`}
                      x1={x} y1={y} x2={child[3]} y2={child[4]}
                      stroke={active ? '#00ff78' : 'var(--border)'}
                      strokeWidth={active ? 5 : 3}
                      strokeLinecap="round"
                      filter={active ? 'url(#morse-glow-path)' : undefined}
                    />,
                  );
                }

                return elements;
              })}

              {MORSE_NODES.map((node, i) => {
                const [letter, , , x, y] = node;
                const isCurrent = i === currentNode;
                const isInPath = pathSet.has(i);
                const isGlowing = i === glowNodeIdx;

                let fillColor = 'var(--border)';
                let strokeColor = 'var(--textDim)';
                let textColor = 'var(--textMuted)';
                let radius = NODE_RADIUS;
                let fontSize = 24;
                let fontWeight = 'normal';
                let glowFilter = undefined;
                let glowCircle = null;

                if (isCurrent) {
                  const r = NODE_RADIUS + 6 + Math.round(4 * pulse);
                  fillColor = `rgb(${Math.round(50 + 50 * pulse)},255,${Math.round(100 + 50 * pulse)})`;
                  strokeColor = '#00ff96';
                  textColor = '#ffffff';
                  radius = r;
                  fontSize = 28;
                  fontWeight = 'bold';
                  glowFilter = 'url(#morse-glow-active)';
                  glowCircle = (
                    <circle
                      cx={x} cy={y} r={r + 10}
                      fill="none"
                      stroke="#00ff64"
                      strokeWidth={2}
                      opacity={0.3 + 0.3 * pulse}
                      filter="url(#morse-glow-active)"
                    />
                  );
                } else if (isInPath) {
                  fillColor = '#00a040';
                  strokeColor = '#00d060';
                  textColor = '#e0e0e0';
                  glowFilter = 'url(#morse-glow-path)';
                }

                if (isGlowing) {
                  textColor = '#ffd700';
                  fontWeight = 'bold';
                  fontSize = 28;
                  glowFilter = 'url(#morse-glow-letter)';
                }

                return (
                  <g key={`node-${i}`}>
                    {glowCircle}
                    <circle
                      cx={x} cy={y} r={radius}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={3}
                      filter={glowFilter}
                    />
                    {letter && (
                      <>
                        <text
                          x={x + 1} y={y + 1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#000000"
                          fontSize={fontSize}
                          fontWeight={fontWeight}
                          fontFamily="monospace"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                          opacity={0.4}
                        >
                          {letter}
                        </text>
                        <text
                          x={x} y={y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={textColor}
                          fontSize={fontSize}
                          fontWeight={fontWeight}
                          fontFamily="monospace"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {letter}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Code display + signal indicator */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] border border-border rounded bg-input px-4 py-3 flex items-center gap-3">
              <span className="text-micro text-textDim">Code:</span>
              <span className="text-body font-mono text-text tracking-widest">
                {currentCode || ' '}
              </span>
              {!currentCode && (
                <span className="text-control text-textDim">waiting for signal...</span>
              )}
              {lastSignal && (
                <span
                  className={`text-control font-bold ml-auto px-2.5 py-0.5 rounded ${
                    lastSignal.type === 'dot'
                      ? 'bg-[#00ff64] text-black'
                      : 'bg-[#ffb800] text-black'
                  }`}
                  style={{ animation: 'signal-flash 0.4s ease-out' }}
                >
                  {lastSignal.type === 'dot' ? 'DOT' : 'DASH'}
                </span>
              )}
            </div>
            {currentCode && currentLetter && !atLeaf && (
              <span className="text-control text-textMuted">wait or press Enter to commit</span>
            )}
          </div>

          {/* Telegraph Key */}
          <div className="flex flex-col items-center py-4">
            <div
              className="relative select-none cursor-pointer"
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handleKeyCancel}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              role="button"
              tabIndex={0}
              aria-label="Telegraph key - press and hold"
            >
              {/* Signal wave rings */}
              {showWave && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="wave-ring" />
                  <div className="wave-ring" style={{ animationDelay: '0.15s' }} />
                  <div className="wave-ring" style={{ animationDelay: '0.3s' }} />
                </div>
              )}

              {/* Base plate */}
              <div
                className="w-56 h-6 rounded-full mx-auto transition-shadow duration-150"
                style={{
                  background: 'linear-gradient(180deg, #6b7280 0%, #4b5563 100%)',
                  boxShadow: keyPressed
                    ? '0 2px 8px rgba(0,255,100,0.4), 0 1px 3px rgba(0,0,0,0.5)'
                    : '0 4px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
                }}
              />

              {/* Pivot + lever mechanism */}
              <div className="relative h-20 mx-auto w-56">
                {/* Pivot post */}
                <div
                  className="absolute left-8 bottom-1 w-3.5 h-10 rounded-sm"
                  style={{ background: 'linear-gradient(180deg, #9ca3af 0%, #6b7280 100%)' }}
                />

                {/* Lever arm */}
                <div
                  className="absolute left-6 top-2 w-[184px] h-3 rounded-full origin-left transition-transform duration-75"
                  style={{
                    background: 'linear-gradient(180deg, #d1d5db 0%, #9ca3af 100%)',
                    transform: keyPressed ? 'rotate(3.5deg)' : 'rotate(0deg)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Knob */}
                  <div
                    className="absolute -right-2 -top-4 w-12 h-12 rounded-full transition-all duration-75"
                    style={{
                      background: keyPressed
                        ? 'radial-gradient(circle at 40% 35%, #fbbf24, #d97706)'
                        : 'radial-gradient(circle at 40% 35%, #fcd34d, #b45309)',
                      boxShadow: keyPressed
                        ? '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1)'
                        : '0 4px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.2)',
                      transform: keyPressed ? 'translateY(4px)' : 'translateY(0)',
                    }}
                  />
                </div>

                {/* Contact point glow */}
                <div
                  className="absolute right-7 bottom-2 w-3 h-3 rounded-full transition-all duration-100"
                  style={{
                    background: keyPressed ? '#00ff64' : '#374151',
                    boxShadow: keyPressed
                      ? '0 0 16px #00ff64, 0 0 32px rgba(0,255,100,0.6), 0 0 48px rgba(0,255,100,0.3)'
                      : 'none',
                    transform: keyPressed ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              </div>

              {/* Label */}
              <div className="text-center mt-1">
                <span className="text-micro text-textDim">
                  {keyPressed
                    ? willBeDash
                      ? 'DASH — release now'
                      : 'DOT · release now'
                    : 'HOLD key or press SPACE'}
                </span>
              </div>
            </div>

            {/* Transmission indicator */}
            <div className="flex items-center gap-2 mt-4">
              <div
                className="w-2.5 h-2.5 rounded-full transition-all duration-100"
                style={{
                  background: keyPressed ? '#00ff64' : '#374151',
                  boxShadow: keyPressed ? '0 0 8px #00ff64' : 'none',
                }}
              />
              <span className="text-legal text-textDim uppercase tracking-widest">
                {keyPressed ? 'Transmitting' : 'Standby'}
              </span>
            </div>
          </div>

          {/* Secondary controls */}
          <div className="flex gap-2 flex-wrap justify-center">
            <Button onClick={handleCommit} variant="outline" size="sm">
              Commit (Enter)
            </Button>
            <Button onClick={handleWordSpace} variant="outline" size="sm">
              Word Space
            </Button>
            <Button onClick={handleBackspace} variant="ghost" size="sm">
              ⌫ Backspace
            </Button>
            <Button onClick={handleClear} variant="ghost" size="sm">
              Clear All
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {/* Output */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
              <h3 className="text-body-emphasis text-text">Output</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!output) return;
                  navigator.clipboard.writeText(output).then(
                    () => alert('Copied!'),
                    () => alert('Failed to copy'),
                  );
                }}
              >
                Copy
              </Button>
            </div>
            <pre className="p-4 text-body font-mono text-text whitespace-pre-wrap break-all min-h-[56px] bg-input">
              {output || ' '}
            </pre>
          </div>

        </div>
        )}

        {activeTab === 'practice' && (
        <div className="space-y-4">
          {/* ── Practice Mode ── */}
          {/* Row 1: Fetch + Speed + Play */}
              <div className="flex gap-3 flex-wrap items-center">
                <Button onClick={fetchSentence} disabled={isLoadingQuote}>
                  {isLoadingQuote ? 'Loading...' : practiceSentence ? 'New Sentence' : 'Get Sentence'}
                </Button>

                <div className="flex items-center gap-2 ml-2">
                  <span className="text-micro text-textDim uppercase tracking-wider">Speed</span>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={wpm}
                    onChange={(e) => setWpm(Number(e.target.value))}
                    className="w-28 h-1.5 bg-border rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span className="text-control font-mono text-text w-16">{wpm} WPM</span>
                </div>

                {practiceSentence && (
                  <Button
                    onClick={isPlaying ? stopPlayback : playMorseCode}
                    variant={isPlaying ? 'dark' : 'primary'}
                    className="ml-auto"
                  >
                    {isPlaying ? '⏹ Stop' : '▶ Play Morse'}
                  </Button>
                )}
              </div>

              {/* Playing indicator */}
              {isPlaying && (
                <div className="flex items-center gap-2 text-control text-textMuted">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{
                      background: '#00ff64',
                      boxShadow: '0 0 8px #00ff64',
                      animation: 'pulse-dot 0.4s ease-in-out infinite alternate',
                    }}
                  />
                  Transmitting Morse code at {wpm} WPM...
                </div>
              )}

              {/* Quote info */}
              {practiceSentence && (
                <div className="border border-border rounded bg-input px-4 py-3">
                  <span className="text-micro text-textDim uppercase tracking-wider">Quote loaded</span>
                  {showAnswer ? (
                    <div className="mt-1.5">
                      <p className="text-body text-text italic">"{practiceSentence}"</p>
                      {practiceAuthor && (
                        <p className="text-control text-textMuted mt-1">— {practiceAuthor}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-control text-textMuted mt-1">
                      Press <strong>Play Morse</strong> to hear it, then type your translation below
                    </p>
                  )}
                </div>
              )}

              {/* User input */}
              {practiceSentence && (
                <div>
                  <label className="text-micro text-textDim uppercase tracking-wider block mb-1.5">
                    Your translation
                  </label>
                  <textarea
                    value={userTranslation}
                    onChange={(e) => {
                      setUserTranslation(e.target.value);
                      if (practiceResult) {
                        setPracticeResult(null);
                        setShowAnswer(false);
                      }
                    }}
                    placeholder="Type what you hear..."
                    rows={3}
                    className="w-full p-3 border border-border rounded bg-input text-text
                      placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring
                      focus:border-transparent resize-y font-mono text-control transition-colors duration-150"
                  />
                </div>
              )}

              {/* Action buttons */}
              {practiceSentence && (
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={checkAnswer}
                    disabled={!userTranslation.trim()}
                  >
                    Check Answer
                  </Button>
                  <Button onClick={revealAnswer} variant="ghost" size="sm">
                    Reveal
                  </Button>
                  {isPlaying && (
                    <Button onClick={stopPlayback} variant="ghost" size="sm">
                      Stop Playback
                    </Button>
                  )}
                </div>
              )}

              {/* Result */}
              {practiceResult && (
                <div
                  className={`text-control p-3.5 rounded flex items-start gap-3 ${
                    practiceResult === 'correct'
                      ? 'bg-[#00ff64]/10 text-[#00ff64] border border-[#00ff64]/30'
                      : 'bg-errorBg text-error border border-error/30'
                  }`}
                >
                  <span className="text-lg mt-0.5">
                    {practiceResult === 'correct' ? '✓' : '✗'}
                  </span>
                  <div>
                    <strong>
                      {practiceResult === 'correct' ? 'Correct!' : 'Not quite right'}
                    </strong>
                    {practiceResult === 'incorrect' && practiceSentence && (
                      <p className="mt-1">
                        The correct text was: <span className="italic">"{practiceSentence}"</span>
                      </p>
                    )}
                    {practiceResult === 'correct' && (
                      <p className="mt-1 text-textMuted">Great ear! Try another sentence.</p>
                    )}
                  </div>
                </div>
              )}
        </div>
        )}
      </main>

      

      <style jsx>{`
        @keyframes signal-flash {
          0% { transform: scale(0.5); opacity: 0; }
          30% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        @keyframes wave-expand {
          0% { width: 20px; height: 20px; opacity: 0.8; border-width: 3px; }
          100% { width: 160px; height: 160px; opacity: 0; border-width: 1px; }
        }
        @keyframes pulse-dot {
          0% { opacity: 0.4; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
        .wave-ring {
          position: absolute;
          border: 2px solid #00ff64;
          border-radius: 50%;
          animation: wave-expand 0.6s ease-out forwards;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style>
    </div>
  );
}
