import {createPool} from './db.js';
import {createApp} from './app.js';
const db = createPool();
const trustProxy = process.env.TRUST_PROXY_HOPS ? Number(process.env.TRUST_PROXY_HOPS) : false;
if (trustProxy !== false && (!Number.isInteger(trustProxy) || trustProxy < 0)) throw new Error('Invalid TRUST_PROXY_HOPS');
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
try {
  const {rows} = await db.query('SELECT COUNT(*)::int AS count FROM projects');
  if (!rows[0].count) throw new Error('Seed project data before starting the server');
} catch (error) {await db.end();throw error;}
db.on('error',error=>console.error('Database pool error:',error.code || error.name));
const server = createApp(db,{trustProxy}).listen(port,'0.0.0.0',()=>console.log(`Portfolio listening on port ${port}`));
let stopping=false;
async function shutdown() {
  if(stopping)return;stopping=true;
  const timer=setTimeout(()=>process.exit(1),10000);timer.unref();
  server.close(async()=>{await db.end();clearTimeout(timer);process.exit(0);});
}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
