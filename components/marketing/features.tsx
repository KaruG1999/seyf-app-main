"use client";

import React from "react";
import { ArrowDownToLine, TrendingUp, Zap } from "lucide-react";

export function Features() {
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-secondary/30 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center md:mb-24">
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Cómo funciona Seyf
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Un flujo claro, transparente y completamente libre de deudas. Tu dinero trabaja para ti bajo las reglas de la deuda soberana.
          </p>
        </div>

        {/* 3 Step Walkthrough Grid */}
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {/* Step 1: Deposita */}
          <div className="group relative flex flex-col items-center text-center rounded-[2rem] border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
            {/* SVG Illustration */}
            <div className="mb-6 flex h-36 w-full items-center justify-center">
              <svg
                viewBox="0 0 160 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto transition-transform duration-500 group-hover:scale-105"
              >
                <circle cx="80" cy="60" r="40" fill="url(#depositaGlow)" opacity="0.1" />
                {/* Bank Card / Vault */}
                <rect x="35" y="45" width="90" height="55" rx="8" className="stroke-emerald-500 fill-white/80 dark:fill-zinc-950/80" strokeWidth="2" />
                <rect x="35" y="55" width="90" height="12" className="fill-emerald-500" />
                <circle cx="50" cy="80" r="6" className="fill-amber-400" />
                {/* Arrow pointing down representing deposit */}
                <path d="M80 20 V50 M72 42 L80 50 L88 42" className="stroke-emerald-500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <radialGradient id="depositaGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 60) rotate(90) scale(40)">
                    <stop stopColor="#10B981" />
                    <stop offset="1" stopColor="#10B981" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            {/* Label Chip */}
            <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownToLine className="size-4" strokeWidth={2.5} />
            </div>

            <h3 className="text-lg font-bold text-foreground">1. Deposita de forma segura</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-xs">
              Abre tu cuenta en segundos y agrega fondos de pesos digitales a tu CLABE mediante transferencia electrónica SPEI, con liquidez inmediata las 24 horas.
            </p>
          </div>

          {/* Step 2: Trabaja */}
          <div className="group relative flex flex-col items-center text-center rounded-[2rem] border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
            {/* SVG Illustration */}
            <div className="mb-6 flex h-36 w-full items-center justify-center">
              <svg
                viewBox="0 0 160 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto transition-transform duration-500 group-hover:scale-105"
              >
                <circle cx="80" cy="60" r="40" fill="url(#trabajaGlow)" opacity="0.1" />
                {/* Grid */}
                <line x1="30" y1="85" x2="130" y2="85" className="stroke-border" strokeWidth="1" />
                <line x1="30" y1="65" x2="130" y2="65" className="stroke-border" strokeWidth="1" />
                <line x1="30" y1="45" x2="130" y2="45" className="stroke-border" strokeWidth="1" />
                {/* Trend line */}
                <path d="M30 90 L60 75 L90 50 L130 25" className="stroke-emerald-500" strokeWidth="3" strokeLinecap="round" />
                {/* Sparkling gold coins/stars */}
                <path d="M130 25 L132 29 L136 30 L132 31 L130 35 L128 31 L124 30 L128 29 Z" className="fill-amber-400" />
                <circle cx="90" cy="50" r="4" className="fill-emerald-400 animate-ping" />
                <circle cx="90" cy="50" r="4" className="fill-emerald-500" />
                <circle cx="60" cy="75" r="4" className="fill-emerald-500" />
                <defs>
                  <radialGradient id="trabajaGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 60) rotate(90) scale(40)">
                    <stop stopColor="#34D399" />
                    <stop offset="1" stopColor="#34D399" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            {/* Label Chip */}
            <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-4" strokeWidth={2.5} />
            </div>

            <h3 className="text-lg font-bold text-foreground">2. Tu capital trabaja</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-xs">
              Tu dinero se vincula a activos de deuda del gobierno federal (respaldados por CETES gubernamentales), generando rendimientos competitivos todos los días sin riesgo comercial.
            </p>
          </div>

          {/* Step 3: Adelanta */}
          <div className="group relative flex flex-col items-center text-center rounded-[2rem] border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
            {/* SVG Illustration */}
            <div className="mb-6 flex h-36 w-full items-center justify-center">
              <svg
                viewBox="0 0 160 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto transition-transform duration-500 group-hover:scale-105"
              >
                <circle cx="80" cy="60" r="40" fill="url(#adelantaGlow)" opacity="0.1" />
                {/* Lightning Bolt */}
                <path d="M90 20 L55 65 H85 L70 100 L105 55 H75 Z" className="fill-amber-400 stroke-amber-500" strokeWidth="2" strokeLinejoin="round" />
                {/* Micro stars */}
                <path d="M120 40 L122 43 L125 44 L122 45 L120 48 L118 45 L115 44 L118 43 Z" className="fill-emerald-400" />
                <path d="M40 70 L42 73 L45 74 L42 75 L40 78 L38 75 L35 74 L38 73 Z" className="fill-emerald-400" />
                <defs>
                  <radialGradient id="adelantaGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 60) rotate(90) scale(40)">
                    <stop stopColor="#F59E0B" />
                    <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            {/* Label Chip */}
            <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Zap className="size-4" strokeWidth={2.5} />
            </div>

            <h3 className="text-lg font-bold text-foreground">3. Adelanta tu liquidez</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-xs">
              Solicita un adelanto de tus rendimientos futuros al instante y úsalo para tus gastos. Sin pedir préstamos ni pagar comisiones bancarias de financiamiento.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
