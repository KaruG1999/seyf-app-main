import { NextResponse } from 'next/server'
import { toErrorResponse } from '@/lib/seyf/api-error'
import { resolveEtherfuseRampContext } from '@/lib/seyf/etherfuse-ramp-context'
import { fetchEtherfuseKycStatus } from '@/lib/etherfuse/kyc'
import { etherfuseFetch, etherfuseReadBody } from '@/lib/etherfuse/client'
import { guardEtherfuseRampRoutes } from '@/lib/seyf/etherfuse-ramp-guard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type BankAccountRow = {
  bankAccountId?: string
  etherfuseDepositClabe?: string | null
  status?: string
  abbrClabe?: string
  label?: string | null
  compliant?: boolean
}
type BankAccountsList = { items?: BankAccountRow[] }

async function fetchBankAccountDepositClabe(
  customerId: string,
  bankAccountId: string,
): Promise<{ etherfuseDepositClabe: string | null; status: string | null }> {
  const res = await etherfuseFetch(
    `/ramp/customer/${encodeURIComponent(customerId)}/bank-accounts`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageSize: 50, pageNumber: 0 }),
    },
  )
  const { json } = await etherfuseReadBody<BankAccountsList>(res)
  if (!res.ok || !json?.items) return { etherfuseDepositClabe: null, status: null }

  // Buscar el bankAccountId de la sesión
  const match = json.items.find((b) => b.bankAccountId === bankAccountId)
  const first = match ?? json.items[0]

  return {
    etherfuseDepositClabe: first?.etherfuseDepositClabe ?? null,
    status: first?.status ?? null,
  }
}

/**
 * GET /api/seyf/etherfuse/deposit-info?wallet={publicKey}
 *
 * Retorna:
 *  - kycStatus: estado del KYC del usuario
 *  - kycReady: true si KYC está en estado usable (compliant/proposed/approved)
 *  - etherfuseDepositClabe: CLABE para depósito SPEI en Etherfuse (puede ser null si aún no activada)
 *  - bankAccountStatus: estado de la cuenta bancaria en Etherfuse
 *  - hasContext: si se pudo resolver la sesión
 */
export async function GET(request: Request) {
  const denied = guardEtherfuseRampRoutes()
  if (denied) return denied
  try {
    const walletHint = new URL(request.url).searchParams.get('wallet') ?? null
    const ctx = await resolveEtherfuseRampContext({ walletPublicKeyHint: walletHint })

    if (!ctx) {
      return NextResponse.json(
        { ok: true, hasContext: false, kycReady: false, etherfuseDepositClabe: null },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const kyc = await fetchEtherfuseKycStatus(ctx.customerId, ctx.publicKey)
    const kycStatus = kyc.ok ? (kyc.data?.status ?? null) : null
    const kycReady =
      kycStatus === 'approved' ||
      kycStatus === 'approved_chain_deploying' ||
      kycStatus === 'proposed' ||
      kycStatus === 'compliant' // Etherfuse sandbox usa "compliant"

    let etherfuseDepositClabe: string | null = null
    let bankAccountStatus: string | null = null

    if (kycReady) {
      try {
        const ba = await fetchBankAccountDepositClabe(ctx.customerId, ctx.bankAccountId)
        etherfuseDepositClabe = ba.etherfuseDepositClabe
        bankAccountStatus = ba.status
      } catch {
        // No bloquear si falla — el usuario puede activar desde el botón
      }
    }

    return NextResponse.json(
      {
        ok: true,
        hasContext: true,
        customerId: ctx.customerId,
        kycStatus,
        kycReady,
        etherfuseDepositClabe,
        bankAccountStatus,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (e) {
    return toErrorResponse(e, 'etherfuse/deposit-info')
  }
}
