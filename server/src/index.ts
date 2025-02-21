import express, { Request, Response } from 'express';
import cors from 'cors';
import { Database } from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log('Email config:', {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD?.substring(0, 3) + '...' // Only log first 3 chars for security
});

const app = express();
const port = process.env.PORT || 3001;

// Update CORS configuration to allow requests from your Vercel domain
const allowedOrigins = [
  'http://localhost:3000',
  'https://pizza-wheel.vercel.app', // Add your Vercel domain
  'https://jbsfortunewheelv2.vercel.apps',
  process.env.FRONTEND_URL // This will be used if you set it in environment variables
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: (origin, callback) => {
    console.log('Request origin:', origin);
    
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      return callback(null, true);
    }
 
    // Check if the origin is in our allowed list
    const isAllowed = allowedOrigins.some((allowedOrigin?: string) => 
      allowedOrigin ? origin.toLowerCase() === allowedOrigin.toLowerCase() : false
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

const db = new Database('spins2.db');

interface Spin {
  id: string;
  customerName: string;
  cedula: string;
  email: string;
  phoneNumber: string;
  sucursal: string;
  award: string;
  isSpecialPrize?: boolean;
  isDisbursed: boolean;
  createdAt?: string;
}

// Only create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS spins (
    id TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    cedula TEXT NOT NULL,
    email TEXT NOT NULL,
    phoneNumber TEXT NOT NULL,
    sucursal TEXT NOT NULL,
    award TEXT NOT NULL,
    isSpecialPrize BOOLEAN DEFAULT 0,
    isDisbursed BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Replace the email transporter configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // You'll need to replace this with your actual SMTP server
  port: 587, // This port might be different for your provider
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Add this to test the connection when server starts
transporter.verify(function (error, success) {
  if (error) {
    console.log("Email server error:", error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});

// Modify the POST /api/spins endpoint
app.post('/api/spins', (req: Request, res: Response) => {
  const { customerName, cedula, email, phoneNumber, sucursal, award, isSpecialPrize } = req.body as Spin;
  const id = uuidv4();

  db.run(
    'INSERT INTO spins (id, customerName, cedula, email, phoneNumber, sucursal, award, isSpecialPrize, isDisbursed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, customerName, cedula, email, phoneNumber, sucursal, award, isSpecialPrize ? 1 : 0, 0],
    async (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Send email if prize was won (not "Intenta de nuevo")
      if (award !== "Intenta de nuevo") {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '¡Felicitaciones por tu premio en JBs!',
            html: `
              <h2>¡Felicitaciones ${customerName}!</h2>
              <p>Has ganado: ${award}</p>
              <p>Puedes reclamar tu premio en nuestra sucursal de ${sucursal} presentando este correo y tu factura.</p>
              <p>Número de referencia: ${id}</p>
              <br>
              <p>¡Gracias por participar!</p>
            `
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          // Don't fail the request if email fails
        }
      }

      res.status(201).json({ 
        id, 
        customerName, 
        cedula, 
        email, 
        phoneNumber, 
        sucursal, 
        award,
        isSpecialPrize,
        isDisbursed: false 
      });
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
    // Convert SQLite boolean (0/1) to actual booleans
    const formattedRows = rows.map(row => ({
      ...row,
      isSpecialPrize: !!row.isSpecialPrize,
      isDisbursed: !!row.isDisbursed
    }));
    res.json(formattedRows);
  });
});

// Replace orderNumber endpoint with cedula endpoint
app.get("/api/spins/cedula/:cedula", (req, res) => {
  const { cedula } = req.params;
  
  db.get('SELECT * FROM spins WHERE cedula = ?', [cedula], (err, row: any) => {
    if (err) {
      console.error("Error fetching spin:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    
    if (!row) {
      return res.status(404).json({ message: "Spin not found" });
    }
    
    const formattedRow = {
      ...row,
      isSpecialPrize: !!row.isSpecialPrize,
      isDisbursed: !!row.isDisbursed
    };
    
    res.json(formattedRow);
  });
});

// Add endpoint to check special prize availability
app.get("/api/spins/special-prize", (_, res) => {
  db.get('SELECT COUNT(*) as count FROM spins WHERE isSpecialPrize = 1', (err, row: { count: number }) => {
    if (err) {
      console.error("Error checking special prize:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    
    res.json({ awarded: row.count > 0 });
  });
});

// Add endpoint to update disbursement status
app.patch("/api/spins/:id/disburse", (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE spins SET isDisbursed = 1 WHERE id = ?', [id], (err) => {
    if (err) {
      console.error("Error updating disbursement status:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    
    res.json({ message: "Disbursement status updated successfully" });
  });
});

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
}); 