"use client";

import React from "react";
import { ChevronRight, HelpCircle } from "lucide-react";

export function Faq() {
  const faqs = [
    {
      q: "¿Es un préstamo?",
      a: "No. A diferencia de un préstamo tradicional, no te endeudas, no firmas pagarés ni pagas intereses abusivos de financiamiento. Lo que Seyf hace es entregarte por adelantado el rendimiento real estimado que tu propio capital invertido va a generar durante el ciclo activo. Es tu dinero del futuro trabajando para ti hoy.",
    },
    {
      q: "¿Cuánto rinde mi capital?",
      a: "Tu capital se coloca en activos financieros seguros de rendimiento en pesos (respaldados al 100% por bonos de deuda del gobierno de México, específicamente CETES) que generan una tasa diaria competitiva. Puedes ver exactamente cómo crece tu acumulado estimado de rendimientos en tiempo real desde tu panel de control en Seyf.",
    },
    {
      q: "¿Cuándo puedo retirar?",
      a: "Puedes retirar tu capital principal en cualquier momento al concluir tu ciclo activo de 28 días. Si no has solicitado ningún adelanto, puedes retirar tu dinero de forma inmediata y directa a tu cuenta bancaria vía SPEI las 24 horas del día, los 7 días de la semana.",
    },
    {
      q: "¿Qué pasa si no uso el adelanto?",
      a: "Si decides no solicitar ningún adelanto de rendimiento durante tu ciclo de 28 días, no pasa nada en absoluto. Al concluir el ciclo, recibirás de forma automática tu capital principal íntegro más el 100% de los rendimientos acumulados generados directamente en tu cuenta libre para gastar o volver a activar.",
    },
    {
      q: "¿Quién custodia mi dinero?",
      a: "Tu dinero está custodiado de forma digital y transparente en contratos inteligentes sobre la red global Stellar. Para tu seguridad, tu cuenta de acceso está encriptada y protegida de manera individual a través de la tecnología Pollar, y Etherfuse se encarga de la custodia regulada de los CETES subyacentes.",
    },
    {
      q: "¿Es seguro?",
      a: "Totalmente seguro. Tu capital no está expuesto a riesgos de mercado de renta variable ni a especulaciones comerciales, ya que los instrumentos de respaldo son bonos de deuda soberana de la máxima calificación crediticia en México (CETES gubernamentales). Además, implementamos procesos avanzados de verificación de identidad (KYC) y encriptación de datos de grado bancario para resguardar cada movimiento.",
    },
  ];

  return (
    <section id="faq" className="scroll-mt-20 py-20 md:py-28 bg-background">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <HelpCircle className="size-5" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Preguntas Frecuentes
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Resolvemos tus dudas sobre rendimientos, retiros, seguridad y de qué forma protegemos tu capital.
          </p>
        </div>

        {/* Semantic details / summary Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 open:bg-secondary/20 hover:shadow-sm"
            >
              <summary className="flex cursor-pointer items-center justify-between font-bold text-foreground text-sm sm:text-base outline-none list-none [&::-webkit-details-marker]:hidden focus-visible:ring-2 focus-visible:ring-emerald-500/25 rounded-md px-1 py-0.5">
                <span className="pr-4">{faq.q}</span>
                <ChevronRight className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-90 text-muted-foreground" />
              </summary>
              <div className="mt-4 border-t border-border/50 pt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm pl-1 animate-fadeIn">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
