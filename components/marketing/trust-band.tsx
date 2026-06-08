"use client";

import React from "react";
import { ShieldCheck, Cpu, Landmark } from "lucide-react";

export function TrustBand() {
  return (
    <section className="bg-zinc-950 py-16 px-6 text-white border-t border-zinc-900">
      <div className="mx-auto max-w-6xl">
        {/* Section Title */}
        <div className="mb-12 text-center">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-400">
            Respaldo e Infraestructura
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Tecnología y Seguridad de Nivel Bancario
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400">
            Seyf opera sobre canales descentralizados y regulados para garantizar la transparencia absoluta de cada centavo.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {/* Stellar Layer */}
          <div className="rounded-2xl border border-zinc-900 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Cpu className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Stellar Infrastructure</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Protocolo global descentralizado de liquidación inmediata. Asegura que cada peso depositado se mantenga en una bóveda digital inalterable con total visibilidad pública.
            </p>
          </div>

          {/* Pollar Security */}
          <div className="rounded-2xl border border-zinc-900 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Pollar Security Layer</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Acceso y verificación criptográfica de grado militar. Protege tu cuenta mediante llaves seguras integradas en tu navegador para que solo tú puedas autorizar transacciones.
            </p>
          </div>

          {/* Etherfuse Bridge */}
          <div className="rounded-2xl border border-zinc-900 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Landmark className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Etherfuse Regulatory Bridge</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Puente de enlace financiero plenamente regulado en México. Gestiona la provisión de tu cuenta CLABE SPEI individual y canaliza de forma automática tus fondos hacia CETES gubernamentales.
            </p>
          </div>
        </div>

        {/* Regulator framing bottom message */}
        <div className="mt-12 text-center">
          <p className="text-[11px] text-zinc-500 tracking-wide leading-relaxed">
            Seyf no es un intermediario financiero tradicional. Todas las inversiones y operaciones están garantizadas por colaterales gubernamentales de bajo riesgo bajo la supervisión de las regulaciones vigentes en materia de activos virtuales y tecnología SPEI en el territorio mexicano.
          </p>
        </div>
      </div>
    </section>
  );
}
