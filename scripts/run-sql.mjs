/* eslint-disable */
// Helper: kirim file SQL ke Supabase lewat database query API.
/*
 * Cara pakai:
 *   SUPABASE_TOKEN=sbp_xxx node scripts/run-sql.mjs file1.sql [file2.sql ...]
 */
import fs from 'node:fs';

const token = process.env.SUPABASE_TOKEN;
if (!token) {
  console.error('SUPABASE_TOKEN wajib diisi.');
  process.exit(1);
}

const PROJECT = process.env.SUPABASE_PROJECT ?? 'khwmdxprniextbuzmpxp';
const url = `https://api.supabase.com/v1/projects/${PROJECT}/database/query`;

for (const arg of process.argv.slice(2)) {
  const sql = arg.startsWith('--sql=') ? arg.slice('--sql='.length) : fs.readFileSync(arg, 'utf8');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ query: sql })
  });
  const text = await res.text();
  console.log(`--- ${arg.slice(0, 60)} -> ${res.status}`);
  console.log(text.slice(0, 4000));
  if (!res.ok) {
    process.exit(1);
  }
}
console.log('Selesai.');
