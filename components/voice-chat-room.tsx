"use client"

import { useState, useEffect } from "react"
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react"
import { Track } from "livekit-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, User, Bot, Loader2 } from "lucide-react"
import AgentStatusIndicator from "@/components/agent-status-indicator"
import ConversationTranscript from "@/components/conversation-transcript"
import AudioVisualizer from "@/components/audio-visualizer"

interface VoiceChatRoomProps {
  token: string
  roomName: string
  onDisconnect: () => void
}

function VoiceAssistantControls({ onDisconnect }: { onDisconnect: () => void }) {
  const { state, audioTrack } = useVoiceAssistant()
  const { localParticipant } = useLocalParticipant()
  const [isMuted, setIsMuted] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)

  // Sync mute state with actual microphone state
  useEffect(() => {
    if (localParticipant) {
      const updateMuteState = () => {
        const micTrack = localParticipant.getTrackPublication(Track.Source.Microphone)
        if (micTrack) {
          setIsMuted(micTrack.isMuted)
        }
      }

      // Initial sync
      updateMuteState()

      // Listen for track mute/unmute events
      localParticipant.on('trackMuted', updateMuteState)
      localParticipant.on('trackUnmuted', updateMuteState)

      return () => {
        localParticipant.off('trackMuted', updateMuteState)
        localParticipant.off('trackUnmuted', updateMuteState)
      }
    }
  }, [localParticipant])

  const toggleMute = async () => {
    try {
      // When muted, enable microphone (unmute)
      // When not muted, disable microphone (mute)
      const shouldEnable = isMuted
      await localParticipant.setMicrophoneEnabled(shouldEnable)
      // Don't manually set state here - let the event listener handle it
      // setIsMuted(!shouldEnable)
    } catch (error) {
      console.error("Failed to toggle microphone:", error)
      // On error, revert the state
      setIsMuted(isMuted)
    }
  }

  const toggleAudio = async () => {
    try {
      // Toggle audio output (speakers)
      const shouldEnable = !isAudioEnabled
      // This would typically control the audio output/speakers
      // For now, we'll just update the state
      setIsAudioEnabled(shouldEnable)
    } catch (error) {
      console.error("Failed to toggle audio:", error)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <User className="w-5 h-5" />
          Voice Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="lg"
            onClick={toggleMute}
            className="flex flex-col gap-1 h-auto py-3 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-xs">{isMuted ? "Unmute" : "Mute"}</span>
          </Button>

          <Button
            variant={isAudioEnabled ? "outline" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="flex flex-col gap-1 h-auto py-3 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-xs">{isAudioEnabled ? "Audio On" : "Audio Off"}</span>
          </Button>

          <Button variant="destructive" size="lg" onClick={onDisconnect} className="flex flex-col gap-1 h-auto py-3">
            <PhoneOff className="w-5 h-5" />
            <span className="text-xs">Disconnect</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ParticipantsList() {
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: false })

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white">Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tracks.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-4">No participants connected yet</div>
          ) : (
            tracks.map((track) => (
              <div key={track.participant.identity} className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
                  {track.participant.identity.includes("agent") ? (
                    <Bot className="w-4 h-4 text-blue-400" />
                  ) : (
                    <User className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-white">
                    {track.participant.identity.includes("agent") ? "AI Agent" : "You"}
                  </div>
                  <div className="text-xs text-gray-400">{track.participant.identity}</div>
                </div>
                <div className="flex items-center gap-1">
                  {track.publication?.isMuted ? (
                    <MicOff className="w-4 h-4 text-red-400" />
                  ) : (
                    <Mic className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function VoiceChatContent({ onDisconnect }: { onDisconnect: () => void }) {
  const { state } = useVoiceAssistant()
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: true })
  
  // Get the first available audio track for visualization
  const activeAudioTrack = tracks.find(track => track.publication?.track)?.publication?.track

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6">
        <AgentStatusIndicator isConnected={true} agentState={state} />
        <VoiceAssistantControls onDisconnect={onDisconnect} />
        {/* Audio Visualizer */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Audio Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <AudioVisualizer 
              audioStream={activeAudioTrack?.mediaStream} 
              isActive={tracks.length > 0}
              className="rounded-lg"
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <ParticipantsList />
      </div>
      <div>
        <ConversationTranscript isRecording={true} />
      </div>
    </div>
  )
}

export default function VoiceChatRoom({ token, roomName, onDisconnect }: VoiceChatRoomProps) {
  const [wsURL] = useState(process.env.NEXT_PUBLIC_LIVEKIT_URL || "")
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [error, setError] = useState<string>("")

  if (!wsURL) {
    return (
      <Card className="mb-6 bg-red-900/20 border-red-800">
        <CardContent className="p-4">
          <div className="text-red-400 text-sm">
            LiveKit server URL not configured. Please check your environment variables.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Voice Agent Chat</h1>
        <p className="text-gray-400">
          Connected to room: <span className="font-mono text-blue-400">{roomName}</span>
        </p>
      </div>

      {connectionState === "connecting" && (
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardContent className="flex items-center gap-3 p-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <span className="text-gray-300">Connecting to voice chat...</span>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-6 bg-red-900/20 border-red-800">
          <CardContent className="p-4">
            <div className="text-red-400 text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      <LiveKitRoom
        video={false}
        audio={true}
        token={token}
        serverUrl={wsURL}
        data-lk-theme="default"
        style={{ height: "0px" }}
        onDisconnected={onDisconnect}
        onConnected={() => {
          setConnectionState("connected")
          setError("")
        }}
        onError={(error) => {
          setError(`Connection error: ${error.message}`)
        }}
      >
        <VoiceChatContent onDisconnect={onDisconnect} />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
