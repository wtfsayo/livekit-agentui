import { NextResponse } from "next/server"

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    livekit: {
      configured: !!(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET),
    },
  })
}
