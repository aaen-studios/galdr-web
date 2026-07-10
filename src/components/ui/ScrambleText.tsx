"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛝᛟᛞ";

/** Slower, more deliberate scramble — 1.2s total for the grimoire feel */
const REVEAL_DURATION = 1200;

interface Props {
  text: string;
  as?: "span" | "div" | "h1" | "h2" | "h3" | "p" | "button";
  className?: string;
  hover?: boolean;
  load?: boolean;
  trigger?: boolean;
  ticks?: number;
  onClick?: () => void;
}

function randomRune(): string {
  return RUNES[Math.floor(Math.random() * RUNES.length)];
}

function shuffle(target: string, factor: number): string {
  let out = "";
  for (let i = 0; i < target.length; i++) {
    if (target[i] === " ") {
      out += " ";
    } else if (Math.random() < factor) {
      out += randomRune();
    } else {
      out += target[i];
    }
  }
  return out;
}

export default function ScrambleText({
  text,
  as: Tag = "span",
  className,
  hover = false,
  load = false,
  trigger,
  ticks = 10,
  onClick,
}: Props) {
  const [display, setDisplay] = useState(text);
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const prevTrigger = useRef(false);

  const run = useCallback(() => {
    setActive(true);
    let step = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      step++;
      const factor = Math.max(0, 1 - step / ticks);
      setDisplay(shuffle(text, factor));
      if (step >= ticks) {
        clearInterval(timerRef.current);
        setDisplay(text);
        setActive(false);
      }
    }, REVEAL_DURATION / ticks);
  }, [text, ticks]);

  useEffect(() => {
    if (load) run();
  }, [load, run]);

  useEffect(() => {
    if (trigger && trigger !== prevTrigger.current) {
      prevTrigger.current = trigger;
      run();
    }
  }, [trigger, run]);

  useEffect(() => {
    if (!active) setDisplay(text);
  }, [text, active]);

  return (
    <Tag
      className={className}
      onClick={onClick}
      onMouseEnter={hover && !active ? run : undefined}
      onMouseLeave={
        hover
          ? () => {
              setDisplay(text);
              setActive(false);
              clearInterval(timerRef.current);
            }
          : undefined
      }
    >
      {display}
    </Tag>
  );
}
