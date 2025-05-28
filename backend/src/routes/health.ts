import { Router } from 'express'

const router = Router()

router.head('/', (req, res) => {
  res.status(200).end()
})

router.get('/', (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    livekit: {
      configured: !!(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET),
    },
  })
})

export default router