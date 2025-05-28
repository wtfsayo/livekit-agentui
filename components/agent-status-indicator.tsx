"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Wifi, WifiOff, AlertCircle } from "lucide-react"
import { useConnectionState, useRoomInfo } from "@livekit/components-react"
import { ConnectionQuality } from "livekit-client"

interface AgentStatusIndicatorProps {
  isConnected: boolean
  agentState?: string
}

export default function AgentStatusIndicator({ isConnected, agentState }: AgentStatusIndicatorProps) {
  const connectionState = useConnectionState()
  const roomInfo = useRoomInfo()
  
  const getQualityText = () => {
    if (!isConnected) return "unknown"
    
    // Use connection state to determine quality
    switch (connectionState) {
      case "connected":
        return "excellent"
      case "connecting":
        return "good"
      case "reconnecting":
        return "poor"
      case "disconnected":
        return "lost"
      default:
        return "unknown"
    }
  }
  
  const qualityText = getQualityText()

  const getConnectionIcon = () => {
    if (!isConnected) return <WifiOff className="w-4 h-4 text-red-400" />

    switch (qualityText) {
      case "excellent":
        return <Wifi className="w-4 h-4 text-green-400" />
      case "good":
        return <Wifi className="w-4 h-4 text-yellow-400" />
      case "poor":
        return <AlertCircle className="w-4 h-4 text-orange-400" />
      case "lost":
        return <WifiOff className="w-4 h-4 text-red-400" />
      default:
        return <Wifi className="w-4 h-4 text-gray-400" />
    }
  }

  const getConnectionText = () => {
    if (!isConnected) return "Disconnected"
    return `${qualityText.charAt(0).toUpperCase() + qualityText.slice(1)} Connection`
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Bot className="w-5 h-5 text-blue-400" />
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Network</span>
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <span className="text-sm text-gray-300">{getConnectionText()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Agent</span>
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className={isConnected ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-600 text-gray-300"}
          >
            {isConnected ? "Online" : "Offline"}
          </Badge>
        </div>

        {agentState && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">State</span>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {agentState}
            </Badge>
          </div>
        )}

        {isConnected && roomInfo && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Room</span>
            <Badge variant="outline" className="border-gray-600 text-gray-300 font-mono text-xs">
              {roomInfo.name}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
