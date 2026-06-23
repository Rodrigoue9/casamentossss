"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Gift, Copy, Check, Heart, ExternalLink } from "lucide-react";

export default function GiftList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });

  const [copiedPix, setCopiedPix] = useState<string | null>(null);

  // Mock PIX keys
  const pixKeys = {
    rodrigo: "rodrigo.casamento@email.com",
    gabrielle: "gabrielle.casamento@email.com",
    casal: "000.000.000-00",
  };

  const handleCopyPix = (keyName: string, keyValue: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(keyValue)
        .then(() => {
          setCopiedPix(keyName);
          setTimeout(() => setCopiedPix(null), 2500);
        })
        .catch(() => {
          fallbackCopyText(keyName, keyValue);
        });
    } else {
      fallbackCopyText(keyName, keyValue);
    }
  };

  const fallbackCopyText = (keyName: string, text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedPix(keyName);
      setTimeout(() => setCopiedPix(null), 2500);
    } catch (err) {
      console.error('Fallback: Falha ao copiar', err);
    }
    document.body.removeChild(textArea);
  };

  const giftQuotas = [
    {
      title: "Jantar Romântico em Salvador",
      price: "R$ 250,00",
      description: "Um jantar inesquecível para os noivos com vista para a Baía de Todos os Santos.",
      pixKey: pixKeys.casal,
      key: "jantar",
    },
    {
      title: "Passeio de Barco",
      price: "R$ 400,00",
      description: "Um dia de sol e mar nas ilhas de Salvador durante a lua de mel.",
      pixKey: pixKeys.casal,
      key: "passeio",
    },
    {
      title: "Uma Diária de Hotel",
      price: "R$ 600,00",
      description: "Contribuição para a estadia do casal na viagem de lua de mel.",
      pixKey: pixKeys.casal,
      key: "hotel",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-start md:justify-center px-6 py-20 md:py-0 overflow-y-auto md:overflow-visible pointer-events-auto"
      data-lenis-prevent
    >
      {/* Background soft lighting */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_20%_30%,_#7a5c96_0%,_transparent_55%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(circle_at_80%_80%,_#dfba53_0%,_transparent_45%)]" />

      {/* Main Container */}
      <div className="max-w-6xl w-full flex flex-col items-center z-10 relative">
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 0.6, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-[#dfba53] text-xs uppercase tracking-[0.3em] font-semibold mb-3"
        >
          Lista de Presentes
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="font-serif text-3xl md:text-5xl text-white font-light tracking-wide mb-4 text-center"
        >
          Presenteie os Noivos
        </motion.h2>

        <div className="w-12 h-[1px] bg-[#dfba53] my-4" />
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.7 } : {}}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="text-center font-sans text-sm text-[#d4c5e2] max-w-xl mb-16 leading-relaxed"
        >
          Sua presença é o nosso maior presente! Se desejar nos homenagear com algo a mais, criamos opções de cotas para a nossa lua de mel ou presentes em PIX.
        </motion.p>

        {/* PIX section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
          {/* PIX do Casal */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="glassmorphism rounded-3xl p-6 md:p-8 flex flex-col justify-between items-start text-left border border-[#dfba53]/15 shadow-[0_12px_40px_rgba(15,11,24,0.4)] relative group overflow-hidden"
          >
            <div className="w-full">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-full bg-[#dfba53]/10 text-[#dfba53]">
                  <Gift size={22} strokeWidth={1.5} />
                </div>
                <span className="text-[9px] uppercase tracking-wider text-[#d4c5e2]/50 font-semibold">Chave PIX Oficial</span>
              </div>
              <h3 className="font-serif text-xl text-white font-light mb-2">Conta do Casal</h3>
              <p className="text-xs text-[#d4c5e2]/70 leading-relaxed mb-6">
                Você pode enviar qualquer valor diretamente para a conta conjunta do casal.
              </p>
            </div>
            
            <div className="w-full flex items-center justify-between gap-4 p-3.5 bg-[#0f0b18]/60 border border-[#dfba53]/10 rounded-xl">
              <span className="font-mono text-xs text-white truncate max-w-[200px] md:max-w-xs">{pixKeys.casal}</span>
              <button
                onClick={() => handleCopyPix("casal", pixKeys.casal)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dfba53] text-[#0f0b18] text-[10px] uppercase font-bold hover:bg-[#dfba53]/80 transition-colors pointer-events-auto shrink-0"
              >
                {copiedPix === "casal" ? (
                  <>
                    <Check size={12} strokeWidth={2.5} />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy size={12} strokeWidth={2} />
                    Copiar
                  </>
                )}
              </button>
            </div>
            
            <div className="absolute inset-0 bg-[#dfba53]/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>

          {/* PIX do Noivo / Noiva */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="glassmorphism rounded-3xl p-6 md:p-8 flex flex-col justify-between items-start text-left border border-[#dfba53]/15 shadow-[0_12px_40px_rgba(15,11,24,0.4)] relative group overflow-hidden"
          >
            <div className="w-full">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-full bg-[#dfba53]/10 text-[#dfba53]">
                  <Gift size={22} strokeWidth={1.5} />
                </div>
                <span className="text-[9px] uppercase tracking-wider text-[#d4c5e2]/50 font-semibold">Chave PIX Alternativa</span>
              </div>
              <h3 className="font-serif text-xl text-white font-light mb-2">Conta da Noiva (Gabrielle)</h3>
              <p className="text-xs text-[#d4c5e2]/70 leading-relaxed mb-6">
                Se preferir enviar diretamente para a noiva, utilize a chave abaixo.
              </p>
            </div>

            <div className="w-full flex items-center justify-between gap-4 p-3.5 bg-[#0f0b18]/60 border border-[#dfba53]/10 rounded-xl">
              <span className="font-mono text-xs text-white truncate max-w-[200px] md:max-w-xs">{pixKeys.gabrielle}</span>
              <button
                onClick={() => handleCopyPix("gabrielle", pixKeys.gabrielle)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dfba53] text-[#0f0b18] text-[10px] uppercase font-bold hover:bg-[#dfba53]/80 transition-colors pointer-events-auto shrink-0"
              >
                {copiedPix === "gabrielle" ? (
                  <>
                    <Check size={12} strokeWidth={2.5} />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy size={12} strokeWidth={2} />
                    Copiar
                  </>
                )}
              </button>
            </div>

            <div className="absolute inset-0 bg-[#dfba53]/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>
        </div>

        {/* Honeymoon Quotas */}
        <h3 className="font-serif text-2xl text-white font-light mb-8 tracking-wide">Cotas de Lua de Mel</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {giftQuotas.map((quota, idx) => (
            <motion.div
              key={quota.key}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.5 + idx * 0.15 }}
              className="glassmorphism rounded-2xl p-6 text-left flex flex-col justify-between items-start border border-[#dfba53]/15 shadow-[0_8px_32px_rgba(15,11,24,0.3)] relative group overflow-hidden"
            >
              <div className="w-full">
                <span className="font-serif text-lg text-white font-light block mb-1 group-hover:text-[#dfba53] transition-colors">{quota.title}</span>
                <span className="font-mono text-sm text-[#dfba53] font-bold block mb-4">{quota.price}</span>
                <p className="text-xs text-[#eae3f1]/70 leading-relaxed mb-8">{quota.description}</p>
              </div>

              <button
                onClick={() => handleCopyPix(quota.key as any, quota.pixKey)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#dfba53]/5 border border-[#dfba53]/25 text-[#dfba53] text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-[#dfba53] hover:text-[#0f0b18] hover:border-[#dfba53] transition-all duration-300 pointer-events-auto"
              >
                {copiedPix === quota.key ? (
                  <>
                    <Check size={12} strokeWidth={2.5} />
                    PIX Copiado!
                  </>
                ) : (
                  <>
                    Presentear com Cota
                    <ExternalLink size={11} />
                  </>
                )}
              </button>
              
              <div className="absolute inset-0 bg-[#dfba53]/1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
