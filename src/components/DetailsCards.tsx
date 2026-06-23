"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react";

export default function DetailsCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });

  const ceremonyAddress = "Catedral Basílica de Salvador - Largo do Terreiro de Jesus, Centro Histórico, Salvador - BA";
  const receptionAddress = "Cerimonial Villa Cancione - Caminho das Árvores, Salvador - BA";

  const handleOpenMap = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
  };

  return (
    <div
      id="cerimonia"
      ref={containerRef}
      className="relative w-full py-24 bg-[#0f0b18] overflow-hidden flex flex-col items-center justify-center px-6"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_10%_20%,_#7a5c96_0%,_transparent_50%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_90%_80%,_#dfba53_0%,_transparent_40%)]" />

      {/* Main Container */}
      <div className="max-w-6xl w-full flex flex-col items-center z-10 relative">
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 0.6, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-[#dfba53] text-xs uppercase tracking-[0.3em] font-semibold mb-3"
        >
          O Grande Dia
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="font-serif text-3xl md:text-5xl text-white font-light tracking-wide mb-4 text-center"
        >
          Programação do Casamento
        </motion.h2>

        <div className="w-12 h-[1px] bg-[#dfba53] my-4 mb-12" />

        {/* Ceremonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
          
          {/* CARD 1: CERIMÔNIA */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
            className="glassmorphism rounded-3xl p-8 md:p-10 flex flex-col items-center justify-between text-center relative group overflow-hidden border border-[#dfba53]/20 shadow-[0_12px_40px_rgba(15,11,24,0.5)]"
          >
            {/* Top decorative line */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#dfba53] to-transparent opacity-50" />
            
            <div className="w-full">
              <span className="text-[#dfba53] text-[10px] uppercase tracking-[0.25em] font-semibold block mb-2">01 . A União</span>
              <h3 className="font-serif text-2xl md:text-3xl text-white font-light mb-6 tracking-wide">A Cerimônia</h3>
              <div className="w-8 h-[1px] bg-[#dfba53]/40 mx-auto mb-8" />
              
              <div className="flex flex-col gap-6 text-left max-w-sm mx-auto text-[#eae3f1]/90">
                {/* Date */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-full bg-[#dfba53]/10 text-[#dfba53] mt-0.5">
                    <Calendar size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#d4c5e2]/60 font-semibold block">Data</span>
                    <span className="font-serif text-base text-white tracking-wide">Domingo, 13 de Setembro de 2026</span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-full bg-[#dfba53]/10 text-[#dfba53] mt-0.5">
                    <Clock size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#d4c5e2]/60 font-semibold block">Horário</span>
                    <span className="font-serif text-base text-white tracking-wide">Às 17:00 Horas</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-full bg-[#dfba53]/10 text-[#dfba53] mt-0.5">
                    <MapPin size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#d4c5e2]/60 font-semibold block">Local</span>
                    <span className="font-serif text-base text-white tracking-wide">Catedral Basílica de Salvador</span>
                    <p className="text-xs text-[#eae3f1]/65 mt-1 leading-relaxed">{ceremonyAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenMap(ceremonyAddress)}
              className="mt-8 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#dfba53]/5 border border-[#dfba53]/30 text-[#dfba53] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#dfba53] hover:text-[#0f0b18] hover:border-[#dfba53] transition-all duration-300 pointer-events-auto"
            >
              Ver no Mapa
              <ExternalLink size={12} />
            </button>
            
            {/* Subtle glow hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#dfba53]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </motion.div>

          {/* CARD 2: RECEPÇÃO */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.5, ease: "easeOut" }}
            className="glassmorphism rounded-3xl p-8 md:p-10 flex flex-col items-center justify-between text-center relative group overflow-hidden border border-[#dfba53]/20 shadow-[0_12px_40px_rgba(15,11,24,0.5)]"
          >
            {/* Top decorative line */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#dfba53] to-transparent opacity-50" />
            
            <div className="w-full">
              <span className="text-[#dfba53] text-[10px] uppercase tracking-[0.25em] font-semibold block mb-2">02 . A Celebração</span>
              <h3 className="font-serif text-2xl md:text-3xl text-white font-light mb-6 tracking-wide">A Recepção</h3>
              <div className="w-8 h-[1px] bg-[#dfba53]/40 mx-auto mb-8" />

              <div className="flex flex-col gap-6 text-left max-w-sm mx-auto text-[#eae3f1]/90">
                {/* Date */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-full bg-[#dfba53]/10 text-[#dfba53] mt-0.5">
                    <Calendar size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#d4c5e2]/60 font-semibold block">Data</span>
                    <span className="font-serif text-base text-white tracking-wide">Domingo, 13 de Setembro de 2026</span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-full bg-[#dfba53]/10 text-[#dfba53] mt-0.5">
                    <Clock size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#d4c5e2]/60 font-semibold block">Horário</span>
                    <span className="font-serif text-base text-white tracking-wide">Logo após a cerimônia</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-full bg-[#dfba53]/10 text-[#dfba53] mt-0.5">
                    <MapPin size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#d4c5e2]/60 font-semibold block">Local</span>
                    <span className="font-serif text-base text-white tracking-wide">Villa Cancione</span>
                    <p className="text-xs text-[#eae3f1]/65 mt-1 leading-relaxed">{receptionAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenMap(receptionAddress)}
              className="mt-8 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#dfba53]/5 border border-[#dfba53]/30 text-[#dfba53] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#dfba53] hover:text-[#0f0b18] hover:border-[#dfba53] transition-all duration-300 pointer-events-auto"
            >
              Ver no Mapa
              <ExternalLink size={12} />
            </button>

            {/* Subtle glow hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#dfba53]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
