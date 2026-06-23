"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Check, Heart, Loader2 } from "lucide-react";

export default function RsvpForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    acompanhantes: 0,
    mensagem: "",
    presenca: 1, // 1 = Sim, 0 = Não
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const formatPhone = (val: string) => {
    const numbers = val.replace(/\D/g, "");
    if (numbers.length <= 2) {
      return numbers ? `(${numbers}` : "";
    }
    if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }
    if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "acompanhantes" 
        ? parseInt(value) || 0 
        : name === "telefone" 
          ? formatPhone(value) 
          : value,
    }));
  };

  const handlePresencaChange = (value: number) => {
    setFormData((prev) => ({ ...prev, presenca: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.telefone) {
      setErrorMessage("Por favor, preencha o nome e o telefone.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // Fetch post to local or relative API endpoint
      const response = await fetch("/api/confirmar.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
      } else {
        setErrorMessage(result.message || "Ocorreu um erro ao enviar.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMessage("Erro ao conectar com o servidor. Tente novamente mais tarde.");
      setStatus("error");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-start md:justify-center px-6 py-20 md:py-0 overflow-y-auto md:overflow-visible pointer-events-auto"
      data-lenis-prevent
    >
      {/* Background visual effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#392850_0%,_transparent_75%)]" />

      {/* Main Container */}
      <div className="max-w-xl w-full flex flex-col items-center z-10 relative">
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 0.6, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-[#dfba53] text-xs uppercase tracking-[0.3em] font-semibold mb-3"
        >
          Confirmar Presença
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="font-serif text-3xl md:text-5xl text-white font-light tracking-wide mb-4 text-center"
        >
          Confirme sua Presença
        </motion.h2>

        <div className="w-12 h-[1px] bg-[#dfba53] my-4 mb-10" />

        {/* Dynamic Card Container */}
        <div className="w-full glassmorphism rounded-3xl p-8 md:p-10 border border-[#dfba53]/20 shadow-[0_16px_48px_rgba(15,11,24,0.6)] relative min-h-[420px] flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            {status !== "success" ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-6"
              >
                {/* Form header message */}
                <p className="text-xs text-[#d4c5e2]/80 text-center leading-relaxed mb-2">
                  Por favor, confirme sua presença até o dia <b>13 de Agosto de 2026</b> para que possamos planejar tudo com muito carinho.
                </p>

                {/* Input: Nome */}
                <div className="flex flex-col text-left">
                  <label className="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 bg-[#0f0b18]/60 border border-[#dfba53]/15 focus:border-[#dfba53] rounded-xl text-sm text-white placeholder-[#d4c5e2]/30 outline-none transition-colors"
                    required
                  />
                </div>

                {/* Input: Telefone */}
                <div className="flex flex-col text-left">
                  <label className="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold mb-2">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 bg-[#0f0b18]/60 border border-[#dfba53]/15 focus:border-[#dfba53] rounded-xl text-sm text-white placeholder-[#d4c5e2]/30 outline-none transition-colors"
                    required
                  />
                </div>

                {/* Grid: Acompanhantes & Presenca */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Presence Radio Buttons */}
                  <div className="flex flex-col text-left">
                    <label className="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold mb-2">
                      Você comparecerá?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => handlePresencaChange(1)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all pointer-events-auto ${
                          formData.presenca === 1
                            ? "bg-[#dfba53] text-[#0f0b18] border-[#dfba53]"
                            : "bg-[#0f0b18]/40 text-[#d4c5e2]/80 border-[#dfba53]/20 hover:border-[#dfba53]/40"
                        }`}
                      >
                        Sim, vou!
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresencaChange(0)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all pointer-events-auto ${
                          formData.presenca === 0
                            ? "bg-[#7a5c96] text-white border-[#7a5c96]"
                            : "bg-[#0f0b18]/40 text-[#d4c5e2]/80 border-[#dfba53]/20 hover:border-[#dfba53]/40"
                        }`}
                      >
                        Não poderei
                      </button>
                    </div>
                  </div>

                  {/* Input: Acompanhantes */}
                  <div className="flex flex-col text-left">
                    <label className="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold mb-2">
                      Acompanhantes (Opcional)
                    </label>
                    <input
                      type="number"
                      name="acompanhantes"
                      value={formData.acompanhantes || ""}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      max="10"
                      className="w-full px-4 py-3 bg-[#0f0b18]/60 border border-[#dfba53]/15 focus:border-[#dfba53] rounded-xl text-sm text-white placeholder-[#d4c5e2]/30 outline-none transition-colors"
                      disabled={formData.presenca === 0}
                    />
                  </div>
                </div>

                {/* Input: Mensagem */}
                <div className="flex flex-col text-left">
                  <label className="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold mb-2">
                    Mensagem de Carinho aos Noivos
                  </label>
                  <textarea
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleChange}
                    placeholder="Deixe suas felicitações aqui..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0f0b18]/60 border border-[#dfba53]/15 focus:border-[#dfba53] rounded-xl text-sm text-white placeholder-[#d4c5e2]/30 outline-none transition-colors resize-none"
                  />
                </div>

                {/* Error Banner */}
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 text-center"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#dfba53] text-[#0f0b18] text-xs uppercase tracking-[0.25em] font-bold hover:bg-[#dfba53]/85 disabled:bg-[#dfba53]/40 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_4px_24px_rgba(223,186,83,0.15)] pointer-events-auto cursor-pointer"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#0f0b18]" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Heart size={14} className="fill-current" />
                      Enviar Confirmação
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center justify-center text-center py-10"
              >
                {/* Success animated icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-[#dfba53]/15 border border-[#dfba53]/40 text-[#dfba53] flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(223,186,83,0.1)]"
                >
                  <Check size={36} strokeWidth={2} />
                </motion.div>

                <h3 className="font-serif text-2xl md:text-3xl text-white font-light mb-3">
                  {formData.presenca === 1
                    ? "Presença Confirmada!"
                    : "Agradecemos o Envio!"}
                </h3>
                
                <p className="text-sm text-[#eae3f1]/80 max-w-sm leading-relaxed mb-6 font-sans">
                  {formData.presenca === 1
                    ? "Sua confirmação foi registrada com sucesso. Estamos imensamente felizes por você fazer parte deste momento único em nossas vidas!"
                    : "Sua mensagem foi enviada. Sentiremos sua falta, mas agradecemos imensamente o seu carinho e as suas felicitações."}
                </p>

                <div className="w-12 h-[1px] bg-[#dfba53]/40 my-3" />

                <p className="font-serif italic text-xs text-[#dfba53]/80">
                  Com carinho, Rodrigo & Gabrielle.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
