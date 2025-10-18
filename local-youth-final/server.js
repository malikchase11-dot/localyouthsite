import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const connectionString = process.env.DATABASE_URL;
if(!connectionString){
  console.error('ERROR: DATABASE_URL is not set in environment variables.');
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

app.get('/api/profiles', async (req, res)=>{
  try{const r = await pool.query('SELECT id, name, role, image_url, bio FROM profiles ORDER BY id DESC');res.json(r.rows);}catch(e){console.error(e);res.status(500).json({error:'db error'});} });

app.get('/api/profiles/:id', async (req, res)=>{ try{const r=await pool.query('SELECT * FROM profiles WHERE id=$1',[req.params.id]);res.json(r.rows[0]||{});}catch(e){console.error(e);res.status(500).json({error:'db error'});} });

app.post('/api/profiles', async (req, res)=>{ try{const {name,role,image_url,bio}=req.body;const r=await pool.query('INSERT INTO profiles (name, role, image_url, bio) VALUES ($1,$2,$3,$4) RETURNING *',[name,role,image_url,bio]);res.status(201).json(r.rows[0]);}catch(e){console.error(e);res.status(500).json({error:'db error'});} });

app.put('/api/profiles/:id', async (req, res)=>{ try{const {name,role,image_url,bio}=req.body;const r=await pool.query('UPDATE profiles SET name=$1, role=$2, image_url=$3, bio=$4 WHERE id=$5 RETURNING *',[name,role,image_url,bio,req.params.id]);res.json(r.rows[0]);}catch(e){console.error(e);res.status(500).json({error:'db error'});} });

app.delete('/api/profiles/:id', async (req, res)=>{ try{await pool.query('DELETE FROM profiles WHERE id=$1',[req.params.id]);res.json({message:'deleted'});}catch(e){console.error(e);res.status(500).json({error:'db error'});} });

// Serve index.html for all other routes (fix for Render)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('Server running on port', port));