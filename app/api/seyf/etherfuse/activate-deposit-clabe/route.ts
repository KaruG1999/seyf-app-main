import { NextResponse } from 'next/server'
import { AppError, toErrorResponse } from '@/lib/seyf/api-error'
import { resolveEtherfuseRampContext } from '@/lib/seyf/etherfuse-ramp-context'
import { guardEtherfuseRampRoutes } from '@/lib/seyf/etherfuse-ramp-guard'
import { isPublicStellarTestnet } from '@/lib/seyf/stellar-wallet-network'
import {
  isEtherfuseTestnetBankAutofillActive,
  getTestnetSyntheticClabe,
} from '@/lib/seyf/etherfuse-testnet-bank-autofill'
import { createCustomerBankAccount } from '@/lib/etherfuse/bank-accounts'
import { saveEtherfuseOnboardingSession } from '@/lib/etherfuse/onboarding-session'
import { etherfuseFetch, etherfuseReadBody } from '@/lib/etherfuse/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 30

type BankAccountRow = {
  bankAccountId?: string
  etherfuseDepositClabe?: string | null
  status?: string
  deletedAt?: string | null
}
type BankAccountsList = { items?: BankAccountRow[] }

/**
 * Busca cuenta bancaria activa: primero intenta con el endpoint de customer,
 * luego con el endpoint de org (/ramp/bank-accounts) como fallback
 * (en sandbox, la cuenta puede estar registrada a nivel de org).
 */
async function findExistingBankAccount(
  customerId: string,
  bankAccountId: string,
): Promise<{ etherfuseDepositClabe: string | null; bankAccountId: string } | null> {
  // Intento 1: endpoint de customer
  try {
    const res = await etherfuseFetch(
      `/ramp/customer/${encodeURIComponent(customerId)}/bank-accounts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageSize: 50, pageNumber: 0 }),
      },
    )
    const { json } = await etherfuseReadBody<BankAccountsList>(res)
    if (res.ok && json?.items?.length) {
      const active = json.items.filter((b) => !b.deletedAt)
      const match = active.find((b) => b.bankAccountId === bankAccountId) ?? active[0]
      if (match?.bankAccountId) {
        return {
          bankAccountId: match.bankAccountId,
          etherfuseDepositClabe: match.etherfuseDepositClabe ?? null,
        }
      }
    }
  } catch { /* continuar al fallback */ }

  // Intento 2: endpoint de org (sandbox: cuentas registradas al nivel de organización)
  try {
    const res = await etherfuseFetch('/ramp/bank-accounts', { method: 'GET' })
    const { json } = await etherfuseReadBody<BankAccountsList>(res)
    if (res.ok && json?.items?.length) {
      const active = json.items.filter((b) => !b.deletedAt && b.status !== 'deleted')
      const match = active.find((b) => b.bankAccountId === bankAccountId) ?? active[0]
      if (match?.bankAccountId) {
        return {
          bankAccountId: match.bankAccountId,
          etherfuseDepositClabe: match.etherfuseDepositClabe ?? null,
        }
      }
    }
  } catch { /* sin cuenta */ }

  return null
}

/**
 * POST /api/seyf/etherfuse/activate-deposit-clabe
 * Body: { wallet: string }
 *
 * En testnet: devuelve la cuenta bancaria existente o crea una nueva con
 * la CLABE sintética (solo sandbox). Actualiza sesión con el bankAccountId real.
 */
export async function POST(request: Request) {
  const denied = guardEtherfuseRampRoutes()
  if (denied) return denied

  try {
    if (!isPublicStellarTestnet()) {
      throw new AppError('validation_error', {
        statusCode: 403,
        retryable: false,
        message: 'La activación automática solo está disponible en testnet.',
      })
    }
    let walletHint: string | null = null
    try {
      const body = (await request.json()) as Record<string, unknown>
      if (typeof body.wallet === 'string') walletHint = body.wallet
    } catch { /* empty body */ }

    const ctx = await resolveEtherfuseRampContext({ walletPublicKeyHint: walletHint })
    if (!ctx) {
      throw new AppError('validation_error', {
        statusCode: 401,
        retryable: false,
        message: 'Completa primero la verificación en /identidad.',
      })
    }

    // Si ya existe una cuenta bancaria, retornarla directamente
    const existing = await findExistingBankAccount(ctx.customerId, ctx.bankAccountId)
    if (existing) {
      // Actualizar sesión con bankAccountId real por si era diferente
      if (existing.bankAccountId !== ctx.bankAccountId) {
        await saveEtherfuseOnboardingSession({
          customerId: ctx.customerId,
          bankAccountId: existing.bankAccountId,
          publicKey: ctx.publicKey,
        })
      }
      return NextResponse.json(
        {
          ok: true,
          alreadyExisted: true,
          bankAccountId: existing.bankAccountId,
          etherfuseDepositClabe: existing.etherfuseDepositClabe,
        },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    // Crear cuenta bancaria con datos dummy + CLABE sintética (solo testnet)
    if (!isEtherfuseTestnetBankAutofillActive()) {
      throw new AppError('validation_error', {
        statusCode: 400,
        retryable: false,
        message: 'SEYF_TESTNET_SYNTHETIC_CLABE no está configurada.',
      })
    }

    const clabe = getTestnetSyntheticClabe()
    const bankAccount = await createCustomerBankAccount(ctx.customerId, {
      bankAccountId: ctx.bankAccountId,
      registration: {
        kind: 'personal',
        account: {
          firstName: 'Seyf',
          paternalLastName: 'Test',
          maternalLastName: 'Testnet',
          birthDate: '19900101',
          birthCountryIsoCode: 'MX',
          curp: 'SETX900101HDFXXX09',
          rfc: 'SETX900101XX9',
          clabe,
        },
      },
      label: 'seyf-testnet-auto',
    })

    await saveEtherfuseOnboardingSession({
      customerId: ctx.customerId,
      bankAccountId: bankAccount.bankAccountId,
      publicKey: ctx.publicKey,
    })

    return NextResponse.json(
      {
        ok: true,
        alreadyExisted: false,
        bankAccountId: bankAccount.bankAccountId,
        etherfuseDepositClabe: bankAccount.etherfuseDepositClabe ?? null,
      },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (e) {
    return toErrorResponse(e, 'etherfuse/activate-deposit-clabe')
  }
}
