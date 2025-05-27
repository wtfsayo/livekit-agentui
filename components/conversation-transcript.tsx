"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Download, Trash2, User, Bot } from "lucide-react"

interface TranscriptMessage {
  id: string
  speaker: "user" | "agent"
  message: string
  timestamp: Date
}

interface ConversationTranscriptProps {
  isRecording?: boolean
}

export default function ConversationTranscript({ isRecording = false }: ConversationTranscriptProps) {
  const [messages, setMessages] = useState<TranscriptMessage[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Simulate transcript messages (in a real app, this would come from speech recognition)
  useEffect(() => {
    if (!isRecording) return

    const interval = setInterval(() => {
      const sampleMessages = [
        { speaker: "user" as const, message: "Hello, can you help me with my project?" },
        {
          speaker: "agent" as const,
          message:
            "Of course! I'd be happy to help you with your project. What specific area would you like assistance with?",
        },
        { speaker: "user" as const, message: "I need help setting up a voice chat application." },
        {
          speaker: "agent" as const,
          message:
            "Great choice! Voice chat applications are very useful. Let me guide you through the process step by step.",
        },
      ]

      const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)]

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...randomMessage,
          timestamp: new Date(),
        },
      ])
    }, 8000)

    return () => clearInterval(interval)
  }, [isRecording])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const clearTranscript = () => {
    setMessages([])
  }

  const downloadTranscript = () => {
    const transcript = messages
      .map(
        (msg) => `[${msg.timestamp.toLocaleTimeString()}] ${msg.speaker === "user" ? "You" : "Agent"}: ${msg.message}`,
      )
      .join("\n")

    const blob = new Blob([transcript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `conversation-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Conversation Transcript
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTranscript}
              disabled={messages.length === 0}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:text-gray-500"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearTranscript}
              disabled={messages.length === 0}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:text-gray-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                {isRecording ? "Conversation will appear here..." : "Start a conversation to see transcript"}
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {message.speaker === "user" ? (
                      <User className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white">
                        {message.speaker === "user" ? "You" : "Agent"}
                      </span>
                      <span className="text-xs text-gray-400">{message.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-gray-300">{message.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
