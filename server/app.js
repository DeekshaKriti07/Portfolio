import express from 'express';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';
import {fileURLToPath} from 'node:url';
const publicDir = fileURLToPath(new URL('../public',import.meta.url));
export function createApp(db, {trustProxy=false}={}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy',trustProxy);
  app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],fontSrc:["'self'",'https://fonts.gstatic.com'],imgSrc:["'self'",'data:','blob:'],mediaSrc:["'self'"],connectSrc:["'self'"],objectSrc:["'none'"],frameAncestors:["'none'"],upgradeInsecureRequests:process.env.NODE_ENV==='production'?[]:null}},crossOriginEmbedderPolicy:false,strictTransportSecurity:process.env.NODE_ENV==='production'?undefined:false}));
  app.get('/health/live',(_req,res)=>res.json({status:'ok'}));
  app.get('/health/ready',async(_req,res)=>{
    try { const {rows}=await db.query('SELECT COUNT(*)::int AS count FROM projects'); if (!rows[0].count) return res.status(503).json({status:'not-ready'}); res.json({status:'ready'}); }
    catch {res.status(503).json({status:'not-ready'});}
  });
  app.use('/api',rateLimit({windowMs:60000,limit:120,standardHeaders:'draft-8',legacyHeaders:false}));
  app.use('/api',(_req,res,next)=>{res.set('Cache-Control','no-store');next();});
  app.get('/api/projects',async(_req,res,next)=>{try { const {rows}=await db.query('SELECT content FROM projects ORDER BY position, slug');res.json({projects:rows.map(r=>r.content)}); } catch(error) {next(error);} });
  app.get('/api/projects/:slug',async(req,res,next)=>{
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(req.params.slug)) return res.status(400).json({error:'Invalid project identifier'});
    try {const {rows}=await db.query('SELECT content FROM projects WHERE slug = $1',[req.params.slug]);if (!rows.length) return res.status(404).json({error:'Project not found'});res.json(rows[0].content);}catch(error){next(error);}
  });
  app.use('/api',(_req,res)=>res.status(404).json({error:'Endpoint not found'}));
  app.use(express.static(publicDir,{dotfiles:'deny',maxAge:0,setHeaders(res,path){res.setHeader('Cache-Control',/\.(webp|jpg|png|pdf|mp4|svg)$/.test(path)?'public, max-age=86400':'public, max-age=0, must-revalidate');}}));
  app.use((_req,res)=>res.status(404).type('html').send('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Page not found</title><body><h1>Page not found</h1><p><a href="/">Return to Deeksha’s portfolio</a></p></body></html>'));
  app.use((error,_req,res,_next)=>{console.error('Request failed:',error.code || error.name);const status=Number.isInteger(error.status)&&error.status>=400&&error.status<500?error.status:503;res.status(status).json({error:status<500?'Invalid request':'Temporarily unavailable'});});
  return app;
}
