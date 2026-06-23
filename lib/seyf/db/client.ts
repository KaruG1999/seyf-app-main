import pg from "pg";

const { Pool } = pg;

type GlobalPool = {
  __seyfPgPool?: pg.Pool;
};

export function getDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL?.trim();
  return url && url.length > 0 ? url : null;
}

export function isDatabaseConfigured(): boolean {
  return getDatabaseUrl() !== null;
}

export function getPool(): pg.Pool {
  const g = globalThis as GlobalPool;
  if (!g.__seyfPgPool) {
    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not configured");
    }
    g.__seyfPgPool = new Pool({
      connectionString: databaseUrl,
      max: 10,
    });
  }
  return g.__seyfPgPool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params);
}

export async function withActor<T>(actor: string, fn: () => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("select set_config('seyf.actor', $1, true)", [actor]);
    return await fn();
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  const g = globalThis as GlobalPool;
  if (g.__seyfPgPool) {
    await g.__seyfPgPool.end();
    delete g.__seyfPgPool;
  }
}
