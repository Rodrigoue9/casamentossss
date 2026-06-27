"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Gift, Copy, Check, Heart, ExternalLink, QrCode, RefreshCw, CreditCard, Loader2 } from "lucide-react";

// Helper function to calculate CRC16 CCITT (used by Pix)
function calculateCRC16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    crc ^= (charCode << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  let crcStr = crc.toString(16).toUpperCase();
  while (crcStr.length < 4) {
    crcStr = "0" + crcStr;
  }
  return crcStr;
}

// Helper to generate the static Pix Copy and Paste payload
function generatePixCopyPaste(amount: number): string {
  const pixKey = "08257842125"; // User's CPF Pix Key
  const name = "Rodrigo";
  const city = "Salvador";
  
  const amountStr = amount.toFixed(2);
  
  const gui = "0014br.gov.bcb.pix";
  const key = "01" + String(pixKey.length).padStart(2, "0") + pixKey;
  const merchantInfo = gui + key;
  const merchantInfoField = "26" + String(merchantInfo.length).padStart(2, "0") + merchantInfo;
  
  let payload = "000201";
  payload += "010211";
  payload += merchantInfoField;
  payload += "52040000";
  payload += "5303986";
  payload += "54" + String(amountStr.length).padStart(2, "0") + amountStr;
  payload += "5802BR";
  payload += "59" + String(name.length).padStart(2, "0") + name;
  payload += "60" + String(city.length).padStart(2, "0") + city;
  payload += "62070503***";
  payload += "6304";
  
  const crc = calculateCRC16(payload);
  return payload + crc;
}

