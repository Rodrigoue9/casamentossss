"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Heart } from "lucide-react";

export default function Countdown() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isFinished, setIsFinished] = useState(false);

  // Target date: September 13, 2026
  useEffect(() => {
    const targetDate = new Date("2026-09-13T17:00:00-03:00").getTime(); // 17:00 Salvador time

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsFinished(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Particle Canvas logic (Mouse reactive golden particles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Particle[] = [];
    const maxParticles = window.innerWidth < 768 ? 40 : 80;

    const mouse = {
      x: -9999,
      y: -9999,
      radius: 120,
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;
      alpha: number;
      speedY: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.5 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = Math.random() * 20 + 2;
        this.alpha = Math.random() * 0.5 + 0.25;
        this.speedY = Math.random() * 0.4 + 0.1;
        // 80% gold, 20% lavender
        this.color = Math.random() > 0.2 ? "223, 186, 83" : "212, 197, 226";
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        // Floating upwards slowly
        this.y -= this.speedY;
        if (this.y < 0) {
          this.y = height;
          this.x = Math.random() * width;
        }

        // Mouse collision interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const dist = distance === 0 ? 0.001 : distance;
          const forceDirectionX = dx / dist;
          const forceDirectionY = dy / dist;
          const maxDistance = mouse.radius;
          const force = (maxDistance - dist) / maxDistance;
          const directionX = forceDirectionX * force * this.density * 0.6;
          const directionY = forceDirectionY * force * this.density * 0.6;

          this.x -= directionX;
          this.y -= directionY;
        }
      }
    }

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      init();
    };

    init();
    animate();

    window.addEventListener("resize", handleResize);
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  // Format single digits with a leading zero
  const formatNum = (num: number) => String(num).padStart(2, "0");

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center text-center px-6"
    >
      {/* Canvas for mouse reactive golden particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Decorative floral silhouette background */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_center,_#dfba53_0%,_transparent_70%)]" />

      {/* Main Container */}
      <div className="max-w-4xl w-full flex flex-col items-center justify-center z-10 relative">
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 0.6, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-[#dfba53] text-xs uppercase tracking-[0.3em] font-semibold mb-3"
        >
          A Contagem Regressiva
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="font-serif text-3xl md:text-5xl text-white font-light tracking-wide mb-4"
        >
          Faltam Apenas...
        </motion.h2>

        <div className="w-12 h-[1px] bg-[#dfba53] my-4" />

        {/* Large clock container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={isInView ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
          className="w-full max-w-3xl mt-6 flex justify-center"
        >
          {!isFinished ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
              {/* Days */}
              <div className="glassmorphism rounded-2xl p-6 md:p-8 flex flex-col items-center shadow-[0_8px_32px_rgba(15,11,24,0.4)] relative group overflow-hidden border border-[#dfba53]/20">
                <span className="font-serif text-5xl md:text-6xl text-[#dfba53] font-extralight tabular-nums transition-transform duration-500 group-hover:scale-105">
                  {formatNum(timeLeft.days)}
                </span>
                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#eae3f1]/60 font-medium mt-3">
                  Dias
                </span>
                <div className="absolute inset-0 bg-[#dfba53]/3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              {/* Hours */}
              <div className="glassmorphism rounded-2xl p-6 md:p-8 flex flex-col items-center shadow-[0_8px_32px_rgba(15,11,24,0.4)] relative group overflow-hidden border border-[#dfba53]/20">
                <span className="font-serif text-5xl md:text-6xl text-[#dfba53] font-extralight tabular-nums transition-transform duration-500 group-hover:scale-105">
                  {formatNum(timeLeft.hours)}
                </span>
                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#eae3f1]/60 font-medium mt-3">
                  Horas
                </span>
                <div className="absolute inset-0 bg-[#dfba53]/3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              {/* Minutes */}
              <div className="glassmorphism rounded-2xl p-6 md:p-8 flex flex-col items-center shadow-[0_8px_32px_rgba(15,11,24,0.4)] relative group overflow-hidden border border-[#dfba53]/20">
                <span className="font-serif text-5xl md:text-6xl text-[#dfba53] font-extralight tabular-nums transition-transform duration-500 group-hover:scale-105">
                  {formatNum(timeLeft.minutes)}
                </span>
                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#eae3f1]/60 font-medium mt-3">
                  Minutos
                </span>
                <div className="absolute inset-0 bg-[#dfba53]/3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              {/* Seconds */}
              <div className="glassmorphism rounded-2xl p-6 md:p-8 flex flex-col items-center shadow-[0_8px_32px_rgba(15,11,24,0.4)] relative group overflow-hidden border border-[#dfba53]/20">
                <span className="font-serif text-5xl md:text-6xl text-[#dfba53] font-extralight tabular-nums transition-transform duration-500 group-hover:scale-105">
                  {formatNum(timeLeft.seconds)}
                </span>
                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#eae3f1]/60 font-medium mt-3">
                  Segundos
                </span>
                <div className="absolute inset-0 bg-[#dfba53]/3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="glassmorphism rounded-3xl p-8 md:p-12 text-center border border-[#dfba53]/30 shadow-[0_12px_40px_rgba(223,186,83,0.1)] max-w-lg w-full"
            >
              <Heart size={32} className="text-[#dfba53] fill-[#dfba53]/20 mx-auto mb-4 animate-pulse" />
              <h3 className="font-serif text-2xl md:text-3xl text-white font-light mb-2">Chegou o Grande Dia!</h3>
              <p className="text-xs md:text-sm text-[#d4c5e2]/80 leading-relaxed font-sans">
                Hoje celebramos o amor e o início de uma nova história sob a bênção de Deus. Agradecemos a todos que compartilham desse sonho conosco!
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.6 } : {}}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="text-[#d4c5e2] text-xs font-serif italic tracking-wide mt-10"
        >
          Para o início de uma vida inteira juntos. Salvador, BA — 13.09.2026.
        </motion.p>
      </div>
    </div>
  );
}
