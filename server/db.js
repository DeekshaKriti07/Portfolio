import 'dotenv/config';
import pg from 'pg';
import {readFileSync} from 'node:fs';
export function createPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. See .env.example.');
  const sslMode = process.env.DATABASE_SSL || 'disable';
  if (!['disable','verify-full'].includes(sslMode)) throw new Error('DATABASE_SSL must be disable or verify-full');
  const url = new URL(process.env.DATABASE_URL);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Expected PostgreSQL DATABASE_URL');
  // Prevent connection-string SSL flags from overriding certificate verification.
  for (const key of ['sslmode','sslcert','sslkey','sslrootcert']) url.searchParams.delete(key);
  return new pg.Pool({connectionString:url.toString(),max:5,connectionTimeoutMillis:5000,idleTimeoutMillis:30000,statement_timeout:5000,ssl:sslMode==='verify-full'?{rejectUnauthorized:true,...(process.env.DATABASE_CA_FILE?{ca:readFileSync(process.env.DATABASE_CA_FILE,'utf8')}:{})}:false});
}
