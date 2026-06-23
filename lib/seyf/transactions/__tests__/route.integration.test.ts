import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET } from "@/app/api/transactions/route";
import { closePool, query } from "@/lib/seyf/db/client";
import { POC_USER_COOKIE } from "@/lib/seyf/poc-user-cookie";

const databaseUrl = process.env.DATABASE_URL?.trim();
const describeIfDb = databaseUrl ? describe : describe.skip;

describeIfDb("GET /api/transactions", () => {
  const userId = randomUUID();

  beforeAll(async () => {
    await query(
      `insert into users (id) values ($1) on conflict (id) do nothing`,
      [userId],
    );
    await query(
      `insert into deposits (id, user_id, status, amount_mxn)
       values ($1, $2, 'completed', 1500)`,
      [randomUUID(), userId],
    );
  });

  afterAll(async () => {
    if (!databaseUrl) return;
    await query("delete from users where id = $1", [userId]);
    await closePool();
  });

  it("returns paginated transactions for the authenticated user", async () => {
    const req = new Request("http://localhost/api/transactions?page=1&limit=10", {
      headers: {
        cookie: `${POC_USER_COOKIE}=${userId}`,
      },
    });

    const response = await GET(req);
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      transactions: Array<{ type_label: string; amount_mxn: string }>;
      pagination: { page: number; limit: number; total: number; has_more: boolean };
    };

    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(10);
    expect(body.transactions.length).toBeGreaterThan(0);
    expect(body.transactions[0]?.type_label).toBe("Depósito");
  });

  it("validates query parameters", async () => {
    const req = new Request("http://localhost/api/transactions?type=invalid", {
      headers: {
        cookie: `${POC_USER_COOKIE}=${userId}`,
      },
    });

    const response = await GET(req);
    expect(response.status).toBe(400);
  });
});
