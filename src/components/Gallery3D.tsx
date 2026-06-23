"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const GalleryCanvas = dynamic(() => import("./GalleryCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-[#eae3f1]/40 text-xs tracking-widest uppercase">
      Carregando galeria 3D...
    </div>
  ),
});

export default function Gallery3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[550px] md:h-[650px] overflow-hidden flex flex-col items-center justify-between py-6 px-6 pointer-events-auto"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(circle_at_50%_50%,_#392850_0%,_transparent_75%)]" />

      {/* Texts */}
      <div className="max-w-4xl w-full flex flex-col items-center justify-center text-center z-10 relative">
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 0.6, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-[#dfba53] text-xs uppercase tracking-[0.3em] font-semibold mb-3"
        >
          Nossos Registros
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="font-serif text-3xl md:text-5xl text-white font-light tracking-wide mb-3"
        >
          Galeria Cinematográfica
        </motion.h2>

        <div className="w-12 h-[1px] bg-[#dfba53] my-3" />
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.6 } : {}}
          transition={{ duration: 1 }}
          className="text-[10px] md:text-xs text-[#d4c5e2] tracking-[0.2em] uppercase font-light"
        >
          Mova o mouse ou toque para interagir com as fotos no espaço 3D
        </motion.p>
      </div>

      {/* R3F Canvas Container */}
      <div className="absolute inset-0 w-full h-full z-0 pt-28">
        <GalleryCanvas />
      </div>

      {/* Decorative frame overlay */}
      <div className="absolute inset-4 md:inset-8 border border-[#dfba53]/5 rounded-md pointer-events-none z-10" />
    </div>
  );
}
