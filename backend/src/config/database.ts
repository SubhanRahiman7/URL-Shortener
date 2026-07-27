// @ts-ignore
import { Pool } from "pg";

let pool: ReturnType<typeof Pool> | null = null;

export function getPool(): ReturnType<typeof Pool> {
 if (pool) return pool;

 pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 max: 10,
 idleTimeoutMillis: 30000,
 });

 return pool;
}