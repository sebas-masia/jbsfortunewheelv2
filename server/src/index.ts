import express, { Request, Response } from 'express';
import cors from 'cors';
import { Database } from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 3001;

// Update CORS configuration to allow requests from your Vercel domain
const allowedOrigins = [
  'http://localhost:3000',
  'https://pizza-wheel.vercel.app', // Add your Vercel domain
  process.env.FRONTEND_URL // This will be used if you set it in environment variables
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

const db = new Database('spins.db');

interface Spin {
  id: string;
  orderNumber: string;
  customerName: string;
  cedula: string;
  sucursal: string;
  award: string;
  createdAt?: string;
}

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS spins (
    id TEXT PRIMARY KEY,
    orderNumber TEXT NOT NULL,
    customerName TEXT NOT NULL,
    cedula TEXT NOT NULL,
    sucursal TEXT NOT NULL,
    award TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add new spin
app.post('/api/spins', (req: Request, res: Response) => {
  const { orderNumber, customerName, cedula, sucursal, award } = req.body as Spin;
  const id = uuidv4();

  db.run(
    'INSERT INTO spins (id, orderNumber, customerName, cedula, sucursal, award) VALUES (?, ?, ?, ?, ?, ?)',
    [id, orderNumber, customerName, cedula, sucursal, award],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id, orderNumber, customerName, cedula, sucursal, award });
    }
  );
});

// Get all spins
app.get('/api/spins', (_: Request, res: Response) => {
  db.all('SELECT * FROM spins ORDER BY createdAt DESC', (err, rows: Spin[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add this new endpoint
app.get("/api/spins/:orderNumber", (req, res) => {
  const { orderNumber } = req.params;
  
  db.get('SELECT * FROM spins WHERE orderNumber = ?', [orderNumber], (err, row) => {
    if (err) {
      console.error("Error fetching spin:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    
    if (!row) {
      return res.status(404).json({ message: "Spin not found" });
    }
    
    res.json(row);
  });
});

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
}); 