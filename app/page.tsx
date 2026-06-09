"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSeyfWallet } from "@/lib/seyf/use-seyf-wallet";
import { Header } from "@/components/marketing/header";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { TrustBand } from "@/components/marketing/trust-band";
import { Faq } from "@/components/marketing/faq";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const didRedirectRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const { wallet, loading, creating } = useSeyfWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!wallet?.stellarAddress) {
      didRedirectRef.current = false;
      return;
    }
    if (!mounted || loading || creating) return;
    if (pathname !== "/" || didRedirectRef.current) return;
    didRedirectRef.current = true;
    router.replace("/dashboard");
  }, [mounted, loading, creating, wallet?.stellarAddress, router, pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-emerald-500/25">
      <Header />
      <main>
        <Hero />
        <Features />
        <div id="respaldo">
          <TrustBand />
        </div>
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
