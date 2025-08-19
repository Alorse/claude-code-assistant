import React, { useEffect, useMemo, useRef, useState } from "react";
import { CLAUDE_CODE_COLOR, LOADING_VERBS } from "../utils/constants";

interface LoadingVerbProps {
  running: boolean;
  verb?: string; // fixed verb to show
}

const ANIMATION_INTERVAL_MS = 90;
const PREFIX_CHARS = ["·", "✢", "*", "✶", "✻", "✽"];

export const pickVerb = () =>
  LOADING_VERBS[Math.floor(Math.random() * LOADING_VERBS.length)];

const LoadingVerb: React.FC<LoadingVerbProps> = ({
  running,
  verb: fixedVerb,
}) => {
  const [verb, setVerb] = useState<string>(fixedVerb || pickVerb());
  const [highlightIndex, setHighlightIndex] = useState<number>(0);
  const indexRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // Cycle the highlight across the letters
  useEffect(() => {
    if (!running) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      setHighlightIndex(0);
      return;
    }

    // Initialize verb once per run
    setVerb(fixedVerb || pickVerb());
    indexRef.current = 0;
    setHighlightIndex(0);

    timerRef.current = window.setInterval(() => {
      const basis = (fixedVerb || verb).length + 3;
      indexRef.current = (indexRef.current + 1) % basis; // include trailing dots span
      setHighlightIndex(indexRef.current);
    }, ANIMATION_INTERVAL_MS) as unknown as number;

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [running, fixedVerb]);

  const letters = useMemo(() => verb.split("").concat([".", ".", "."]), [verb]);

  return (
    <div className="text-xs" style={{ color: CLAUDE_CODE_COLOR }}>
      {/* rotating single prefix symbol with fixed width to avoid layout shift */}
      <span
        style={{
          display: "inline-block",
          width: "1.2em",
          textAlign: "center",
          marginRight: 6,
        }}
      >
        {PREFIX_CHARS[highlightIndex % PREFIX_CHARS.length]}
      </span>
      {letters.map((ch, i) => {
        const isHighlight = running && i === highlightIndex;
        return (
          <span
            key={`${ch}-${i}`}
            style={{
              color: CLAUDE_CODE_COLOR,
              fontWeight: isHighlight ? 700 : 500,
              filter: isHighlight ? "brightness(1.35)" : "none",
              transition: "filter 80ms linear, font-weight 80ms linear",
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

export default LoadingVerb;
