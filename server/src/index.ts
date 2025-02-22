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

const db = new Database('spins3.db');

interface Spin {
  id: string;
  customerName: string;
  cedula: string;
  email: string;
  phoneNumber: string;
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
  const { customerName, cedula, email, phoneNumber, award, isSpecialPrize } = req.body as Spin;
  const id = uuidv4();

  db.run(
    'INSERT INTO spins (id, customerName, cedula, email, phoneNumber, award, isSpecialPrize, isDisbursed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, customerName, cedula, email, phoneNumber, award, isSpecialPrize ? 1 : 0, 0],
    async (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Send email if prize was won (not "Intenta de nuevo")
      if (award !== "Intenta de nuevo") {
        try {
          await transporter.sendMail({
            from: `"JBs Rewards" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '¡Felicitaciones por tu premio en JBs! 🎉',
            attachments: [{
              filename: 'Logo.png',
              path: './public/Logo.png', // Adjust this path to where your logo is stored
              cid: 'logo' // Content ID for referencing in the HTML
            }],
            html: `
              <div style="background-color: #000000; color: white; font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="cid:logo" alt="JBs Logo" style="max-width: 200px;">
                </div>
                
                <h2 style="font-size: 32px; text-transform: uppercase; margin: 0 0 20px 0; text-align: center; color: white;">¡Felicitaciones ${customerName}!</h2>
                
                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="font-size: 24px; text-align: center; margin: 0; color: #e1261c;">Has ganado: <strong>${award}</strong></p>
                </div>

                <div style="margin: 30px 0; line-height: 1.6;">
                  <p style="margin: 10px 0;">Para reclamar tu premio:</p>
                  <ul style="list-style: none; padding: 0; margin: 20px 0;">
                    <li style="margin: 10px 0;">✅ Visita cualquier sucursal de JBs</li>
                    <li style="margin: 10px 0;">✅ Presenta este correo</li>
                    <li style="margin: 10px 0;">✅ Muestra tu cedula</li>
                  </ul>
                </div>

                <div style="background: #e1261c; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold;">Número de referencia: ${id}</p>
                </div>

                <p style="color: #ff9999; font-size: 14px; text-align: center; margin-top: 30px;">⚠️ Este premio es válido hasta el 31 de marzo de 2025</p>

                <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
                  <p style="margin: 0;">¡Gracias por participar!</p>
                </div>
              </div>
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