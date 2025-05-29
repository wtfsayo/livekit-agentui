import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health'
import livekitRouter from './routes/livekit'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/health', healthRouter)
app.use('/api/livekit-token', livekitRouter)

// Health check for root
app.get('/', (req, res) => {
  res.json({ 
    message: 'LiveKit Agent UI Backend',
    status: 'running',
    version: '1.0.0'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
})