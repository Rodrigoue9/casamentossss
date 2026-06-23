"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown, Heart } from "lucide-react";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function HeroVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null); // Foreground blurred flowers
  const layer4Ref = useRef<HTMLDivElement>(null); // Text
  const layer5Ref = useRef<HTMLDivElement>(null); // Decorative frames / icons

  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Set the correct video source based on screen width
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

  // Bind GSAP ScrollTrigger to control video play progress and parallax
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || !videoSrc || !isVideoLoaded) return;

    // Pin the hero section during the video scroll timeline
    const pinTrigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "+=350%", // How long the scroll journey lasts
      pin: true,
      scrub: true,
      anticipatePin: 1,
    });

    // Control video playback based on scroll
    const videoTrigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "+=350%",
      scrub: 0.1, // Smooth scrubbing delay
      onUpdate: (self) => {
        if (video && video.duration) {
          // Calculate current video position based on scroll progress
          const progress = self.progress;
          // Interpolate current time. Keep a small buffer at the end so it doesn't wrap/stutter
          const targetTime = progress * (video.duration - 0.05);
          video.currentTime = Math.max(0, targetTime);
        }
      },
    });

    // Parallax on Layer 1 (Foreground Flowers) - Moves faster upwards
    gsap.fromTo(
      layer1Ref.current,
      { y: 50, scale: 1.1 },
      {
        y: -150,
        scale: 1.25,
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=350%",
          scrub: true,
        },
      }
    );

    // Parallax on Layer 4 (Main Text & Hero Elements) - Fade out and translate slower
    gsap.fromTo(
      layer4Ref.current,
      { opacity: 1, y: 0, scale: 1 },
      {
        opacity: 0,
        y: -80,
        scale: 0.95,
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=120%", // Fades out early in the scroll
          scrub: true,
        },
      }
    );

    // Parallax on Layer 5 (Decorative Border and Scroll indicator) - Quick fade out
    gsap.fromTo(
      layer5Ref.current,
      { opacity: 1 },
      {
        opacity: 0,
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=40%",
          scrub: true,
        },
      }
    );

    return () => {
      pinTrigger.kill();
      videoTrigger.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [videoSrc, isVideoLoaded]);

  const handleMetadataLoaded = () => {
    setIsVideoLoaded(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleConfirmScroll = () => {
    const rsvpSection = document.getElementById("rsvp");
    if (rsvpSection) {
      rsvpSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#0f0b18]"
    >
      {/* Layer 3: Vídeo Principal */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-cover opacity-80"
            preload="auto"
            muted
            playsInline
            onLoadedMetadata={handleMetadataLoaded}
            style={{ filter: "brightness(0.7) contrast(1.05) saturate(0.95)" }}
          />
        )}
        {/* Soft elegant gradient overlay to blend video with background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0b18] via-transparent to-[#0f0b18]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0f0b18]/20 to-[#0f0b18]/60" />
      </div>

      {/* Layer 5: Elementos Decorativos & Frames */}
      <div
        ref={layer5Ref}
        className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-between p-6 md:p-12"
      >
        {/* Top Header Navigation Mock */}
        <div className="w-full flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-light text-[#dfba53]">R|G</span>
          </div>
          {/* Menu items for desktop */}
          <nav className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-medium text-[#eae3f1]/70">
            <a href="#historia" className="hover:text-[#dfba53] transition-colors">História</a>
            <a href="#pedido" className="hover:text-[#dfba53] transition-colors">O Pedido</a>
            <a href="#countdown" className="hover:text-[#dfba53] transition-colors">Contagem</a>
            <a href="#cerimonia" className="hover:text-[#dfba53] transition-colors">Cerimônia</a>
            <a href="#recepcao" className="hover:text-[#dfba53] transition-colors">Recepção</a>
            <a href="#galeria" className="hover:text-[#dfba53] transition-colors">Galeria</a>
            <a href="#presentes" className="hover:text-[#dfba53] transition-colors">Presentes</a>
            <a href="#rsvp" className="hover:text-[#dfba53] transition-colors">Confirmar</a>
          </nav>
          {/* Spacer to balance */}
          <div className="w-10 h-10 hidden lg:block" />
        </div>

        {/* Delicate Golden Frame Border */}
        <div className="absolute inset-4 md:inset-8 border border-[#dfba53]/15 rounded-md pointer-events-none" />

        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-2 text-[#dfba53]/70 animate-bounce">
          <span className="text-[9px] uppercase tracking-[0.3em] font-light">Role para descer</span>
          <ChevronDown size={16} strokeWidth={1.5} />
        </div>
      </div>

      {/* Layer 4: Textos (Rodrigo & Gabrielle) */}
      <div
        ref={layer4Ref}
        className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4"
      >
        <span className="font-serif text-stroke-gold text-5xl md:text-8xl tracking-widest font-extralight opacity-10 select-none absolute transform -translate-y-24">
          RG
        </span>

        <h2 className="font-serif text-5xl md:text-8xl text-white font-light tracking-wide drop-shadow-[0_4px_12px_rgba(15,11,24,0.3)] mb-4">
          Rodrigo <span className="text-[#dfba53] font-serif font-extralight italic">&</span> Gabrielle
        </h2>

        <div className="w-16 h-[1px] bg-[#dfba53]/50 my-4" />

        <p className="font-sans text-xs md:text-sm uppercase tracking-[0.35em] text-[#d4c5e2] font-semibold mb-6">
          Uma história de amor escrita por Deus
        </p>

        <button
          onClick={handleConfirmScroll}
          className="pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-full glassmorphism text-[#dfba53] border border-[#dfba53]/40 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#dfba53] hover:text-[#0f0b18] hover:border-[#dfba53] transition-all duration-500 group shadow-[0_4px_20px_rgba(223,186,83,0.1)]"
        >
          <Heart size={14} className="fill-[#dfba53]/20 group-hover:fill-current transition-all" />
          Confirmar Presença
        </button>
      </div>

      {/* Layer 1: Flores desfocadas em primeiro plano */}
      <div
        ref={layer1Ref}
        className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
      >
        {/* Soft Lavender flower left-bottom */}
        <div 
          className="absolute -left-20 -bottom-20 w-72 h-72 md:w-96 md:h-96 opacity-45 blur-[4px] transform rotate-45 select-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(212,197,226,0.3) 0%, transparent 70%)"
          }}
        >
          {/* Subtle flower shape with CSS */}
          <div className="w-full h-full bg-[radial-gradient(circle,_#d4c5e2_0%,_transparent_50%)] relative opacity-70">
            <div className="absolute inset-0 bg-[radial-gradient(circle,_#7a5c96_0%,_transparent_60%)] transform scale-75" />
          </div>
        </div>

        {/* Soft Lavender flower right-top */}
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 md:w-[450px] md:h-[450px] opacity-40 blur-[5px] transform -rotate-12 select-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(212,197,226,0.25) 0%, transparent 70%)"
          }}
        >
          <div className="w-full h-full bg-[radial-gradient(circle,_#d4c5e2_0%,_transparent_50%)] relative opacity-60">
            <div className="absolute inset-0 bg-[radial-gradient(circle,_#7a5c96_0%,_transparent_60%)] transform scale-75" />
          </div>
        </div>
      </div>
    </div>
  );
}
