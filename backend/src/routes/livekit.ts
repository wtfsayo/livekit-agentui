import { Router } from 'express'
import { AccessToken } from 'livekit-server-sdk'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { roomName, participantName } = req.body

    if (!roomName || !participantName) {
      return res.status(400).json({ 
        error: "Room name and participant name are required" 
      })
    }

    // These should be environment variables
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ 
        error: "LiveKit credentials not configured" 
      })
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: "1h",
    })

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    const jwt = await token.toJwt()

    res.json({ token: jwt })
  } catch (error) {
    console.error("Error generating token:", error)
    res.status(500).json({ error: "Failed to generate token" })
  }
})

export default router