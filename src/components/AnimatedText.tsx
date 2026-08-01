'use client';

import { useEffect, useState } from 'react';

type AnimatedTextProps = {
  phrases: string[];
};

export default function AnimatedText({ phrases }: AnimatedTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(phrases[0] ?? '');

  useEffect(() => {
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const run = () => {
      timeoutId = setTimeout(() => {
        if (!active) return;
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
      }, 2500);
    };

    run();
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [currentIndex, phrases.length]);

  useEffect(() => {
    setDisplayText(phrases[currentIndex] ?? '');
  }, [currentIndex, phrases]);

  return (
    <span className="inline-block min-h-[1.2em] transition-all duration-700 ease-out">
      <span className="block animate-[fadeIn_0.7s_ease-out]">{displayText}</span>
    </span>
  );
}
