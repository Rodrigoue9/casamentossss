"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntroLoader({ onComplete }: { onComplete: () => void }) {
  const [isDone, setIsDone] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Check if the user is a returning visitor in this session
    const isReturning = typeof window !== "undefined" && sessionStorage.getItem("intro_shown") === "true";
    const delay = isReturning ? 1000 : 4500;

    const timer = setTimeout(() => {
      setIsDone(true);
      setTimeout(onComplete, 1000); // Allow fade-out animation to complete
    }, delay);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("intro_shown", "true");
    }

    // Generate random positions for background shimmering particles safely on the client
    const generated = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
      driftX: Math.random() * 4 - 2,
    }));
    setParticles(generated);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fcfbfa] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ffffff] via-[#faf8f5] to-[#f2ece2] overflow-hidden"
        >
          {/* Subtle elegant silk texture or background overlay */}
          <div className="absolute inset-0 bg-cover opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('/images/ChatGPT Image 22 de jun. de 2026, 21_03_21.png')" }} />

          {/* Shimmering particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: p.y + 10 }}
              animate={{
                opacity: [0, 0.7, 0],
                y: [p.y + 10, p.y - 10],
                x: [p.x, p.x + p.driftX],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: "#dfba53",
                borderRadius: "50%",
                boxShadow: "0 0 8px rgba(223, 186, 83, 0.6)",
              }}
            />
          ))}

          {/* Monogram drawing container */}
          <div className="relative flex flex-col items-center text-center px-4 max-w-md">
            
            {/* SVG Crest & Floral branch drawing */}
            <svg
              width="180"
              height="180"
              viewBox="0 0 100 100"
              className="mb-8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer delicate circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="#dfba53"
                strokeWidth="0.75"
                strokeDasharray="250"
                initial={{ strokeDashoffset: 250, opacity: 0 }}
                animate={{ strokeDashoffset: 0, opacity: 0.4 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />

              {/* Monogram R | G */}
              {/* R Outline path */}
              <motion.path
                d="M 37 38 L 37 62 M 37 38 L 47 38 C 52 38 52 48 47 48 L 37 48 M 45 48 L 51 62"
                stroke="#dfba53"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
              />

              {/* Vertical elegant separator */}
              <motion.line
                x1="50"
                y1="32"
                x2="50"
                y2="68"
                stroke="#dfba53"
                strokeWidth="0.5"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 0.5 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.6 }}
              />

              {/* G Outline path */}
              <motion.path
                d="M 63 43 C 60 37 54 37 53 43 L 53 57 C 54 63 60 63 63 57 L 63 50 L 58 50"
                stroke="#dfba53"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
              />

              {/* Floral Branch Motif underneath */}
              <motion.path
                d="M 28 69 C 35 74, 65 74, 72 69 C 68 76, 32 76, 28 69 Z"
                fill="#dfba53"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.15, scale: 1 }}
                transition={{ duration: 1.5, delay: 1.5 }}
              />
              <motion.path
                d="M 36 71 C 40 73, 44 71, 48 70 M 52 70 C 56 71, 60 73, 64 71"
                stroke="#dfba53"
                strokeWidth="0.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1.8 }}
              />
            </svg>

            {/* Names & Subtitle Reveal */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 1.5 }}
              className="font-serif text-3xl md:text-4xl text-[#392850] tracking-wide font-light mb-3"
            >
              Rodrigo <span className="text-[#dfba53]">&</span> Gabrielle
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1.5, delay: 2.2 }}
              className="w-12 h-[1px] bg-[#dfba53] my-3"
            />

            <motion.p
              initial={{ opacity: 0, letterSpacing: "1px" }}
              animate={{ opacity: 0.7, letterSpacing: "4px" }}
              transition={{ duration: 2, ease: "easeOut", delay: 2.5 }}
              className="font-sans text-[10px] md:text-xs uppercase text-[#7a5c96] font-medium tracking-[0.25em]"
            >
              Uma história de amor escrita por Deus
            </motion.p>
          </div>

          {/* Golden outline decorative frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="absolute inset-8 border border-[#dfba53] pointer-events-none rounded-sm"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