export default function GiftList({ guestId = null }: { guestId?: number | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });

  // Donation state
  const [selectedPreset, setSelectedPreset] = useState<number | null>(100);
  const [customValue, setCustomValue] = useState<string>("");
  const [confirmedAmount, setConfirmedAmount] = useState<number | null>(null);
  const [pixPayload, setPixPayload] = useState<string>("");
  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [50, 100, 250, 500, 1000];

  const handlePresetSelect = (value: number) => {
    setSelectedPreset(value);
    setCustomValue("");
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPreset(null);
    const val = e.target.value.replace(/\D/g, "");
    if (val) {
      const numVal = parseInt(val) / 100;
      setCustomValue(numVal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
    } else {
      setCustomValue("");
    }
  };

  const getNumericValue = (): number => {
    if (selectedPreset !== null) return selectedPreset;
    if (!customValue) return 0;
    const cleanVal = customValue.replace(/[^\d]/g, "");
    return parseInt(cleanVal) / 100;
  };

  const handleConfirmDonation = async () => {
    const amount = getNumericValue();
    if (amount <= 0) return;
    
    if (paymentMethod === "pix") {
      const payload = generatePixCopyPaste(amount);
      setPixPayload(payload);
      setConfirmedAmount(amount);
    } else {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("api/criar_preferencia.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ valor: amount, convidado_id: guestId }),
        });
        const res = await response.json();
        if (res.success && res.init_point) {
          // Redireciona o convidado para o checkout do Mercado Pago
          window.location.href = res.init_point;
        } else {
          setError(res.message || "Erro ao gerar preferência de pagamento. Tente usar Pix.");
        }
      } catch (err) {
        setError("Erro de rede. Verifique sua conexão ou tente usar Pix.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopyPix = () => {
    if (!pixPayload) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pixPayload)
        .then(() => {
          setCopiedPix(true);
          setTimeout(() => setCopiedPix(false), 2500);
        })
        .catch(() => {
          fallbackCopyText(pixPayload);
        });
    } else {
      fallbackCopyText(pixPayload);
    }
  };

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement("textarea");
    textValues(text, textArea);
  };

  const textValues = (text: string, textArea: HTMLTextAreaElement) => {
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const resetDonation = () => {
    setConfirmedAmount(null);
    setPixPayload("");
  };

  const isAmountValid = getNumericValue() > 0;

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
          className="text-center font-sans text-sm text-[#d4c5e2] max-w-xl mb-12 leading-relaxed"
        >
          Sua presença é o nosso maior presente! Se desejar nos homenagear com algo a mais, criamos este espaço integrado ao <strong>Mercado Pago</strong> para presentes in Pix com o valor de sua escolha.
        </motion.p>

        {/* Mercado Pago Donation Panel */}
        <div ref={formRef} className="w-full max-w-2xl mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="glassmorphism rounded-3xl p-6 md:p-8 border border-[#dfba53]/20 shadow-[0_16px_48px_rgba(15,11,24,0.5)] relative overflow-hidden"
          >
            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#dfba53]/10">
              <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/35 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-[9px] uppercase tracking-wider text-blue-300 font-bold">Mercado Pago Pix</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {confirmedAmount === null ? (
                // Step 1: Select Value
                <motion.div
                  key="select-value"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="text-left">
                    <label className="text-[10px] uppercase tracking-widest text-[#d4c5e2]/80 font-bold block mb-3">
                      Selecione um valor para presente:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {presets.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handlePresetSelect(val)}
                          className={`py-3 rounded-xl border text-xs font-semibold font-mono transition-all pointer-events-auto cursor-pointer ${
                            selectedPreset === val
                              ? "bg-[#dfba53] text-[#0f0b18] border-[#dfba53] shadow-[0_4px_12px_rgba(223,186,83,0.3)]"
                              : "bg-[#0f0b18]/50 text-[#d4c5e2]/80 border-[#dfba53]/15 hover:border-[#dfba53]/40"
                          }`}
                        >
                          R$ {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-left relative">
                    <label className="text-[10px] uppercase tracking-widest text-[#d4c5e2]/80 font-bold block mb-3">
                      Ou digite um valor personalizado:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customValue}
                        onChange={handleCustomValueChange}
                        placeholder="R$ 0,00"
                        className="w-full px-4 py-4 bg-[#0f0b18]/60 border border-[#dfba53]/20 focus:border-[#dfba53] rounded-2xl text-lg text-white font-mono placeholder-[#d4c5e2]/30 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Seletor de forma de pagamento */}
                  <div className="text-left">
                    <label className="text-[10px] uppercase tracking-widest text-[#d4c5e2]/80 font-bold block mb-3">
                      Selecione a forma de pagamento:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Opção Pix */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("pix")}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all pointer-events-auto cursor-pointer ${
                          paymentMethod === "pix"
                            ? "bg-[#dfba53]/10 border-[#dfba53] shadow-[0_4px_12px_rgba(223,186,83,0.1)]"
                            : "bg-[#0f0b18]/50 border-[#dfba53]/15 hover:border-[#dfba53]/40"
                        }`}
                      >
                        <div className={`p-2 rounded-lg transition-colors ${paymentMethod === "pix" ? "bg-[#dfba53] text-[#0f0b18]" : "bg-[#392850]/40 text-[#dfba53]"}`}>
                          <QrCode size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-white block">Pix Direto</span>
                          <span className="text-[9px] text-[#d4c5e2]/60 block mt-0.5">Sem taxas, direto para os noivos</span>
                        </div>
                      </button>

                      {/* Opção Cartão de Crédito */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all pointer-events-auto cursor-pointer ${
                          paymentMethod === "card"
                            ? "bg-[#dfba53]/10 border-[#dfba53] shadow-[0_4px_12px_rgba(223,186,83,0.1)]"
                            : "bg-[#0f0b18]/50 border-[#dfba53]/15 hover:border-[#dfba53]/40"
                        }`}
                      >
                        <div className={`p-2 rounded-lg transition-colors ${paymentMethod === "card" ? "bg-[#dfba53] text-[#0f0b18]" : "bg-[#392850]/40 text-[#dfba53]"}`}>
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-white block">Cartão de Crédito</span>
                          <span className="text-[9px] text-[#d4c5e2]/60 block mt-0.5">Parcele em até 12x via Mercado Pago</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmDonation}
                    disabled={!isAmountValid || loading}
                    className={`w-full py-4 rounded-2xl bg-[#dfba53] text-[#0f0b18] text-xs uppercase tracking-widest font-bold transition-all duration-300 pointer-events-auto flex items-center justify-center gap-2 relative z-20 ${
                      !isAmountValid || loading
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:bg-[#dfba53]/85 cursor-pointer shadow-[0_4px_12px_rgba(223,186,83,0.2)]"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-[#0f0b18]" />
                        Criando checkout seguro...
                      </>
                    ) : paymentMethod === "pix" ? (
                      <>
                        <Heart size={14} className="fill-[#0f0b18]" />
                        Gerar Pix para Contribuição
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} />
                        Pagar com Cartão de Crédito
                      </>
                    )}
                  </button>
                </motion.div>
              ) : (
                // Step 2: Pay Pix QR Code
                <motion.div
                  key="pay-pix"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center space-y-6"
                >
                  {/* Valor Escolhido */}
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#d4c5e2]/50 font-bold">Valor Escolhido</span>
                    <h3 className="font-serif text-3xl md:text-4xl text-[#dfba53] font-light mt-1">
                      {confirmedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </h3>
                  </div>

                  {/* QR Code Container */}
                  <div className="p-4 bg-white rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.5)] border-2 border-[#dfba53]/30">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}`}
                      alt="Pix QR Code"
                      className="w-48 h-48 block"
                    />
                  </div>

                  <div className="max-w-md space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#d4c5e2]/50 font-bold block">Beneficiário</span>
                    <span className="text-sm font-semibold text-white block">Rodrigo (Mercado Pago)</span>
                    <span className="text-xs text-[#d4c5e2]/75 block">Abra o app do seu banco, escolha a opção <strong>Pix Copia e Cola</strong> ou <strong>Ler QR Code</strong> e conclua a transferência.</span>
                  </div>

                  {/* Pix Copy Input */}
                  <div className="w-full flex items-center justify-between gap-3 p-3 bg-[#0f0b18]/60 border border-[#dfba53]/15 rounded-xl max-w-md">
                    <span className="font-mono text-[10px] text-[#d4c5e2]/80 truncate max-w-[200px] md:max-w-xs text-left">{pixPayload}</span>
                    <button
                      onClick={handleCopyPix}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#dfba53] text-[#0f0b18] text-[10px] uppercase font-bold hover:bg-[#dfba53]/80 transition-colors pointer-events-auto shrink-0 cursor-pointer relative z-20"
                    >
                      {copiedPix ? (
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

                  <div className="flex gap-4 w-full max-w-md pt-2">
                    <button
                      onClick={resetDonation}
                      className="flex-1 py-3 rounded-xl border border-[#dfba53]/20 bg-transparent text-[#dfba53] text-[10px] uppercase tracking-widest font-semibold hover:bg-[#dfba53]/5 hover:border-[#dfba53]/40 transition-colors pointer-events-auto cursor-pointer flex items-center justify-center gap-2 relative z-20"
                    >
                      <RefreshCw size={12} />
                      Mudar Valor
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
