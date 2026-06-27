"use client";

import { useState, useEffect } from "react";
import IntroLoader from "@/components/IntroLoader";
import SmoothScroll from "@/components/SmoothScroll";
import AudioPlayer from "@/components/AudioPlayer";
import CinematicScroll from "@/components/CinematicScroll";
import { Heart } from "lucide-react";

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);
  const [guestName, setGuestName] = useState<string>("");
  const [guestId, setGuestId] = useState<number | null>(null);
  const [guestMaxCompanions, setGuestMaxCompanions] = useState<number>(0);
  const [divineTerm, setDivineTerm] = useState<string>("Jeová");

  // Read guest slug on load to customize page content
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const slug = searchParams.get("p");
    if (slug) {
      fetch(`api/obter_convidado.php?slug=${encodeURIComponent(slug)}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setGuestName(res.data.nome);
            setGuestId(res.data.id);
            setGuestMaxCompanions(parseInt(res.data.acompanhantes_max) || 0);
            setDivineTerm(res.data.tratamento || "Jeová");
          }
        })
        .catch((err) => console.error("Erro ao carregar convidado:", err));
    }
  }, []);

  return (
    <>
      {/* Intro Loading Screen */}
      <IntroLoader divineTerm={divineTerm} onComplete={() => setShowLoader(false)} />

      {/* Main Website Content (Hidden/Opacity-0 until loader finishes) */}
      <div className={`transition-opacity duration-1000 ${showLoader ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        {!showLoader && (
          <>
            {/* Smooth Scroll Engine */}
            <SmoothScroll />

            {/* Audio Button */}
            <AudioPlayer />

            <main className="min-h-screen bg-[#0f0b18] text-[#fdfcf7] relative">
              {/* Pinned Cinematic Pager hosting all content inside the video */}
              <CinematicScroll 
                guestName={guestName}
                guestId={guestId}
                guestMaxCompanions={guestMaxCompanions}
                divineTerm={divineTerm}
              />
            </main>

            {/* Elegant Footer */}
            <footer className="w-full py-16 bg-[#0b0812] border-t border-[#dfba53]/10 flex flex-col items-center justify-center text-center px-6 relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="font-serif text-3xl font-light text-[#dfba53]">R</span>
                <Heart size={16} className="text-[#dfba53] fill-[#dfba53]/30" />
                <span className="font-serif text-3xl font-light text-[#dfba53]">G</span>
              </div>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-[#d4c5e2]/60 font-medium max-w-sm mb-4 leading-relaxed">
                Rodrigo & Gabrielle
              </p>
              <p className="text-[9px] text-[#d4c5e2]/40 tracking-wider">
                © {new Date().getFullYear()} — Feito com amor para o dia mais especial de nossas vidas.
              </p>
            </footer>
          </>
        )}
      </div>
    </>
  );
}
