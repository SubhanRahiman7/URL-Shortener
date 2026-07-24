import { Pool } from "pg";

let pool: Pool;

export function getPool(): Pool {
 if (pool) return pool;

 pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 max: 10,
 idleTimeoutMillis: 30000,
 });

 return pool;
}