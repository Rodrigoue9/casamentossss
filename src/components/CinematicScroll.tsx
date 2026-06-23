"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { Calendar, Clock, MapPin, ExternalLink, Heart, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Countdown from "./Countdown";
import GiftList from "./GiftList";
import RsvpForm from "./RsvpForm";

gsap.registerPlugin(ScrollTrigger);

export default function CinematicScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef(0);
  
  // Section refs for GSAP timeline control
  const heroRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const proposalRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const ceremonyRef = useRef<HTMLDivElement>(null);
  const receptionRef = useRef<HTMLDivElement>(null);
  const giftsRef = useRef<HTMLDivElement>(null);
  const rsvpRef = useRef<HTMLDivElement>(null);
  
  // SVG gold line path
  const lineRef = useRef<SVGPathElement>(null);

  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Address variables
  const ceremonyAddress = "Catedral Basílica de Salvador - Largo do Terreiro de Jesus, Centro Histórico, Salvador - BA";
  const receptionAddress = "Cerimonial Villa Cancione - Caminho das Árvores, Salvador - BA";

  const handleOpenMap = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
  };

  // Determine correct video source based on viewport size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const newSrc = isMobile
        ? "/videos/Cena_inicial_Celular.mp4"
        : "/videos/Cena_inicial_Pc.mp4";
      
      if (videoSrc !== newSrc) {
        setVideoSrc(newSrc);
        setIsVideoLoaded(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [videoSrc]);

  // Force load, event binding, and mobile unlock for the video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    setIsVideoLoaded(false);

    const onLoaded = () => {
      setIsVideoLoaded(true);
      video.currentTime = 0;
    };

    // If metadata is already loaded (from cache or fast load)
    if (video.readyState >= 1) {
      onLoaded();
    }

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("loadeddata", onLoaded);
    video.load();

    // Critical iOS Safari unlock: warming up the video on first touch/click
    const unlockVideo = () => {
      video.play().then(() => {
        video.pause();
      }).catch(err => console.log("Video unlock failed:", err));
      window.removeEventListener("touchstart", unlockVideo);
      window.removeEventListener("click", unlockVideo);
    };
    window.addEventListener("touchstart", unlockVideo);
    window.addEventListener("click", unlockVideo);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("loadeddata", onLoaded);
      window.removeEventListener("touchstart", unlockVideo);
      window.removeEventListener("click", unlockVideo);
    };
  }, [videoSrc]);

  // Master GSAP ScrollTrigger timeline configuration
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || !videoSrc || !isVideoLoaded) return;
    if (isNaN(video.duration) || video.duration === 0) return;

    // Reset defaults for all panels
    gsap.set([
      historyRef.current,
      proposalRef.current,
      countdownRef.current,
      ceremonyRef.current,
      receptionRef.current,
      giftsRef.current,
      rsvpRef.current
    ], { opacity: 0, y: 50, pointerEvents: "none" });

    // Single unified ScrollTrigger timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=2300%", // Adjusted scroll distance for 1 less section
        pin: true,
        scrub: 3.2, // Smoother damping
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });

    // 1. Scrub virtual time instead of setting video currentTime directly to prevent decoder lag
    const videoScrubber = { time: 0 };
    tl.to(videoScrubber, {
      time: video.duration - 0.05,
      ease: "none",
      duration: 60, // Refitted virtual timeline length
      onUpdate: () => {
        targetTimeRef.current = videoScrubber.time;
      }
    }, 0);

    // 2. Sequence overlays animations using precise virtual timeline times
    // Step 0: Hero Panel fades out
    tl.to(heroRef.current, { opacity: 0, y: -50, pointerEvents: "none", duration: 2 }, 0.5);
      
    // Step 1: Nossa História fades in, stays, then fades out
    tl.to(historyRef.current, { opacity: 1, y: 0, pointerEvents: "auto", duration: 2 }, 4.5)
      .to(historyRef.current, { opacity: 0, y: -50, pointerEvents: "none", duration: 2 }, 9.5);
      
    // Step 2: O Pedido fades in, line draws, then fades out
    tl.to(proposalRef.current, { opacity: 1, y: 0, pointerEvents: "auto", duration: 2 }, 12.5)
      .fromTo(lineRef.current, { strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 2 }, 13.5)
      .to(proposalRef.current, { opacity: 0, y: -50, pointerEvents: "none", duration: 2 }, 18.5);
      
    // Step 3: Countdown fades in, stays, then fades out
    tl.to(countdownRef.current, { opacity: 1, y: 0, pointerEvents: "auto", duration: 2 }, 21.5)
      .to(countdownRef.current, { opacity: 0, y: -50, pointerEvents: "none", duration: 2 }, 26.5);
      
    // Step 4: Cerimônia card fades in, stays, then fades out
    tl.to(ceremonyRef.current, { opacity: 1, y: 0, pointerEvents: "auto", duration: 2 }, 29.5)
      .to(ceremonyRef.current, { opacity: 0, y: -50, pointerEvents: "none", duration: 2 }, 34.5);
      
    // Step 5: Recepção card fades in, stays, then fades out
    tl.to(receptionRef.current, { opacity: 1, y: 0, pointerEvents: "auto", duration: 2 }, 37.5)
      .to(receptionRef.current, { opacity: 0, y: -50, pointerEvents: "none", duration: 2 }, 42.5);
      
    // Step 6: Lista de Presentes fades in, stays, then fades out
    tl.to(giftsRef.current, { opacity: 1, y: 0, pointerEvents: "auto", duration: 2 }, 45.5)
      .to(giftsRef.current, { opacity: 0, y: -50, pointerEvents: "none", duration: 2 }, 50.5);
      
    // Step 7: RSVP Form fades in and stays interactive
    tl.to(rsvpRef.current, { opacity: 1, y: 0, pointerEvents: "auto", duration: 2 }, 53.5);

    // Seek-throttling requestAnimationFrame loop to ensure buttery-smooth scrubbing
    let rafId: number;
    let lastUpdate = 0;
    const throttleMs = 40; // Approx 25 FPS update rate for mobile seeking

    const updateVideo = (now: number) => {
      const vid = videoRef.current;
      if (vid && !isNaN(vid.duration)) {
        const diff = targetTimeRef.current - vid.currentTime;
        if (Math.abs(diff) > 0.01) {
          const isMobile = window.innerWidth < 768;
          if (isMobile) {
            // Mobile: throttle seek rate to prevent UI lag
            if (!vid.seeking && (now - lastUpdate > throttleMs)) {
              vid.currentTime = targetTimeRef.current;
              lastUpdate = now;
            }
          } else {
            // Desktop: no throttle, just avoid seeker overlap
            if (!vid.seeking) {
              vid.currentTime = targetTimeRef.current;
            }
          }
        }
      }
      rafId = requestAnimationFrame(updateVideo);
    };
    rafId = requestAnimationFrame(updateVideo);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
      cancelAnimationFrame(rafId);
    };
  }, [videoSrc, isVideoLoaded]);

  const handleMetadataLoaded = () => {
    setIsVideoLoaded(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleNavigateToRsvp = () => {
    // Scroll directly to the bottom of the scroll container to reveal RSVP using Lenis
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo("bottom", { duration: 2 });
    } else {
      const scrollHeight = document.documentElement.scrollHeight;
      window.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#0f0b18]"
    >
      {/* 1. FIXED BACKGROUND VIDEO */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? "opacity-75" : "opacity-0"}`}
            preload="auto"
            muted
            playsInline
            onLoadedMetadata={handleMetadataLoaded}
            style={{ filter: "brightness(0.65) contrast(1.05) saturate(0.9)" }}
          />
        )}
        {/* Soft elegant gradient overlays to wrap the screen */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0b18]/50 via-transparent to-[#0f0b18]/65" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_#0f0b18/75%)]" />
      </div>

      {/* 2. PERSISTENT INTERFACE ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-between p-6 md:p-8">
        {/* Monogram logo top-left */}
        <div className="w-full flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="font-serif text-2xl font-light text-[#dfba53]">R|G</span>
          </div>
          {/* Subtle scroll progress indicators or helper menu */}
          <div className="text-[9px] uppercase tracking-[0.25em] font-medium text-[#eae3f1]/40">
            Rodrigo & Gabrielle
          </div>
        </div>

        {/* Outer luxurious frame */}
        <div className="absolute inset-4 md:inset-6 border border-[#dfba53]/10 rounded-sm pointer-events-none" />

        {/* Role down indicator (Bottom) */}
        <div className="flex flex-col items-center gap-1.5 text-[#dfba53]/60 animate-pulse">
          <span className="text-[8px] uppercase tracking-[0.3em] font-light">Desça para vivenciar a história</span>
          <ChevronDown size={14} strokeWidth={1.5} />
        </div>
      </div>

      {/* 3. SCROLLING OVERLAYS (All centered, stacked absolutely) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        
        {/* STEP 0: HERO SECTION */}
        <div
          ref={heroRef}
          className="gpu-accelerated absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-auto"
        >
          <span className="font-serif text-stroke-gold text-6xl md:text-[10rem] tracking-widest font-extralight opacity-10 select-none absolute transform -translate-y-20">
            RG
          </span>
          <h2 className="font-serif text-4xl md:text-7xl text-white font-light tracking-wide drop-shadow-[0_4px_12px_rgba(15,11,24,0.4)] mb-4">
            Rodrigo <span className="text-[#dfba53] font-serif font-extralight italic">&</span> Gabrielle
          </h2>
          <div className="w-12 h-[1px] bg-[#dfba53]/50 my-3" />
          <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#d4c5e2] font-semibold mb-6">
            Uma história de amor escrita por Deus
          </p>
          <button
            onClick={handleNavigateToRsvp}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full glassmorphism text-[#dfba53] border border-[#dfba53]/40 text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#dfba53] hover:text-[#0f0b18] transition-all duration-500 group pointer-events-auto cursor-pointer"
          >
            <Heart size={12} className="fill-[#dfba53]/10 group-hover:fill-current" />
            Confirmar Presença
          </button>
        </div>

        {/* STEP 1: NOSSA HISTÓRIA */}
        <div
          ref={historyRef}
          className="gpu-accelerated absolute max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 md:gap-16 items-center px-6 sm:px-8"
        >
          {/* Frame Image */}
          <div className="relative flex justify-center order-2 md:order-1">
            <div className="relative p-2 bg-gradient-to-tr from-[#dfba53]/40 via-[#eae3f1]/10 to-[#dfba53]/40 rounded-sm shadow-[0_8px_30px_rgba(15,11,24,0.6)]">
              <div className="relative w-[150px] h-[190px] sm:w-[220px] sm:h-[280px] md:w-[280px] md:h-[360px] overflow-hidden rounded-sm bg-[#191127]">
                <Image
                  src="/images/ChatGPT Image 22 de jun. de 2026, 21_03_21.png"
                  alt="Nossa História"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 150px, (max-width: 768px) 220px, 280px"
                  priority
                />
              </div>
              <div className="absolute top-0.5 left-0.5 w-3 h-3 border-t border-l border-[#dfba53]/80" />
              <div className="absolute top-0.5 right-0.5 w-3 h-3 border-t border-r border-[#dfba53]/80" />
              <div className="absolute bottom-0.5 left-0.5 w-3 h-3 border-b border-l border-[#dfba53]/80" />
              <div className="absolute bottom-0.5 right-0.5 w-3 h-3 border-b border-r border-[#dfba53]/80" />
            </div>
          </div>
          {/* Narrativa */}
          <div className="flex flex-col gap-4 text-left order-1 md:order-2">
            <span className="text-[#dfba53] text-[10px] uppercase tracking-[0.25em] font-semibold">01 . A Caminhada</span>
            <h3 className="font-serif text-3xl md:text-4xl text-white font-light">Nossa História</h3>
            <div className="w-10 h-[1px] bg-[#dfba53] my-1" />
            <p className="font-sans text-xs md:text-sm leading-relaxed text-[#d4c5e2]/85 max-w-md">
              Tudo começou de uma forma simples, mas com o tempo percebemos que nada na nossa caminhada foi por acaso. Cada risada compartilhada, cada conversa de madrugada e cada obstáculo vencido nos mostrou que fomos feitos um para o outro. Nosso amor cresceu sob o olhar de Deus, fortalecendo nossa amizade e o sonho de uma vida inteira juntos.
            </p>
          </div>
        </div>

        {/* STEP 2: O PEDIDO */}
        <div
          ref={proposalRef}
          className="gpu-accelerated absolute max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 md:gap-16 items-center px-6 sm:px-8"
        >
          {/* Narrativa */}
          <div className="flex flex-col gap-4 text-left">
            <span className="text-[#dfba53] text-[10px] uppercase tracking-[0.25em] font-semibold">02 . O Grande Passo</span>
            <h3 className="font-serif text-3xl md:text-4xl text-white font-light">O Pedido</h3>
            <div className="w-10 h-[1px] bg-[#dfba53] my-1" />
            <p className="font-sans text-xs md:text-sm leading-relaxed text-[#d4c5e2]/85 max-w-md">
              Embaixo de um céu estrelado, com a certeza de que Deus havia preparado aquele exato segundo, veio a pergunta mais importante de nossas vidas. A resposta fluiu com lágrimas de alegria e um sorriso inesquecível.
            </p>
            {/* SVG line and "Ela disse sim" */}
            <div className="relative mt-2 flex flex-col gap-2">
              <svg width="240" height="24" viewBox="0 0 240 24" fill="none" className="opacity-60">
                <motion.path
                  ref={lineRef}
                  d="M 0 12 C 40 24, 80 0, 120 12 C 160 24, 200 0, 240 12"
                  stroke="#dfba53"
                  strokeWidth="1"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                />
              </svg>
              <span className="font-serif text-xl md:text-2xl text-[#dfba53] italic font-light tracking-wide">
                “Ela disse sim.”
              </span>
            </div>
          </div>
          {/* Frame Image */}
          <div className="relative flex justify-center">
            <div className="relative p-2 bg-gradient-to-tr from-[#eae3f1]/10 via-[#dfba53]/40 to-[#eae3f1]/10 rounded-sm shadow-[0_8px_30px_rgba(15,11,24,0.6)]">
              <div className="relative w-[150px] h-[190px] sm:w-[220px] sm:h-[280px] md:w-[280px] md:h-[360px] overflow-hidden rounded-sm bg-[#191127]">
                <Image
                  src="/images/ChatGPT Image 22 de jun. de 2026, 21_03_28.png"
                  alt="O Pedido"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 150px, (max-width: 768px) 220px, 280px"
                  priority
                />
              </div>
              <div className="absolute top-0.5 left-0.5 w-3 h-3 border-t border-l border-[#dfba53]/80" />
              <div className="absolute top-0.5 right-0.5 w-3 h-3 border-t border-r border-[#dfba53]/80" />
              <div className="absolute bottom-0.5 left-0.5 w-3 h-3 border-b border-l border-[#dfba53]/80" />
              <div className="absolute bottom-0.5 right-0.5 w-3 h-3 border-b border-r border-[#dfba53]/80" />
            </div>
          </div>
        </div>

        {/* STEP 3: CONTAGEM REGRESSIVA */}
        <div ref={countdownRef} className="gpu-accelerated absolute inset-0 w-full flex items-center justify-center">
          <Countdown />
        </div>

        {/* STEP 4: CERIMÔNIA */}
        <div ref={ceremonyRef} className="gpu-accelerated absolute inset-0 flex items-center justify-center px-6">
          <div className="glassmorphism rounded-3xl p-5 sm:p-8 md:p-10 flex flex-col items-center justify-between text-center relative max-w-md w-full border border-[#dfba53]/20 shadow-[0_12px_40px_rgba(15,11,24,0.5)]">
            <span className="text-[#dfba53] text-[9px] uppercase tracking-[0.25em] font-semibold block mb-1">04 . A União</span>
            <h3 className="font-serif text-2xl md:text-3xl text-white font-light mb-4 tracking-wide">A Cerimônia</h3>
            <div className="w-8 h-[1px] bg-[#dfba53]/40 mx-auto mb-6" />
            
            <div className="flex flex-col gap-5 text-left w-full text-[#eae3f1]/90 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[#dfba53]/15 text-[#dfba53] mt-0.5"><Calendar size={15} /></div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 font-semibold block">Data</span>
                  <span className="font-serif text-sm text-white tracking-wide">Domingo, 13 de Setembro de 2026</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[#dfba53]/15 text-[#dfba53] mt-0.5"><Clock size={15} /></div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 font-semibold block">Horário</span>
                  <span className="font-serif text-sm text-white tracking-wide">Às 17:00 Horas</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[#dfba53]/15 text-[#dfba53] mt-0.5"><MapPin size={15} /></div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 font-semibold block">Local</span>
                  <span className="font-serif text-sm text-white tracking-wide">Catedral Basílica de Salvador</span>
                  <p className="text-[11px] text-[#eae3f1]/65 mt-0.5 leading-relaxed">{ceremonyAddress}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleOpenMap(ceremonyAddress)}
              className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-[#dfba53]/5 border border-[#dfba53]/30 text-[#dfba53] text-[9px] uppercase tracking-[0.2em] font-medium hover:bg-[#dfba53] hover:text-[#0f0b18] transition-all duration-300 pointer-events-auto"
            >
              Ver no Mapa <ExternalLink size={10} />
            </button>
          </div>
        </div>

        {/* STEP 5: RECEPÇÃO */}
        <div ref={receptionRef} className="gpu-accelerated absolute inset-0 flex items-center justify-center px-6">
          <div className="glassmorphism rounded-3xl p-5 sm:p-8 md:p-10 flex flex-col items-center justify-between text-center relative max-w-md w-full border border-[#dfba53]/20 shadow-[0_12px_40px_rgba(15,11,24,0.5)]">
            <span className="text-[#dfba53] text-[9px] uppercase tracking-[0.25em] font-semibold block mb-1">05 . A Celebração</span>
            <h3 className="font-serif text-2xl md:text-3xl text-white font-light mb-4 tracking-wide">A Recepção</h3>
            <div className="w-8 h-[1px] bg-[#dfba53]/40 mx-auto mb-6" />

            <div className="flex flex-col gap-5 text-left w-full text-[#eae3f1]/90 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[#dfba53]/15 text-[#dfba53] mt-0.5"><Calendar size={15} /></div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 font-semibold block">Data</span>
                  <span className="font-serif text-sm text-white tracking-wide">Domingo, 13 de Setembro de 2026</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[#dfba53]/15 text-[#dfba53] mt-0.5"><Clock size={15} /></div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 font-semibold block">Horário</span>
                  <span className="font-serif text-sm text-white tracking-wide">Logo após a cerimônia</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[#dfba53]/15 text-[#dfba53] mt-0.5"><MapPin size={15} /></div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 font-semibold block">Local</span>
                  <span className="font-serif text-sm text-white tracking-wide">Cerimonial Villa Cancione</span>
                  <p className="text-[11px] text-[#eae3f1]/65 mt-0.5 leading-relaxed">{receptionAddress}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleOpenMap(receptionAddress)}
              className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-[#dfba53]/5 border border-[#dfba53]/30 text-[#dfba53] text-[9px] uppercase tracking-[0.2em] font-medium hover:bg-[#dfba53] hover:text-[#0f0b18] transition-all duration-300 pointer-events-auto"
            >
              Ver no Mapa <ExternalLink size={10} />
            </button>
          </div>
        </div>

        {/* STEP 6: LISTA DE PRESENTES */}
        <div ref={giftsRef} className="gpu-accelerated absolute inset-0 w-full flex items-center justify-center">
          <GiftList />
        </div>

        {/* STEP 7: RSVP FORM */}
        <div ref={rsvpRef} className="gpu-accelerated absolute inset-0 w-full flex items-center justify-center">
          <RsvpForm />
        </div>

      </div>
    </div>
  );
}
