import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';
import ws from "ws"

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool)

