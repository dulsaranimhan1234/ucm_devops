const express = require('express');
const cors = require('cors');
require('dotenv').config();

const requiredConfig = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
const missingConfig = requiredConfig.filter((name) => !process.env[name]);
if (missingConfig.length) {
  throw new Error(`Missing required environment variables: ${missingConfig.join(', ')}`);
}

const dbPort = Number(process.env.DB_PORT || 3306);
if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
  throw new Error('DB_PORT must be an integer between 1 and 65535.');
}

const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors());
app.get('/', (req, res) => res.send('University Club Management Backend is running...'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use((req,res)=>res.status(404).json({message:'API route not found.'}));
const PORT = process.env.PORT || 5000;
db.ready.then(()=>app.listen(PORT,()=>console.log(`Server is running on port ${PORT}`))).catch((err)=>{console.error('Server startup failed:',err.message);process.exitCode=1;});
