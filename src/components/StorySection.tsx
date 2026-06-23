"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function StorySection() {
  const historyRef = useRef<HTMLDivElement>(null);
  const proposalRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);

  const isHistoryInView = useInView(historyRef, { once: false, amount: 0.2 });
  const isProposalInView = useInView(proposalRef, { once: false, amount: 0.3 });

  // Animating the Gold Line on scroll
  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;

    const anim = gsap.fromTo(
      line,
      { strokeDashoffset: 1000 },
      {
        strokeDashoffset: 0,
        scrollTrigger: {
          trigger: proposalRef.current,
          start: "top 60%",
          end: "bottom 80%",
          scrub: 1.5,
        },
      }
    );

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  // Text letter-by-letter animation variants
  const wordVariants = {
    hidden: { opacity: 0, filter: "blur(4px)", y: 10 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const storyParagraph = 
    "Tudo começou de uma forma simples, mas com o tempo percebemos que nada na nossa caminhada foi por acaso. Cada risada compartilhada, cada conversa de madrugada e cada obstáculo vencido nos mostrou que fomos feitos um para o outro. Nosso amor cresceu sob o olhar de Deus, fortalecendo nossa amizade e alimentando o sonho de compartilharmos a vida inteira lado a lado.";

  return (
    <section className="relative w-full bg-[#0f0b18] py-24 md:py-40 overflow-hidden flex flex-col gap-32 md:gap-48 px-6">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_70%_30%,_#7a5c96_0%,_transparent_55%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(circle_at_20%_80%,_#dfba53_0%,_transparent_45%)]" />

      {/* SECTION 1: NOSSA HISTÓRIA */}
      <div
        id="historia"
        ref={historyRef}
        className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10"
      >
        {/* Left Column: Image in elegant frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={isHistoryInView ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative flex justify-center"
        >
          {/* Elegant frame container */}
          <div className="relative p-3 bg-gradient-to-tr from-[#dfba53]/40 via-[#eae3f1]/20 to-[#dfba53]/40 rounded-sm shadow-[0_12px_40px_rgba(15,11,24,0.6)] group">
            {/* Inner gold border */}
            <div className="absolute inset-4 border border-[#dfba53]/30 pointer-events-none z-10" />
            
            {/* The Image */}
            <div className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] overflow-hidden rounded-sm bg-[#191127]">
              <Image
                src="/images/ChatGPT Image 22 de jun. de 2026, 21_03_21.png"
                alt="Rodrigo & Gabrielle"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-w-768px) 300px, 400px"
              />
              <div className="absolute inset-0 bg-[#0f0b18]/20 mix-blend-overlay" />
            </div>

            {/* Corner gold brackets */}
            <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-[#dfba53]/70" />
            <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-[#dfba53]/70" />
            <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-[#dfba53]/70" />
            <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-[#dfba53]/70" />
          </div>
        </motion.div>

        {/* Right Column: Narrative Texts */}
        <div className="flex flex-col gap-6 text-left">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isHistoryInView ? { opacity: 0.6, y: 0 } : {}}
            transition={{ duration: 1 }}
            className="text-[#dfba53] text-xs uppercase tracking-[0.3em] font-semibold"
          >
            01 . A Caminhada
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={isHistoryInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="font-serif text-4xl md:text-5xl text-white font-light tracking-wide"
          >
            Nossa História
          </motion.h2>

          <div className="w-12 h-[1px] bg-[#dfba53] my-2" />

          {/* Letter/Word by letter reveal effect */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isHistoryInView ? "visible" : "hidden"}
            className="flex flex-wrap font-sans text-sm md:text-base leading-relaxed text-[#d4c5e2]/80 gap-x-1.5 gap-y-1"
          >
            {storyParagraph.split(" ").map((word, index) => (
              <motion.span key={index} variants={wordVariants}>
                {word}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* SECTION 2: O PEDIDO */}
      <div
        id="pedido"
        ref={proposalRef}
        className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10"
      >
        {/* Left Column: Narrative Texts */}
        <div className="flex flex-col gap-6 text-left order-2 lg:order-1">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isProposalInView ? { opacity: 0.6, y: 0 } : {}}
            transition={{ duration: 1 }}
            className="text-[#dfba53] text-xs uppercase tracking-[0.3em] font-semibold"
          >
            02 . O Grande Passo
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={isProposalInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="font-serif text-4xl md:text-5xl text-white font-light tracking-wide"
          >
            O Pedido de Casamento
          </motion.h2>

          <div className="w-12 h-[1px] bg-[#dfba53] my-2" />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isProposalInView ? { opacity: 0.8, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="font-sans text-sm md:text-base leading-relaxed text-[#d4c5e2]/80"
          >
            Embaixo de um céu estrelado, com o coração acelerado e a certeza de que Deus havia preparado aquele exato segundo, veio a pergunta mais importante de nossas vidas. A resposta fluiu com lágrimas de alegria e um sorriso inesquecível.
          </motion.p>

          {/* Animated Draw-in Golden Line & "Ela disse sim" Text */}
          <div className="relative mt-4 pt-4 flex flex-col gap-4">
            <svg
              width="100%"
              height="40"
              viewBox="0 0 300 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-70"
            >
              <motion.path
                ref={lineRef}
                d="M 0 20 C 50 40, 100 0, 150 20 C 200 40, 250 0, 300 20"
                stroke="url(#goldGradient)"
                strokeWidth="1.5"
                strokeDasharray="1000"
                strokeDashoffset="1000"
              />
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#b89127" />
                  <stop offset="50%" stopColor="#dfba53" />
                  <stop offset="100%" stopColor="#b89127" />
                </linearGradient>
              </defs>
            </svg>

            <motion.h3
              initial={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
              animate={isProposalInView ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
              transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
              className="font-serif text-3xl md:text-4xl text-[#dfba53] italic font-light tracking-wide"
            >
              “Ela disse sim.”
            </motion.h3>
          </div>
        </div>

        {/* Right Column: Image in elegant frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={isProposalInView ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative flex justify-center order-1 lg:order-2"
        >
          {/* Side emerging flowers (decorations) */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotate: 10 }}
            animate={isProposalInView ? { opacity: 0.35, x: 20, rotate: 0 } : {}}
            transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
            className="absolute -right-12 top-10 w-24 h-48 bg-[radial-gradient(circle,_#d4c5e2_0%,_transparent_60%)] blur-[2px] pointer-events-none z-10"
          />

          <div className="relative p-3 bg-gradient-to-tr from-[#eae3f1]/20 via-[#dfba53]/40 to-[#eae3f1]/20 rounded-sm shadow-[0_12px_40px_rgba(15,11,24,0.6)] group">
            <div className="absolute inset-4 border border-[#dfba53]/30 pointer-events-none z-10" />

            <div className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] overflow-hidden rounded-sm bg-[#191127]">
              <Image
                src="/images/ChatGPT Image 22 de jun. de 2026, 21_03_28.png"
                alt="O Pedido"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-w-768px) 300px, 400px"
              />
              <div className="absolute inset-0 bg-[#0f0b18]/20 mix-blend-overlay" />
            </div>

            {/* Corner gold brackets */}
            <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-[#dfba53]/70" />
            <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-[#dfba53]/70" />
            <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-[#dfba53]/70" />
            <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-[#dfba53]/70" />
          </div>
        </motion.div>
      </div>

    </section>
  );
}
