import { query } from "@/lib/seyf/db/client";
import {
  getTransactionTypeLabel,
  mapDepositTypeToTransactionType,
  matchesStatusFilter,
} from "./labels";
import type {
  ListTransactionsInput,
  TransactionEntityType,
  TransactionListItem,
  TransactionListResult,
  TransactionRow,
  TransactionStatus,
} from "./types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function clampLimit(limit: number | undefined): number {
  if (!limit || Number.isNaN(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(1, Math.floor(limit)), MAX_LIMIT);
}

function clampPage(page: number | undefined): number {
  if (!page || Number.isNaN(page)) return 1;
  return Math.max(1, Math.floor(page));
}

function toTransactionRow(row: {
  id: string;
  user_id: string;
  entity_type: TransactionEntityType;
  type: string;
  status: string;
  amount_mxn: string;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}): TransactionRow {
  const type =
    row.entity_type === "deposit"
      ? mapDepositTypeToTransactionType(row.type)
      : (row.type as TransactionRow["type"]);

  return {
    id: row.id,
    user_id: row.user_id,
    entity_type: row.entity_type,
    type,
    status: row.status as TransactionStatus,
    amount_mxn: row.amount_mxn,
    metadata: row.metadata ?? {},
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

function toListItem(row: TransactionRow): TransactionListItem {
  return {
    ...row,
    type_label: getTransactionTypeLabel(row.type),
  };
}

export async function ensureUserExists(userId: string): Promise<void> {
  await query(
    `insert into users (id)
     values ($1)
     on conflict (id) do nothing`,
    [userId],
  );
}

export async function listTransactions(
  input: ListTransactionsInput,
): Promise<TransactionListResult> {
  const page = clampPage(input.page);
  const limit = clampLimit(input.limit);
  const offset = (page - 1) * limit;

  const params: unknown[] = [input.userId];
  const whereClauses: string[] = ["user_id = $1"];

  if (input.type === "deposit") {
    whereClauses.push("entity_type = 'deposit'");
    whereClauses.push("type = 'deposit'");
  } else if (input.type === "advance") {
    whereClauses.push("entity_type = 'advance'");
  } else if (input.type === "withdrawal") {
    whereClauses.push("entity_type = 'withdrawal'");
  }

  if (input.status === "pending") {
    whereClauses.push("status = 'pending'");
  } else if (input.status === "failed") {
    whereClauses.push("status = 'failed'");
  } else if (input.status === "completed") {
    whereClauses.push("status in ('completed', 'liquidated')");
  }

  const whereSql = whereClauses.join(" and ");

  const unionSql = `
    select
      id,
      user_id,
      'deposit'::text as entity_type,
      type,
      status,
      amount_mxn::text as amount_mxn,
      metadata,
      created_at,
      updated_at
    from deposits
    union all
    select
      id,
      user_id,
      'advance'::text as entity_type,
      type,
      status,
      amount_mxn::text as amount_mxn,
      metadata,
      created_at,
      updated_at
    from advances
    union all
    select
      id,
      user_id,
      'withdrawal'::text as entity_type,
      type,
      status,
      amount_mxn::text as amount_mxn,
      metadata,
      created_at,
      updated_at
    from withdrawals
  `;

  const countResult = await query<{ total: string }>(
    `select count(*)::text as total
     from (${unionSql}) as all_transactions
     where ${whereSql}`,
    params,
  );

  const total = Number(countResult.rows[0]?.total ?? "0");

  const listParams = [...params, limit, offset];
  const listResult = await query<{
    id: string;
    user_id: string;
    entity_type: TransactionEntityType;
    type: string;
    status: string;
    amount_mxn: string;
    metadata: Record<string, unknown> | null;
    created_at: Date;
    updated_at: Date;
  }>(
    `select *
     from (${unionSql}) as all_transactions
     where ${whereSql}
     order by created_at desc
     limit $${listParams.length - 1}
     offset $${listParams.length}`,
    listParams,
  );

  const transactions = listResult.rows.map((row) =>
    toListItem(toTransactionRow(row)),
  );

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      has_more: offset + transactions.length < total,
    },
  };
}

export function filterTransactionsInMemory(
  rows: TransactionRow[],
  filters: Pick<ListTransactionsInput, "type" | "status">,
): TransactionRow[] {
  return rows.filter((row) => {
    if (filters.type === "deposit" && row.type !== "deposit") return false;
    if (filters.type === "advance" && row.type !== "advance") return false;
    if (filters.type === "withdrawal" && row.type !== "withdrawal") return false;
    if (filters.status && !matchesStatusFilter(row.status, filters.status)) {
      return false;
    }
    return true;
  });
}
