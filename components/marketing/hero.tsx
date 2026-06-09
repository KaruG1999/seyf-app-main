"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const handleScrollToWalkthrough = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("como-funciona");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-background pt-32 pb-24 md:pt-40 md:pb-36">
      {/* Background gradients for premium glassmorphism glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-40 right-[-10%] h-[min(550px,70vw)] w-[min(550px,70vw)] rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/5" />
        <div className="absolute top-[20%] left-[-15%] h-[min(450px,60vw)] w-[min(450px,60vw)] rounded-full bg-teal-500/10 blur-[100px] dark:bg-teal-500/5" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Modern decorative chip */}
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-4 py-1.5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold tracking-wide text-emerald-800 dark:text-emerald-300 uppercase">
            Ahorro Inteligente
          </span>
        </div>

        {/* Major Headline */}
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05]">
          Compra hoy, <br className="sm:hidden" />
          <span className="relative bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
            no pagues nunca.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
          El primer sistema financiero que convierte tu capital en rendimientos diarios garantizados en pesos, permitiéndote adelantar tu liquidez al instante sin tocar un solo peso de tu principal.
        </p>

        <p className="mx-auto mt-3 max-w-xl text-xs text-muted-foreground/80 md:text-sm">
          Respaldado al 100% por instrumentos de deuda gubernamental de máxima seguridad (CETES). Sin plazos forzosos.
        </p>

        {/* Call to actions */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="h-13 rounded-full px-8 text-base font-black shadow-lg shadow-emerald-500/10 hover:shadow-xl active:scale-95 transition-all w-full sm:w-auto">
            <Link href="/registro" className="flex items-center justify-center gap-2">
              Comenzar ahora
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </Link>
          </Button>

          <a
            href="#como-funciona"
            onClick={handleScrollToWalkthrough}
            className="group flex h-13 items-center justify-center gap-2 rounded-full border border-border bg-card/50 px-8 text-sm font-bold text-foreground backdrop-blur-sm transition-all hover:bg-secondary/80 w-full sm:w-auto"
          >
            Cómo funciona
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
