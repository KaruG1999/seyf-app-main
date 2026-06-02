"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12 px-6 text-muted-foreground transition-colors">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand logo & copyright */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/SEYF.png"
              alt="Seyf"
              width={100}
              height={35}
              className="h-7 w-auto object-contain dark:brightness-110"
            />
          </Link>
          <p className="text-[11px] tracking-wide text-muted-foreground/80">
            © {new Date().getFullYear()} Seyf. Todos los derechos reservados.
          </p>
        </div>

        {/* Legal Link Anchors */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold">
          <Link
            href="#"
            className="transition-colors hover:text-foreground underline underline-offset-4 decoration-border/80"
          >
            Aviso de Privacidad
          </Link>
          <Link
            href="#"
            className="transition-colors hover:text-foreground underline underline-offset-4 decoration-border/80"
          >
            Términos y Condiciones
          </Link>
          <a
            href="https://docs.etherfuse.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground underline underline-offset-4 decoration-border/80"
          >
            Documentación Etherfuse
          </a>
        </div>
      </div>
    </footer>
  );
}
