import {createPool} from './db.js';
import {migrate,seed} from './content.js';
const command=process.argv[2];
if (!['migrate','seed'].includes(command)) throw new Error('Use migrate or seed');
const pool=createPool();
const db=await pool.connect();
try {if(command==='migrate')await migrate(db);else await seed(db);console.log(`${command} completed`);}finally{db.release();await pool.end();}
