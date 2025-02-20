# Your New Project Name

## Deployment Instructions

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables:
   - PORT: 3001 (or any port)
   - FRONTEND_URL: Your frontend URL

### Frontend (Vercel/Netlify)

1. Create a new project
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set environment variables:
   - VITE_API_URL: Your backend URL

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   cd server && npm install
   cd client && npm install
   ```
3. Start development servers:
   ```bash
   # Terminal 1
   cd server && npm run dev
   # Terminal 2
   cd client && npm run dev
   ```
