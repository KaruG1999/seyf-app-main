"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSeyfWallet } from "@/lib/seyf/use-seyf-wallet";

export function Header() {
  const { wallet, loading, creating, connect } = useSeyfWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    setMounted(true);
  }, []);

  const busy = !mounted || loading || creating;
  const start = () => void connect();

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/SEYF.png"
            alt="Seyf"
            width={110}
            height={38}
            className="h-8 w-auto object-contain dark:brightness-110"
            priority
          />
        </Link>

        {/* Mid Navigation Anchors */}
        <nav className="hidden items-center gap-8 text-sm font-bold text-muted-foreground md:flex">
          <a
            href="#como-funciona"
            className="transition-colors hover:text-foreground"
          >
            Cómo funciona
          </a>
          <a
            href="#respaldo"
            className="transition-colors hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("respaldo")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Respaldo
          </a>
          <a
            href="#faq"
            className="transition-colors hover:text-foreground"
          >
            Preguntas Frecuentes
          </a>
        </nav>

        {/* Navigation CTAs */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden font-bold sm:inline-flex rounded-full px-5 text-sm"
            disabled={busy}
            onClick={start}
          >
            Iniciar sesión
          </Button>

          <Button
            asChild
            className="h-10 rounded-full bg-foreground text-background font-bold hover:bg-foreground/90 text-xs sm:text-sm px-5"
          >
            <Link href="/registro">Registrarse</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
