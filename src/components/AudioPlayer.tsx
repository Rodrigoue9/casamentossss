"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // We try to load local music.mp3 first, or use a gorgeous classical piano cover as a public fallback
    const audio = new Audio("/audio/music.mp3");
    audio.loop = true;
    audioRef.current = audio;

    // If local file fails to load or is not found, we use Claude Debussy's Clair de Lune (beautiful public piano recording)
    audio.onerror = () => {
      if (audioRef.current) {
        audioRef.current.src = "https://upload.wikimedia.org/wikipedia/commons/2/29/Clair_de_Lune_%28Debussy%29.mp3";
      }
    };

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    if (isPlaying) {
      // Fade out volume before pausing
      let vol = audio.volume;
      fadeIntervalRef.current = setInterval(() => {
        if (vol > 0.05) {
          vol -= 0.05;
          audio.volume = vol;
        } else {
          audio.volume = 0;
          audio.pause();
          setIsPlaying(false);
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        }
      }, 30);
    } else {
      // Start silent and fade in volume
      audio.volume = 0;
      audio.play().then(() => {
        setIsPlaying(true);
        let vol = 0;
        fadeIntervalRef.current = setInterval(() => {
          if (vol < 0.45) { // Max volume 0.5 for comfortable background level
            vol += 0.05;
            audio.volume = vol;
          } else {
            audio.volume = 0.5;
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          }
        }, 50);
      }).catch((err) => {
        console.error("Playback blocked or failed:", err);
      });
    }
  };

  return (
    <div className="fixed top-6 right-6 z-40">
      <button
        onClick={togglePlayback}
        className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full glassmorphism flex items-center justify-center text-[#dfba53] hover:text-[#0f0b18] hover:bg-[#dfba53] border border-[#dfba53]/30 transition-all duration-500 shadow-[0_4px_20px_rgba(223,186,83,0.15)] group relative"
        aria-label="Tocar Música"
      >
        {/* Shimmering background effect */}
        {isPlaying && (
          <span className="absolute inset-0 rounded-full border border-[#dfba53] animate-ping opacity-30" />
        )}

        {/* Dynamic Sound Waves Animation */}
        {isPlaying ? (
          <div className="flex items-end gap-[2px] h-3.5">
            <span className="w-[2px] bg-current rounded-sm animate-[pulse_1s_infinite] h-2.5" />
            <span className="w-[2px] bg-current rounded-sm animate-[pulse_0.7s_infinite] h-3.5" />
            <span className="w-[2px] bg-current rounded-sm animate-[pulse_1.2s_infinite] h-1.5" />
            <span className="w-[2px] bg-current rounded-sm animate-[pulse_0.9s_infinite] h-3" />
          </div>
        ) : (
          <Music size={16} strokeWidth={2} className="group-hover:scale-105 transition-transform" />
        )}
      </button>
    </div>
  );
}
