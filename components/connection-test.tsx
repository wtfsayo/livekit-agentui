"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Wifi, Mic, Volume2 } from "lucide-react"

interface ConnectionTestProps {
  onTestComplete: (success: boolean) => void
}

export default function ConnectionTest({ onTestComplete }: ConnectionTestProps) {
  const [tests, setTests] = useState({
    microphone: { status: "pending", message: "" },
    speakers: { status: "pending", message: "" },
    network: { status: "pending", message: "" },
  })
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)

    // Test microphone access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setTests((prev) => ({
        ...prev,
        microphone: { status: "success", message: "Microphone access granted" },
      }))
      stream.getTracks().forEach((track) => track.stop())
    } catch (error) {
      setTests((prev) => ({
        ...prev,
        microphone: { status: "error", message: "Microphone access denied" },
      }))
    }

    // Test speakers (basic audio context)
    try {
      const audioContext = new AudioContext()
      await audioContext.resume()
      setTests((prev) => ({
        ...prev,
        speakers: { status: "success", message: "Audio output available" },
      }))
      audioContext.close()
    } catch (error) {
      setTests((prev) => ({
        ...prev,
        speakers: { status: "error", message: "Audio output unavailable" },
      }))
    }

    // Test network connectivity
    try {
      const response = await fetch("/api/health", { method: "HEAD" })
      if (response.ok) {
        setTests((prev) => ({
          ...prev,
          network: { status: "success", message: "Network connection stable" },
        }))
      } else {
        throw new Error("Network test failed")
      }
    } catch (error) {
      setTests((prev) => ({
        ...prev,
        network: { status: "error", message: "Network connection issues" },
      }))
    }

    setIsRunning(false)

    // Check if all tests passed
    const allPassed = Object.values(tests).every((test) => test.status === "success")
    onTestComplete(allPassed)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "pending":
        return <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
    }
  }

  const getTestIcon = (testType: string) => {
    switch (testType) {
      case "microphone":
        return <Mic className="w-4 h-4 text-gray-300" />
      case "speakers":
        return <Volume2 className="w-4 h-4 text-gray-300" />
      case "network":
        return <Wifi className="w-4 h-4 text-gray-300" />
      default:
        return null
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          Connection Test
          <Badge variant="outline" className="border-gray-600 text-gray-300">
            Pre-flight Check
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {Object.entries(tests).map(([testType, result]) => (
            <div key={testType} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 flex-1">
                {getTestIcon(testType)}
                <span className="font-medium capitalize text-white">{testType}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <span className="text-sm text-gray-300">{result.message}</span>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={runTests} disabled={isRunning} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            "Run Connection Test"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
