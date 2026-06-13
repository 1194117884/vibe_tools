import React, { useRef, useCallback, useEffect } from 'react';

const REQUIRED_CLICKS = 5;
const RESET_TIMEOUT_MS = 3000;

export default function HiddenTrigger({ children, onActivated }) {
  const countRef = useRef(0);
  const timerRef = useRef(null);

  const reset = useCallback(() => {
    countRef.current = 0;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClick = useCallback(() => {
    countRef.current += 1;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (countRef.current >= REQUIRED_CLICKS) {
      reset();
      onActivated?.();
      return;
    }

    timerRef.current = setTimeout(reset, RESET_TIMEOUT_MS);
  }, [onActivated, reset]);

  return (
    <span
      onClick={handleClick}
      style={{ userSelect: 'none', cursor: 'default' }}
      role="button"
      tabIndex={-1}
    >
      {children}
    </span>
  );
}
