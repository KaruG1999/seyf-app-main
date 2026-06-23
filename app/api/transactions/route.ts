import { NextResponse } from "next/server";
import { z } from "zod";
import { AppError, toErrorResponse } from "@/lib/seyf/api-error";
import { isDatabaseConfigured } from "@/lib/seyf/db/client";
import { resolvePocUserIdFromRequest } from "@/lib/seyf/poc-user-cookie";
import {
  ensureUserExists,
  listTransactions,
} from "@/lib/seyf/transactions/repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  type: z.enum(["deposit", "advance", "withdrawal"]).optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
});

export async function GET(req: Request) {
  try {
    if (!isDatabaseConfigured()) {
      throw new AppError("generic_error", {
        statusCode: 503,
        retryable: true,
        messageEs:
          "El historial de transacciones no está disponible temporalmente.",
        message: "DATABASE_URL is not configured",
      });
    }

    const { userId } = resolvePocUserIdFromRequest(req);
    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      type: url.searchParams.get("type") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
    });

    if (!parsed.success) {
      throw new AppError("validation_error", {
        messageEs: "Parámetros de consulta inválidos.",
        message: parsed.error.message,
      });
    }

    await ensureUserExists(userId);

    const result = await listTransactions({
      userId,
      page: parsed.data.page,
      limit: parsed.data.limit,
      type: parsed.data.type,
      status: parsed.data.status,
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    return toErrorResponse(error, "transactions");
  }
}
