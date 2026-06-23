'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatMXN } from '@/lib/formatters'

export type AdvanceSimulationData = {
  advance_available: boolean
  max_advance_mxn: number
  fee_mxn: number
  net_to_user_mxn: number
  cycle_end_date: string
  years_selected?: number
  error?: string
}

export type AdvanceSimulatorProps = {
  simulation: AdvanceSimulationData
  advanceUsed: boolean
}

const PRESET_STEPS = [0.25, 0.5, 0.75, 1.0] as const
type PresetStep = (typeof PRESET_STEPS)[number]
type SheetState = 'idle' | 'confirming' | 'success' | 'error'

export function AdvanceSimulator({ simulation, advanceUsed }: AdvanceSimulatorProps) {
  const maxAdvance = simulation.max_advance_mxn
  const flatFee = simulation.fee_mxn

  const [amount, setAmount] = useState<number>(maxAdvance)
  const [sheetState, setSheetState] = useState<SheetState>('idle')
  const [sheetError, setSheetError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const receive = Math.max(0, amount - flatFee)
  const belowMin = amount > 0 && amount < 100
  const belowFee = amount >= 100 && amount <= flatFee
  const canConfirm = amount > flatFee && amount >= 100
  const yearsSelected = simulation.years_selected ?? 1

  const cycleDate = new Date(simulation.cycle_end_date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const activePreset: PresetStep | null =
    PRESET_STEPS.find((f) => Math.abs(maxAdvance * f - amount) < 0.02) ?? null

  function setAmountClamped(raw: number) {
    const safe = isNaN(raw) ? 0 : raw
    setAmount(Math.round(Math.min(Math.max(0, safe), maxAdvance) * 100) / 100)
  }

  function handlePreset(fraction: PresetStep) {
    setAmount(Math.round(maxAdvance * fraction * 100) / 100)
  }

  function openSheet() {
    setSheetState('idle')
    setSheetError(null)
    dialogRef.current?.showModal()
  }

  function closeSheet() {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.classList.add('adv-sheet-exit')
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      dialog.classList.remove('adv-sheet-exit')
      dialog.close()
    }, 280)
  }

  function handleDialogClose() {
    setSheetState('idle')
    setSheetError(null)
  }

  async function handleConfirm() {
    setSheetState('confirming')
    setSheetError(null)
    try {
      const res = await fetch('/api/seyf/advance/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_mxn: amount, years: yearsSelected }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        status?: string
        error?: { message_es?: string } | string
        message_es?: string
      }
      if (!res.ok) {
        const msg =
          typeof data.error === 'object'
            ? (data.error?.message_es ?? 'Error al procesar el adelanto.')
            : (data.error ?? data.message_es ?? `Error HTTP ${res.status}`)
        throw new Error(msg)
      }
      setSheetState('success')
    } catch (e) {
      setSheetError(e instanceof Error ? e.message : 'Error de conexión. Intenta nuevamente.')
      setSheetState('error')
    }
  }

  if (advanceUsed) {
    return (
      <div className="rounded-[1.5rem] border border-amber-500/25 bg-amber-500/10 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100/60 dark:bg-amber-900/30">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-500"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <p className="font-bold text-foreground">Ciclo completado</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Ya usaste tu adelanto de este ciclo. Disponible de nuevo el{' '}
          <strong className="text-foreground">{cycleDate}</strong>.
        </p>
      </div>
    )
  }

  return (
    <>
      <section className="space-y-5 rounded-[1.5rem] bg-card p-6 shadow-[0_8px_28px_rgba(0,0,0,0.14)]">
        {/* Numeric input */}
        <div>
          <label
            htmlFor="adv-amount"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Monto a adelantar
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
            <span className="text-lg font-bold text-muted-foreground" aria-hidden="true">
              $
            </span>
            <input
              id="adv-amount"
              type="number"
              min={0}
              max={maxAdvance}
              step={1}
              value={amount}
              onChange={(e) => setAmountClamped(parseFloat(e.target.value))}
              className="w-full bg-transparent text-2xl font-black tabular-nums text-foreground outline-none"
            />
            <span className="shrink-0 text-xs font-bold text-muted-foreground">MXN</span>
          </div>

          {belowMin && (
            <p role="alert" className="mt-1.5 text-xs font-semibold text-destructive">
              El monto mínimo es $100
            </p>
          )}
          {belowFee && (
            <p role="alert" className="mt-1.5 text-xs font-semibold text-destructive">
              El monto seleccionado debe superar la comisión ({formatMXN(flatFee)})
            </p>
          )}
        </div>

        {/* Range slider + preset snaps */}
        <div>
          <input
            type="range"
            min={0}
            max={maxAdvance}
            step={maxAdvance > 0 ? maxAdvance / 400 : 1}
            value={amount}
            onChange={(e) => setAmountClamped(parseFloat(e.target.value))}
            className="w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Desliza para elegir el monto"
          />
          <div className="mt-2 flex gap-2">
            {PRESET_STEPS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => handlePreset(f)}
                aria-pressed={activePreset === f}
                className={[
                  'flex-1 rounded-full border py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  activePreset === f
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-secondary text-muted-foreground hover:bg-secondary/80',
                ].join(' ')}
              >
                {f * 100}%
              </button>
            ))}
          </div>
        </div>

        {/* Real-time breakdown */}
        <div className="space-y-2 rounded-xl border border-border bg-secondary/40 px-4 py-3.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Recibes hoy</span>
            <span className="font-bold tabular-nums text-foreground">{formatMXN(receive)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Comisión Seyf</span>
            <span className="tabular-nums text-muted-foreground">{formatMXN(flatFee)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
            <span className="font-semibold text-foreground">Tu principal</span>
            <span className="font-bold text-[#2e7d69] dark:text-[#7ec8a0]">intacto</span>
          </div>
        </div>

        <Button
          onClick={openSheet}
          disabled={!canConfirm}
          className="h-12 w-full rounded-full bg-foreground text-base font-bold text-background shadow-[0_10px_28px_rgba(255,255,255,0.12)] hover:bg-foreground/90 disabled:opacity-60"
        >
          Solicitar adelanto
        </Button>
      </section>

      {/* Native <dialog> bottom sheet */}
      <dialog
        ref={dialogRef}
        className="adv-sheet"
        onClose={handleDialogClose}
        aria-modal="true"
        aria-labelledby="adv-sheet-title"
      >
        <div className="rounded-t-[2rem] border-t border-border bg-card px-6 pb-10 pt-5">
          <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-border" aria-hidden="true" />

          {sheetState === 'success' ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#9ec7b3]/35 dark:bg-[#6ba690]/25">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-label="Operación exitosa"
                >
                  <polyline className="adv-check" points="20 6 9 17 4 12" stroke="#2e7d69" />
                </svg>
              </div>
              <p className="text-xl font-black text-foreground">Adelanto listo</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tu adelanto está listo. Ya puedes retirarlo a tu banco.
              </p>
              <Button onClick={closeSheet} className="mt-6 h-11 w-full rounded-full font-bold">
                Cerrar
              </Button>
            </div>
          ) : (
            <>
              <h2 id="adv-sheet-title" className="text-lg font-black text-foreground">
                Confirmar adelanto
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                No es un préstamo. No genera deuda. Tu capital sigue trabajando.
              </p>

              <div className="mt-5 space-y-2 rounded-xl border border-border bg-secondary/40 px-4 py-3.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Recibes hoy</span>
                  <span className="font-bold tabular-nums text-foreground">{formatMXN(receive)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Comisión Seyf</span>
                  <span className="tabular-nums text-muted-foreground">{formatMXN(flatFee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
                  <span className="font-semibold text-foreground">Tu principal</span>
                  <span className="font-bold text-[#2e7d69] dark:text-[#7ec8a0]">intacto</span>
                </div>
              </div>

              {sheetState === 'error' && sheetError !== null && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <p className="text-sm text-destructive">{sheetError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSheetState('idle')
                      setSheetError(null)
                    }}
                    className="mt-2 rounded text-xs font-semibold text-destructive underline outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              <div className="mt-5 space-y-3">
                <Button
                  onClick={handleConfirm}
                  disabled={sheetState === 'confirming'}
                  className="h-12 w-full rounded-full font-bold disabled:opacity-60"
                >
                  {sheetState === 'confirming' ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Procesando...
                    </span>
                  ) : (
                    'Confirmar'
                  )}
                </Button>
                <button
                  type="button"
                  onClick={closeSheet}
                  disabled={sheetState === 'confirming'}
                  className="w-full rounded-xl py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-40"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  )
}
