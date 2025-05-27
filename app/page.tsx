"use client"

import { useState } from "react"
import VoiceChatRoom from "@/components/voice-chat-room"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mic, Phone, Settings, Loader2 } from "lucide-react"
import ConnectionTest from "@/components/connection-test"
import VoiceSettings from "@/components/voice-settings"
import QuickStartGuide from "@/components/quick-start-guide"

export default function VoiceChatPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [roomName, setRoomName] = useState("voice-agent-room")
  const [token, setToken] = useState("")
  const [participantName, setParticipantName] = useState("user-" + Math.random().toString(36).substr(2, 9))
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  const [error, setError] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [testPassed, setTestPassed] = useState(false)

  const handleConnect = async () => {
    if (!roomName || !participantName) return

    setIsGeneratingToken(true)
    setError("")

    try {
      const response = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, participantName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate token")
      }

      setToken(data.token)
      setIsConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect")
    } finally {
      setIsGeneratingToken(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setToken("")
  }

  if (isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <VoiceChatRoom token={token} roomName={roomName} onDisconnect={handleDisconnect} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Mic className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-2xl text-white">Voice Agent Chat</CardTitle>
          <CardDescription className="text-gray-400">
            Connect to start a voice conversation with an AI agent
          </CardDescription>
        </CardHeader>
        {showSettings && (
          <div className="space-y-4 mb-6 p-4">
            <QuickStartGuide currentStep={testPassed ? 2 : 1} />
            <ConnectionTest onTestComplete={setTestPassed} />
            <VoiceSettings />
          </div>
        )}
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="participant-name" className="text-gray-300">
                Your Name
              </Label>
              <Input
                id="participant-name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-name" className="text-gray-300">
                Room Name
              </Label>
              <Input
                id="room-name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            {error && (
              <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded border border-red-800">{error}</div>
            )}
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showSettings ? "Hide" : "Show"} Settings
            </Button>
            <Button
              onClick={handleConnect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!roomName || !participantName || isGeneratingToken}
            >
              {isGeneratingToken ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Connect to Agent
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
