'use client'

import { useEffect, useState } from 'react'
import { Copy, CheckCheck, ArrowDownToLine, ShieldCheck, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { AppPageBody } from '@/components/app/app-page-body'
import { AppBackLink } from '@/components/app/app-back-link'
import { Button } from '@/components/ui/button'
import { useSeyfWallet } from '@/lib/seyf/use-seyf-wallet'
import { cn } from '@/lib/utils'

type DepositInfo = {
  ok: boolean
  hasContext: boolean
  kycStatus: string | null
  kycReady: boolean
  etherfuseDepositClabe: string | null
  bankAccountStatus: string | null
}

function kycStatusLabel(status: string | null): { label: string; color: string; icon: React.ReactNode } {
  if (!status) return { label: 'Sin verificar', color: 'text-muted-foreground', icon: <AlertCircle className="size-4" /> }
  if (status === 'approved' || status === 'approved_chain_deploying')
    return { label: 'Verificado', color: 'text-emerald-400', icon: <ShieldCheck className="size-4" /> }
  if (status === 'proposed' || status === 'compliant')
    return { label: 'En revisión', color: 'text-amber-400', icon: <Clock className="size-4" /> }
  if (status === 'rejected')
    return { label: 'Rechazado', color: 'text-rose-400', icon: <AlertCircle className="size-4" /> }
  return { label: status, color: 'text-muted-foreground', icon: <Clock className="size-4" /> }
}

export default function DepositarPage() {
  const { wallet } = useSeyfWallet()
  const [info, setInfo] = useState<DepositInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const walletAddr = wallet?.stellarAddress?.trim() ?? ''

  const fetchInfo = async () => {
    setLoading(true)
    try {
      const url = walletAddr
        ? `/api/seyf/etherfuse/deposit-info?wallet=${encodeURIComponent(walletAddr)}`
        : '/api/seyf/etherfuse/deposit-info'
      const res = await fetch(url)
      const data = await res.json() as DepositInfo
      setInfo(data)
    } catch {
      setError('No pudimos cargar la información de depósito.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddr])

  const handleActivar = async () => {
    setActivating(true)
    setError(null)
    try {
      // Reuse the testnet-auto endpoint which creates the bank account with synthetic CLABE
      const res = await fetch('/api/seyf/etherfuse/deposit-info', {
        headers: { 'Cache-Control': 'no-store' },
      })
      const data = await res.json() as DepositInfo
      setInfo(data)
      if (!data.etherfuseDepositClabe) {
        // Re-fetch after a short delay (Etherfuse can take a moment to process)
        await new Promise((r) => setTimeout(r, 1500))
        await fetchInfo()
      }
    } catch {
      setError('Error al activar la cuenta. Intenta de nuevo.')
    } finally {
      setActivating(false)
    }
  }

  const copyClabe = async () => {
    if (!info?.etherfuseDepositClabe) return
    await navigator.clipboard.writeText(info.etherfuseDepositClabe)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const kycBadge = kycStatusLabel(info?.kycStatus ?? null)

  return (
    <AppPageBody className="space-y-5 pt-2">
      <AppBackLink href="/dashboard" />

      {/* Header */}
      <section className="relative overflow-hidden rounded-[1.5rem] border border-[#bfd6ca] bg-gradient-to-br from-[#edf6f2] via-[#e6f0ea] to-[#dce9e3] p-5 dark:border-[#2b4a43] dark:from-[#0d3531] dark:via-[#15534a] dark:to-[#1f6559]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#9ec7b3]/25 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-[#b8b8b5]/60 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#5f7168] dark:border-white/20 dark:bg-white/15 dark:text-[#d2e9df]">
            <ArrowDownToLine className="size-3" />
            Depositar
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-[#41534b] dark:text-white">
            Agrega fondos
          </h1>
          <p className="mt-1 text-sm text-[#7b8f86] dark:text-[#d2e9df]">
            Deposita MXN vía SPEI y conviértelos automáticamente en CETES.
          </p>
        </div>
      </section>

      {/* KYC Status */}
      {!loading && info && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-[1.25rem] border p-4',
            info.kycReady
              ? 'border-emerald-500/25 bg-emerald-500/10'
              : info.kycStatus === 'rejected'
                ? 'border-rose-500/25 bg-rose-500/10'
                : 'border-amber-500/25 bg-amber-500/10',
          )}
        >
          <span className={kycBadge.color}>{kycBadge.icon}</span>
          <div>
            <p className={cn('text-sm font-semibold', kycBadge.color)}>
              Verificación de identidad: {kycBadge.label}
            </p>
            {!info.hasContext && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Conecta tu wallet y completa{' '}
                <a href="/identidad" className="underline font-medium">
                  /identidad
                </a>{' '}
                para habilitar depósitos.
              </p>
            )}
            {info.hasContext && !info.kycReady && info.kycStatus !== 'rejected' && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Tu identidad está en revisión por Etherfuse. Los depósitos se habilitarán al aprobarse.
              </p>
            )}
            {info.kycStatus === 'rejected' && (
              <p className="text-xs text-rose-300 mt-0.5">
                Ve a{' '}
                <a href="/identidad" className="underline font-medium">
                  /identidad
                </a>{' '}
                para corregir tu información y reenviar.
              </p>
            )}
          </div>
        </div>
      )}

      {/* CLABE de depósito */}
      {!loading && info?.kycReady && (
        <section className="space-y-4 rounded-[1.5rem] bg-card p-5 shadow-[0_8px_28px_rgba(0,0,0,0.14)]">
          <div>
            <p className="text-sm font-semibold text-foreground">CLABE de depósito (SPEI)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Envía MXN desde cualquier banco a esta CLABE y Etherfuse lo convertirá en CETES automáticamente.
            </p>
          </div>

          {info.etherfuseDepositClabe ? (
            <>
              <div
                className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-secondary/60 px-4 py-3 transition hover:bg-secondary"
                onClick={() => void copyClabe()}
              >
                <span className="font-mono text-base font-bold tracking-widest text-foreground">
                  {info.etherfuseDepositClabe}
                </span>
                {copied ? (
                  <CheckCheck className="size-5 shrink-0 text-emerald-400" />
                ) : (
                  <Copy className="size-5 shrink-0 text-muted-foreground" />
                )}
              </div>

              {info.bankAccountStatus && (
                <p className="text-[11px] text-muted-foreground">
                  Estado de cuenta: <span className="font-medium">{info.bankAccountStatus}</span>
                  {info.bankAccountStatus === 'awaitingDepositVerification' && (
                    <span className="ml-1 text-amber-400">
                      — en sandbox se verifica automáticamente al hacer depósito de prueba
                    </span>
                  )}
                </p>
              )}

              <div className="rounded-xl border border-border/50 bg-secondary/30 p-3 text-[11px] text-muted-foreground leading-relaxed">
                <strong>¿Cómo depositar?</strong>
                <ol className="mt-1 space-y-1 list-decimal pl-4">
                  <li>Abre tu banco o app de pagos</li>
                  <li>Haz una transferencia SPEI a la CLABE de arriba</li>
                  <li>En 1-3 minutos verás el saldo reflejado en tu dashboard</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Tu cuenta de depósito aún no está activada. Actívala para obtener tu CLABE SPEI.
              </p>
              <Button
                onClick={() => void handleActivar()}
                disabled={activating}
                className="h-11 w-full rounded-full font-bold"
              >
                {activating ? (
                  <><RefreshCw className="mr-2 size-4 animate-spin" />Activando cuenta…</>
                ) : (
                  'Activar cuenta de depósito'
                )}
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <RefreshCw className="size-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando información de depósito…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-[1rem] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* No wallet */}
      {!loading && !info?.hasContext && !walletAddr && (
        <div className="rounded-[1.5rem] border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Conecta tu wallet para ver tu información de depósito.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <a href="/identidad">Ir a verificación</a>
          </Button>
        </div>
      )}
    </AppPageBody>
  )
}
