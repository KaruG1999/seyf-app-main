import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closePool, query } from "@/lib/seyf/db/client";
import { ensureUserExists, listTransactions } from "../repository";

const databaseUrl = process.env.DATABASE_URL?.trim();
const describeIfDb = databaseUrl ? describe : describe.skip;

describeIfDb("transactions repository (integration)", () => {
  const userId = randomUUID();

  beforeAll(async () => {
    await ensureUserExists(userId);
  });

  afterAll(async () => {
    if (!databaseUrl) return;
    await query("delete from users where id = $1", [userId]);
    await closePool();
  });

  it("lists transactions sorted by created_at desc with Spanish labels", async () => {
    const depositId = randomUUID();
    const advanceId = randomUUID();
    const withdrawalId = randomUUID();
    const yieldId = randomUUID();

    await query(
      `insert into deposits (id, user_id, type, status, amount_mxn, created_at)
       values ($1, $2, 'deposit', 'completed', 1000, now() - interval '2 hours')`,
      [depositId, userId],
    );
    await query(
      `insert into deposits (id, user_id, type, status, amount_mxn, created_at)
       values ($1, $2, 'yield', 'completed', 25, now() - interval '1 hour')`,
      [yieldId, userId],
    );
    await query(
      `insert into advances (id, user_id, status, amount_mxn, created_at)
       values ($1, $2, 'pending', 500, now())`,
      [advanceId, userId],
    );
    await query(
      `insert into withdrawals (id, user_id, status, amount_mxn, created_at)
       values ($1, $2, 'failed', 200, now() - interval '30 minutes')`,
      [withdrawalId, userId],
    );

    const all = await listTransactions({ userId, limit: 10 });
    expect(all.transactions.length).toBeGreaterThanOrEqual(4);
    expect(all.transactions[0]?.type).toBe("advance");
    expect(all.transactions[0]?.type_label).toBe("Adelanto");

    const labels = new Set(all.transactions.map((tx) => tx.type_label));
    expect(labels.has("Depósito")).toBe(true);
    expect(labels.has("Rendimiento")).toBe(true);
    expect(labels.has("Adelanto")).toBe(true);
    expect(labels.has("Retiro")).toBe(true);

    const pendingOnly = await listTransactions({ userId, status: "pending" });
    expect(pendingOnly.transactions.every((tx) => tx.status === "pending")).toBe(true);

    const depositOnly = await listTransactions({ userId, type: "deposit" });
    expect(depositOnly.transactions.every((tx) => tx.type === "deposit")).toBe(true);
    expect(depositOnly.transactions.some((tx) => tx.type === "yield")).toBe(false);
  });

  it("rejects invalid status transitions at the database layer", async () => {
    const depositId = randomUUID();
    await query(
      `insert into deposits (id, user_id, status, amount_mxn)
       values ($1, $2, 'pending', 100)`,
      [depositId, userId],
    );

    await expect(
      query(`update deposits set status = 'pending' where id = $1`, [depositId]),
    ).resolves.toBeDefined();

    await expect(
      query(`update deposits set status = 'completed' where id = $1`, [depositId]),
    ).resolves.toBeDefined();

    await expect(
      query(`update deposits set status = 'pending' where id = $1`, [depositId]),
    ).rejects.toThrow(/invalid status transition/i);

    const events = await query<{ to_status: string }>(
      `select to_status
       from transaction_events
       where entity_type = 'deposit' and entity_id = $1
       order by timestamp asc`,
      [depositId],
    );
    expect(events.rows.map((row) => row.to_status)).toEqual(["pending", "completed"]);
  });
});
